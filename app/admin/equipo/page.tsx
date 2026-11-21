"use client";
// Equipo (conductores y coordinadores) y buses.
import { Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { errorText, useM, useQ } from "@/components/session";
import { Badge, Button, Card, Empty, Field, Modal, PageHeader, Spinner, inputClass, useToast } from "@/components/ui";

type Team = NonNullable<(typeof api.team.list)["_returnType"]>;
type Member = Team["members"][number];
type Vehicle = Team["vehicles"][number];
type Dialog = { kind: "member"; member?: Member } | { kind: "vehicle"; vehicle?: Vehicle } | null;

export default function Equipo() {
  const team = useQ(api.team.list, {});
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  if (!team) return <Spinner />;
  const drivers = team.members.filter((m) => m.role === "driver");
  const admins = team.members.filter((m) => m.role === "admin");

  return (
    <>
      <PageHeader title="Equipo y buses" subtitle="Quien opera el viaje entra con su correo desde el celular.">
        <Button variant="secondary" onClick={() => setDialog({ kind: "vehicle" })}><Plus className="size-4" /> Bus</Button>
        <Button onClick={() => setDialog({ kind: "member" })}><Plus className="size-4" /> Persona</Button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Conductores</h2>
          {!drivers.length ? (
            <Empty title="Sin conductores" text="Agrega a quien lleva el celular en el bus: conductor o monitor." />
          ) : (
            <Card className="divide-y divide-line/70">{drivers.map((m) => <MemberRow key={m._id} member={m} onClick={() => setDialog({ kind: "member", member: m })} />)}</Card>
          )}
          <h2 className="mb-2 mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted">Coordinadores</h2>
          <Card className="divide-y divide-line/70">{admins.map((m) => <MemberRow key={m._id} member={m} onClick={() => setDialog({ kind: "member", member: m })} />)}</Card>
        </section>
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Buses</h2>
          {!team.vehicles.length ? (
            <Empty title="Sin buses" text="Registra cada bus con su capacidad para vigilar el cupo de las rutas." />
          ) : (
            <Card className="divide-y divide-line/70">
              {team.vehicles.map((v) => (
                <button key={v._id} type="button" onClick={() => setDialog({ kind: "vehicle", vehicle: v })} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper/60">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{v.name}</p>
                    <p className="text-xs text-muted">{v.plate || "Sin placa"} · {v.capacity} puestos</p>
                  </div>
                  {!v.active && <Badge>Inactivo</Badge>}
                </button>
              ))}
            </Card>
          )}
        </section>
      </div>
      <Modal open={dialog?.kind === "member"} onClose={close} title={dialog?.kind === "member" && dialog.member ? "Editar persona" : "Nueva persona"}>
        {dialog?.kind === "member" && <MemberForm member={dialog.member} onDone={close} />}
      </Modal>
      <Modal open={dialog?.kind === "vehicle"} onClose={close} title={dialog?.kind === "vehicle" && dialog.vehicle ? "Editar bus" : "Nuevo bus"}>
        {dialog?.kind === "vehicle" && <VehicleForm vehicle={dialog.vehicle} onDone={close} />}
      </Modal>
    </>
  );
}

function MemberRow({ member, onClick }: { member: Member; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper/60">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{member.name}</p>
        <p className="truncate text-xs text-muted">{member.email}{member.phone ? ` · ${member.phone}` : ""}</p>
      </div>
      {!member.active ? <Badge>Inactivo</Badge> : !member.joined ? <Badge tone="warn">Aún no entra</Badge> : null}
    </button>
  );
}

function MemberForm({ member, onDone }: { member?: Member; onDone: () => void }) {
  const save = useM(api.team.saveMember);
  const toast = useToast();
  const [form, setForm] = useState({
    name: member?.name ?? "", email: member?.email ?? "", phone: member?.phone ?? "",
    role: (member?.role === "admin" ? "admin" : "driver") as "admin" | "driver", active: member?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await save({ id: member?._id, ...form, phone: form.phone || undefined });
      toast(member ? "Cambios guardados" : "Persona agregada. Le enviamos un correo de bienvenida.");
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nombre"><input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Correo" hint="Con este correo entra a Abordo."><input className={inputClass} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Teléfono" hint="Las familias lo ven para llamar al conductor."><input className={inputClass} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      <Field label="Rol">
        <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "driver" })}>
          <option value="driver">Conductor o monitor</option>
          <option value="admin">Coordinador</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-ink" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo
      </label>
      {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={busy}>Guardar</Button>
    </form>
  );
}

function VehicleForm({ vehicle, onDone }: { vehicle?: Vehicle; onDone: () => void }) {
  const save = useM(api.team.saveVehicle);
  const toast = useToast();
  const [form, setForm] = useState({ name: vehicle?.name ?? "", plate: vehicle?.plate ?? "", capacity: vehicle?.capacity ?? 20, active: vehicle?.active ?? true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await save({ id: vehicle?._id, ...form });
      toast("Bus guardado");
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nombre o número"><input className={inputClass} required placeholder="Bus 3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Placa"><input className={inputClass} value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} /></Field>
        <Field label="Capacidad"><input className={inputClass} type="number" min={1} max={100} required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-ink" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo
      </label>
      {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
      <Button type="submit" size="lg" className="w-full" loading={busy}>Guardar</Button>
    </form>
  );
}
