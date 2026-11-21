"use client";
// Consola del dueño de la plataforma: colegios, estado de pago y pagos por transferencia.
import { LogOut } from "lucide-react";
import { useState } from "react";
import { api, errorText, useM, useQ, useRole, useSession } from "@/components/session";
import { Badge, Button, Card, Empty, Field, Logo, Modal, Spinner, type Tone, inputClass, useToast } from "@/components/ui";

type School = NonNullable<(typeof api.owner.schools)["_returnType"]>[number];
const money = (pesos: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(pesos);
const day = (at: number) => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" }).format(at);
const STATUS: Record<string, { label: string; tone: Tone }> = {
  trial: { label: "Prueba", tone: "brand" },
  active: { label: "Activa", tone: "ok" },
  past_due: { label: "En mora", tone: "warn" },
  suspended: { label: "Suspendida", tone: "bad" },
  cancelled: { label: "Cancelada", tone: "neutral" },
};

export default function Plataforma() {
  const me = useRole("owner");
  const { signOut } = useSession();
  const schools = useQ(api.owner.schools, me ? {} : "skip");
  const [editing, setEditing] = useState<School | null>(null);
  const [paying, setPaying] = useState<School | null>(null);
  if (!me || !schools) return <Spinner className="min-h-dvh" />;
  const revenue = schools.filter((s) => s.status === "active").reduce((sum, s) => sum + s.monthly, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <header className="mb-10 flex items-center justify-between">
        <Logo />
        <button type="button" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión" className="grid size-10 place-items-center rounded-full hover:bg-ink/6">
          <LogOut className="size-[18px]" strokeWidth={1.75} />
        </button>
      </header>
      <h1 className="font-display text-4xl tracking-tight">Colegios</h1>
      <p className="mt-1 text-muted">
        {schools.length} registrados · {schools.reduce((n, s) => n + s.students, 0)} estudiantes en ruta · {money(revenue)} al mes en suscripciones activas
      </p>

      {!schools.length ? (
        <div className="mt-8"><Empty title="Aún no hay colegios" text="Aparecen aquí cuando se registran." /></div>
      ) : (
        <Card className="mt-8 divide-y divide-line/70">
          {schools.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted">{s.admins.join(", ") || "Sin coordinador"}</p>
              </div>
              <div className="text-right text-sm">
                <p className="tabular-nums">{s.students} est. · {money(s.monthly)}/mes</p>
                <p className="text-xs text-muted">{s.status === "trial" ? "Prueba hasta" : "Cubierto hasta"} {day(s.coveredUntil)}</p>
              </div>
              <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>Ajustar</Button>
                <Button size="sm" onClick={() => setPaying(s)}>Registrar pago</Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name ?? ""}>
        {editing && <EditForm school={editing} onDone={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!paying} onClose={() => setPaying(null)} title={`Pago de ${paying?.name ?? ""}`}>
        {paying && <PaymentForm school={paying} onDone={() => setPaying(null)} />}
      </Modal>
    </div>
  );
}

function EditForm({ school, onDone }: { school: School; onDone: () => void }) {
  const update = useM(api.owner.update);
  const toast = useToast();
  const [price, setPrice] = useState(school.pricePerStudent);
  const [status, setStatus] = useState(school.status);
  const [extend, setExtend] = useState(0);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await update({
        schoolId: school.id, pricePerStudent: price, status,
        ...(extend ? { trialEndsAt: Math.max(Date.now(), school.coveredUntil) + extend * 86400000 } : {}),
      });
      toast("Colegio actualizado");
      onDone();
    } catch (err) {
      toast(errorText(err), "bad");
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Precio por estudiante al mes (pesos, sin IVA)" hint="En 0 el colegio no se cobra ni entra en mora.">
        <input className={inputClass} type="number" min={0} step={100} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </Field>
      <Field label="Estado">
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as School["status"])}>
          {Object.entries(STATUS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Extender la prueba (días)">
        <input className={inputClass} type="number" min={0} max={365} value={extend} onChange={(e) => setExtend(Number(e.target.value))} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Guardar</Button>
    </form>
  );
}

function PaymentForm({ school, onDone }: { school: School; onDone: () => void }) {
  const record = useM(api.owner.recordPayment);
  const toast = useToast();
  const [months, setMonths] = useState(1);
  const [total, setTotal] = useState(school.monthly);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await record({ schoolId: school.id, months, total, note });
      toast("Pago registrado y suscripción extendida");
      onDone();
    } catch (err) {
      toast(errorText(err), "bad");
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">Para pagos recibidos por fuera de Wompi (transferencia o consignación).</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Meses pagados">
          <input className={inputClass} type="number" min={1} max={24} value={months} onChange={(e) => (setMonths(Number(e.target.value)), setTotal(school.monthly * Number(e.target.value)))} />
        </Field>
        <Field label="Valor recibido (pesos)">
          <input className={inputClass} type="number" min={0} value={total} onChange={(e) => setTotal(Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Nota"><input className={inputClass} maxLength={200} placeholder="Transferencia Bancolombia, comprobante 123" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Registrar pago</Button>
    </form>
  );
}
