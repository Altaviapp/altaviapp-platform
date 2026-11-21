"use client";
// Sesión del usuario y acceso a Convex. El token vive en el dispositivo y viaja en cada llamada.
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { FunctionReference } from "convex/server";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { localNow } from "@/lib/dates";
import { ToastProvider } from "./ui";

const KEY = "abordo.token";
type Me = NonNullable<(typeof api.auth.me)["_returnType"]>;
type Session = {
  token: string | null;
  me: Me | null | undefined; // undefined = cargando
  signIn: (token: string) => void;
  signOut: () => void;
};

const SessionContext = createContext<Session | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!));
  return (
    <ConvexProvider client={client}>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </ConvexProvider>
  );
}

function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  useEffect(() => setToken(localStorage.getItem(KEY)), []);
  const me = useQuery(api.auth.me, token ? { token } : "skip");
  const end = useMutation(api.auth.signOut);

  const signIn = useCallback((t: string) => {
    localStorage.setItem(KEY, t);
    setToken(t);
  }, []);
  const signOut = useCallback(() => {
    const current = localStorage.getItem(KEY);
    if (current) void end({ token: current });
    localStorage.removeItem(KEY);
    setToken(null);
  }, [end]);

  // Sesión vencida o revocada: se olvida el token.
  useEffect(() => {
    if (token && me === null) {
      localStorage.removeItem(KEY);
      setToken(null);
    }
  }, [token, me]);

  const value = useMemo<Session>(
    () => ({
      token: token ?? null,
      me: token === undefined ? undefined : token === null ? null : me,
      signIn,
      signOut,
    }),
    [token, me, signIn, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  return useContext(SessionContext)!;
}

type WithoutToken<F extends FunctionReference<"query" | "mutation">> = Omit<F["_args"], "token">;

/** useQuery que agrega el token. Con "skip" o sin sesión no consulta. */
export function useQ<F extends FunctionReference<"query">>(
  fn: F,
  args: WithoutToken<F> | "skip",
): F["_returnType"] | undefined {
  const { token, me } = useSession();
  const ready = token && me && args !== "skip";
  return useQuery(fn, (ready ? { ...args, token } : "skip") as never);
}

/** useMutation que agrega el token. */
export function useM<F extends FunctionReference<"mutation">>(fn: F) {
  const { token } = useSession();
  const run = useMutation(fn);
  return useCallback(
    (args: WithoutToken<F>): Promise<F["_returnType"]> => run({ ...args, token } as never),
    [run, token],
  );
}

/** Texto de un error para mostrar al usuario. */
export function errorText(error: unknown): string {
  if (error instanceof ConvexError && typeof error.data === "string") return error.data;
  return "Algo salió mal. Revisa tu conexión e intenta de nuevo.";
}

export const HOME = { admin: "/admin", driver: "/conductor", parent: "/familia" } as const;

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
