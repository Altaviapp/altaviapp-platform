"use client";
// Escáner de rostros del viaje. Compara en el dispositivo contra los estudiantes
// de este viaje; coincidencia clara marca sola, la dudosa pide confirmación.
import { Check, ScanFace } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { matchFace } from "@/lib/face";
import { describeFace, loadFace, openCamera } from "./face";
import { useQ } from "./session";
import { Button } from "./ui";

type Candidate = { _id: Id<"students">; name: string };
type Props = {
  tripId: Id<"trips">;
  /** Estudiantes que aún pueden marcarse con la acción actual. */
  pending: Candidate[];
  actionLabel: string; // "Subió" o "Bajó"
  onMark: (studentId: Id<"students">) => Promise<void>;
};
type State =
  | { kind: "loading" }
  | { kind: "searching" }
  | { kind: "unknown" }
  | { kind: "confirm"; student: Candidate }
  | { kind: "done"; student: Candidate }
  | { kind: "error"; text: string };

export function FaceScan({ tripId, pending, actionLabel, onMark }: Props) {
  const faces = useQ(api.faces.forTrip, { tripId });
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>({ kind: "loading" });
  // Lo último conocido, para el bucle de escaneo sin reiniciarlo en cada render.
  const live = useRef({ faces, pending, onMark, paused: false });
  live.current = { ...live.current, faces, pending, onMark };

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (cancelled) return;
      const { faces, pending, onMark, paused } = live.current;
      if (!paused && faces && video.current && video.current.readyState >= 2) {
        const descriptor = await describeFace(video.current).catch(() => null);
        if (cancelled) return;
        if (!descriptor) setState({ kind: "searching" });
        else {
          const ids = new Set<string>(pending.map((p) => p._id));
          const result = matchFace(descriptor, faces.filter((f) => ids.has(f.studentId)));
          const student = result.kind === "none" ? undefined : pending.find((p) => p._id === result.studentId);
          if (!student) setState({ kind: "unknown" });
          else if (result.kind === "match") {
            live.current.paused = true;
            try {
              await onMark(student._id);
              setState({ kind: "done", student });
            } catch {
              setState({ kind: "error", text: "No se pudo registrar. Usa la lista." });
            }
            setTimeout(() => (live.current.paused = false), 1800);
          } else {
            live.current.paused = true;
            setState({ kind: "confirm", student });
          }
        }
      }
      timer = setTimeout(tick, 500);
    };

    Promise.all([loadFace(), video.current ? openCamera(video.current, "environment") : Promise.reject()])
      .then(([, s]) => {
        if (cancelled) return s();
        stop = s;
        setState({ kind: "searching" });
        void tick();
      })
      .catch(() => setState({ kind: "error", text: "No se pudo abrir la cámara. Revisa el permiso o usa la lista." }));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stop?.();
    };
  }, []);

  const answer = async (yes: boolean) => {
    if (state.kind !== "confirm") return;
    const { student } = state;
    if (yes) {
      try {
        await onMark(student._id);
        setState({ kind: "done", student });
      } catch {
        setState({ kind: "error", text: "No se pudo registrar. Usa la lista." });
      }
    } else setState({ kind: "searching" });
    setTimeout(() => (live.current.paused = false), 1200);
  };

  const enrolled = faces ? pending.filter((p) => faces.some((f) => f.studentId === p._id)).length : 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-ink-deep">
        <video ref={video} playsInline muted className="aspect-[3/4] w-full object-cover" />
        <div className="pointer-events-none absolute inset-8 rounded-[2rem] border-2 border-paper/50" aria-hidden />
        {state.kind === "done" && (
          <div className="absolute inset-0 grid place-items-center bg-ok/85 text-paper">
            <div className="text-center">
              <Check className="mx-auto size-14" strokeWidth={1.75} />
              <p className="mt-2 font-display text-3xl">{state.student.name}</p>
              <p className="text-paper/80">{actionLabel}</p>
            </div>
          </div>
        )}
      </div>

      <div aria-live="polite" className="min-h-24">
        {state.kind === "confirm" ? (
          <div className="space-y-3">
            <p className="text-center font-display text-2xl">¿Es {state.student.name}?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="lg" onClick={() => answer(false)}>No</Button>
              <Button size="lg" onClick={() => answer(true)}>Sí, {actionLabel.toLowerCase()}</Button>
            </div>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-2 py-3 text-center text-muted">
            {state.kind !== "done" && <ScanFace className="size-5 shrink-0" strokeWidth={1.75} />}
            {state.kind === "loading" && "Preparando la cámara…"}
            {state.kind === "searching" && "Encuadra la cabeza y los hombros del estudiante."}
            {state.kind === "unknown" && "No lo reconozco. Márcalo en la lista."}
            {state.kind === "error" && state.text}
            {state.kind === "done" && "Listo. Siguiente estudiante."}
          </p>
        )}
        <p className="text-center text-xs text-muted">
          {enrolled} de {pending.length} pendientes tienen rostro registrado.
        </p>
      </div>
    </div>
  );
}
