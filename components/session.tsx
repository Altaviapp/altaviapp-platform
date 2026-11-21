"use client";
// Cliente de la API y sesión. Las consultas se guardan en memoria y se repiten solas
// cuando el servidor avisa (Server-Sent Events) que cambiaron los datos de los que dependen.
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Api } from "@/server/api";
import type { Fn } from "@/server/core";
import { localNow } from "@/lib/dates";
import { ToastProvider } from "./ui";

// ───────────── Referencias tipadas a las funciones del servidor ─────────────

export type Ref<A = unknown, R = unknown> = { name: string; _args: A; _returnType: R };
type ClientApi = { [M in keyof Api]: { [F in keyof Api[M]]: Api[M][F] extends Fn<infer A, infer R> ? Ref<A, R> : never } };

/** `api.trips.today` es solo el nombre "trips.today" con sus tipos; no trae código del servidor. */
export const api = new Proxy({} as ClientApi, {
  get: (_, module: string) => new Proxy({}, { get: (_m, fn: string) => ({ name: `${module}.${fn}` }) }),
});

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Llama una función del servidor. */
export async function callApi<A, R>(ref: Ref<A, R>, args: A): Promise<R> {
  return (await request(ref.name, args)).data as R;
}

async function request(name: string, args: unknown): Promise<{ data: unknown; tags: string[] }> {
  let res: Response;
  try {
    res = await fetch(`/api/rpc/${name}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ args }),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("Sin conexión. Revisa tu internet e intenta de nuevo.", 0);
  }
  const body = (await res.json().catch(() => ({}))) as { data?: unknown; tags?: string[]; error?: string };
  if (!res.ok) throw new ApiError(body.error ?? "Algo salió mal. Intenta de nuevo.", res.status);
  return { data: body.data, tags: body.tags ?? [] };
}

// ───────────── Caché de consultas con invalidación por etiquetas ─────────────

type Entry = { name: string; args: unknown; data: unknown; text?: string; tags: string[]; listeners: Set<() => void>; loading?: boolean };
const entries = new Map<string, Entry>();

async function load(key: string) {
  const entry = entries.get(key);
  if (!entry || entry.loading) return;
  entry.loading = true;
  try {
    const { data, tags } = await request(entry.name, entry.args);
    entry.tags = tags;
    // Si la respuesta es idéntica se conserva el objeto anterior: nada se vuelve a pintar.
    const text = JSON.stringify(data);
    if (text !== entry.text) {
      entry.text = text;
      entry.data = data;
      entry.listeners.forEach((notify) => notify());
    }
  } catch (error) {
    // Sesión vencida: se olvida todo y la app vuelve a la entrada.
    if (error instanceof ApiError && error.status === 401 && entry.name !== "auth.me") refresh(["*"]);
  } finally {
    entry.loading = false;
  }
}

/** Repite las consultas visibles que dependen de alguna de las etiquetas ("*" = todas). */
function refresh(tags: string[]) {
  for (const [key, entry] of entries) {
    if (!entry.listeners.size) continue;
    if (tags.includes("*") || entry.tags.some((tag) => tags.includes(tag))) void load(key);
  }
}

function subscribeEntry(key: string | null, name: string, args: unknown) {
  return (notify: () => void) => {
    if (!key) return () => {};
    let entry = entries.get(key);
    if (!entry) entries.set(key, (entry = { name, args, data: undefined, tags: [], listeners: new Set() }));
    entry.listeners.add(notify);
    void load(key);
    return () => {
      entry.listeners.delete(notify);
      // Sin nadie mirando se descarta, para no mostrar datos viejos al volver.
      if (!entry.listeners.size) setTimeout(() => !entry.listeners.size && entries.delete(key), 30_000);
    };
  };
}

/** Consulta en vivo. Con "skip" no consulta. Devuelve undefined mientras carga. */
export function useQ<A, R>(ref: Ref<A, R>, args: A | "skip"): R | undefined {
  const key = args === "skip" ? null : `${ref.name}:${JSON.stringify(args)}`;
  const subscribe = useMemo(() => subscribeEntry(key, ref.name, args), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return useSyncExternalStore(
    subscribe,
    () => (key ? (entries.get(key)?.data as R | undefined) : undefined),
    () => undefined,
  );
}

/**
 * Mutación. Al terminar se repiten las consultas visibles, sin esperar el aviso del servidor.
 * `quiet` lo evita para llamadas muy frecuentes (la posición del bus).
 */
export function useM<A, R>(ref: Ref<A, R>, options?: { quiet?: boolean }) {
  const quiet = options?.quiet;
  return useCallback(
    async (args: A): Promise<R> => {
      const { data } = await request(ref.name, args);
      if (!quiet) refresh(["*"]);
      return data as R;
    },
    [ref.name, quiet],
  );
}

/** Texto de un error para mostrar al usuario. */
export function errorText(error: unknown): string {
  return error instanceof ApiError ? error.message : "Algo salió mal. Revisa tu conexión e intenta de nuevo.";
}

// ───────────── Sesión ─────────────

type Me = NonNullable<ClientApi["auth"]["me"]["_returnType"]>;
type Session = {
  me: Me | null | undefined; // undefined = cargando
  /** Vuelve a leer la sesión (después de entrar con el código). */
  reload: () => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}

function SessionProvider({ children }: { children: React.ReactNode }) {
  const me = useQ(api.auth.me, {});
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const userId = me?.user.id;

  // Canal en vivo: el servidor dice qué etiquetas cambiaron.
  useEffect(() => {
    if (!userId) return;
    const source = new EventSource("/api/live");
    let opened = false;
    source.onmessage = (event) => refresh(JSON.parse(event.data) as string[]);
    // Al reconectar puede haberse perdido algún aviso: se repite todo.
    source.onopen = () => {
      if (opened) refresh(["*"]);
      opened = true;
    };
    const onVisible = () => document.visibilityState === "visible" && refresh(["*"]);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      source.close();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [userId]);

  const value = useMemo<Session>(
    () => ({
      me: mounted ? me : undefined,
      reload: () => refresh(["*"]),
      signOut: async () => {
        await request("auth.signOut", {}).catch(() => {});
        for (const entry of entries.values()) {
          entry.data = entry.name === "auth.me" ? null : undefined;
          entry.text = undefined;
          entry.listeners.forEach((notify) => notify());
        }
        refresh(["*"]);
      },
    }),
    [me, mounted],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  return useContext(SessionContext)!;
}

/** Colegio de la sesión (coordinador, conductor o familia siempre tienen uno). */
export function useSchool() {
  return useSession().me!.school!;
}

export const HOME = { admin: "/admin", driver: "/conductor", parent: "/familia", owner: "/plataforma" } as const;

/** Exige sesión con el rol dado; si no, manda a la entrada o a la vista que corresponde. */
export function useRole(role: Me["user"]["role"]): Me | null {
  const { me } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (me === null) router.replace("/");
    else if (me && me.user.role !== role) router.replace(HOME[me.user.role]);
  }, [me, role, router]);
  return me && me.user.role === role ? me : null;
}

/** Fecha de hoy y minutos del día en la zona horaria del colegio. Se actualiza cada 30 s. */
export function useNow(timezone: string | undefined) {
  const [now, setNow] = useState(() => localNow(timezone ?? "UTC"));
  useEffect(() => {
    if (!timezone) return;
    const tick = () =>
      setNow((prev) => {
        const next = localNow(timezone);
        return next.date === prev.date && next.minutes === prev.minutes ? prev : next;
      });
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [timezone]);
  return now;
}
