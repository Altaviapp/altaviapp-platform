"use client";
// Reporte de ausencia. Lo usan la familia y el coordinador.
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { addDays } from "@/lib/dates";
import { errorText, useM } from "./session";
import { Button, Field, cx, inputClass, useToast } from "./ui";

type Props = {
  students: { _id: Id<"students">; name: string }[];
  today: string;
  onDone: () => void;
};

const DIRECTIONS = [
  ["both", "Todo el día"],
  ["to_school", "Solo mañana"],
  ["from_school", "Solo tarde"],
] as const;

export function AbsenceForm({ students, today, onDone }: Props) {
  const report = useM(api.family.reportAbsence);
  const toast = useToast();
  const [studentId, setStudentId] = useState(students[0]?._id);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [direction, setDirection] = useState<(typeof DIRECTIONS)[number][0]>("both");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await report({ studentId, from, to: to < from ? from : to, direction, note: note || undefined });
      toast("Ausencia registrada. El colegio y el conductor ya lo saben.");
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {students.length > 1 && (
        <Field label="¿Quién no viaja?">
          <select className={inputClass} value={studentId} onChange={(e) => setStudentId(e.target.value as Id<"students">)}>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </Field>
      )}
      <div className="flex gap-2">
        {[["Hoy", today], ["Mañana", addDays(today, 1)]].map(([label, date]) => (
          <button
            key={label}
            type="button"
            onClick={() => (setFrom(date), setTo(date))}
            className={cx(
              "h-10 flex-1 rounded-full border text-sm font-medium",
              from === date && to === date ? "border-ink bg-ink text-paper" : "border-line bg-surface",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Desde">
          <input className={inputClass} type="date" required min={today} value={from} onChange={(e) => (setFrom(e.target.value), e.target.value > to && setTo(e.target.value))} />
        </Field>
        <Field label="Hasta">
          <input className={inputClass} type="date" required min={from} value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">¿Qué trayecto?</legend>
        <div className="grid grid-cols-3 gap-2">
          {DIRECTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={direction === value}
              onClick={() => setDirection(value)}
              className={cx(
                "h-11 rounded-full border text-sm font-medium",
                direction === value ? "border-ink bg-ink text-paper" : "border-line bg-surface",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <Field label="Nota (opcional)">
        <input className={inputClass} maxLength={200} placeholder="Cita médica, viaje…" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={busy}>Reportar ausencia</Button>
    </form>
  );
}
