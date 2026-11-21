"use client";
// Registro del rostro de un estudiante, con consentimiento explícito.
import { Camera, ImageUp, ShieldCheck, SwitchCamera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { describeFace, imageFromFile, loadFace, openCamera } from "./face";
import { api, errorText, useM } from "./session";
import { Button, useToast } from "./ui";

const SAMPLES = 3;

type Props = {
  studentId: string;
  studentName: string;
  hasFace: boolean;
  /** Quién registra: el acudiente autoriza; el colegio declara tener la autorización escrita. */
  source: "guardian" | "school";
  onDone: () => void;
};

export function FaceEnroll({ studentId, studentName, hasFace, source, onDone }: Props) {
  const enroll = useM(api.faces.enroll);
  const remove = useM(api.faces.remove);
  const toast = useToast();
  const video = useRef<HTMLVideoElement>(null);
  const [consent, setConsent] = useState(false);
  const [camera, setCamera] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [samples, setSamples] = useState<number[][]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!camera || !video.current) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void loadFace().catch(() => {});
    openCamera(video.current, facing)
      .then((s) => (cancelled ? s() : (stop = s)))
      .catch(() => {
        setMessage("No se pudo abrir la cámara. Revisa el permiso o sube fotos.");
        setCamera(false);
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [camera, facing]);

  const add = async (source: HTMLVideoElement | HTMLImageElement) => {
    const descriptor = await describeFace(source);
    if (!descriptor) {
      setMessage("No se detectó un rostro. Encuadra cabeza y hombros, de frente y con buena luz.");
      return;
    }
    setMessage("");
    setSamples((s) => [...s, descriptor].slice(0, SAMPLES));
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      await enroll({ studentId, descriptors: samples, consent: true });
      toast("Rostro registrado");
      onDone();
    });

  const first = studentName.split(" ")[0];

  if (!consent) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-2xl bg-info-soft p-4 text-sm text-ink">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-info" />
          <div className="space-y-2">
            <p>
              El reconocimiento facial permite registrar a {first} al subir y bajar del bus sin buscarlo en la lista.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-muted">
              <li>No se guardan fotos: solo un código numérico calculado en este dispositivo.</li>
              <li>Se usa únicamente para la asistencia en la ruta escolar.</li>
              <li>Es opcional. Sin registro, el conductor marca a {first} en la lista.</li>
              <li>El acudiente puede retirar la autorización cuando quiera y el registro se borra.</li>
            </ul>
          </div>
        </div>
        {hasFace && (
          <Button
            variant="secondary"
            className="w-full text-bad"
            loading={busy}
            onClick={() => run(async () => (await remove({ studentId }), toast("Registro de rostro eliminado"), onDone()))}
          >
            Retirar autorización y borrar el registro
          </Button>
        )}
        <Button size="lg" className="w-full" onClick={() => setConsent(true)}>
          {source === "guardian"
            ? `Autorizo el reconocimiento facial de ${first}`
            : "El colegio tiene la autorización escrita del acudiente"}
        </Button>
        {message && <p role="alert" className="text-sm text-bad">{message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Toma {SAMPLES} capturas de {first} de frente, con buena luz y sin gorra ni mascarilla.
      </p>
      {camera ? (
        <div className="relative overflow-hidden rounded-2xl bg-ink">
          <video ref={video} playsInline muted className="aspect-[4/3] w-full object-cover" />
          <button
            type="button"
            aria-label="Cambiar de cámara"
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/90"
          >
            <SwitchCamera className="size-5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="lg" onClick={() => setCamera(true)}>
            <Camera className="size-5" /> Usar cámara
          </Button>
          <label className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 font-medium hover:bg-paper">
            <ImageUp className="size-5" /> Subir fotos
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) =>
                run(async () => {
                  for (const file of Array.from(e.target.files ?? [])) await add(await imageFromFile(file));
                  e.target.value = "";
                })
              }
            />
          </label>
        </div>
      )}
      <div className="flex items-center gap-2" aria-label={`${samples.length} de ${SAMPLES} capturas`}>
        {Array.from({ length: SAMPLES }, (_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < samples.length ? "bg-ok" : "bg-line"}`} />
        ))}
      </div>
      {message && <p role="alert" className="rounded-2xl bg-warn-soft px-3 py-2 text-sm text-warn">{message}</p>}
      {samples.length < SAMPLES && camera && (
        <Button size="lg" className="w-full" loading={busy} onClick={() => run(() => add(video.current!))}>
          Capturar {samples.length + 1} de {SAMPLES}
        </Button>
      )}
      {samples.length > 0 && (
        <Button size="lg" className="w-full" variant={samples.length < SAMPLES ? "secondary" : "primary"} loading={busy} onClick={save}>
          Guardar registro{samples.length < SAMPLES ? ` con ${samples.length}` : ""}
        </Button>
      )}
    </div>
  );
}
