"use client";
// Editor de ruta en una sola pantalla: datos, estudiantes, paradas y mapa.
import { ArrowDown, ArrowLeft, ArrowUp, GripVertical, Plus, Search, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Map, type Pin } from "@/components/map";
import { errorText, useM, useQ, useSession } from "@/components/session";
import { Badge, Button, Card, Field, Spinner, cx, inputClass, useToast } from "@/components/ui";
import { DAY_NAMES } from "@/lib/dates";
import { distance, estimateTimes, orderStops } from "@/lib/geo";

type Direction = "to_school" | "from_school";
type Stop = { id: string; name: string; lat: number; lng: number; time: string; studentIds: Id<"students">[] };
type Form = {
  name: string; direction: Direction; days: number[]; startTime: string;
  vehicleId: Id<"vehicles"> | ""; driverId: Id<"users"> | ""; active: boolean; stops: Stop[];
};
const SAME_STOP_METERS = 40;
const newId = () => Math.random().toString(36).slice(2, 10);

export default function EditarRuta() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "nueva";
  const router = useRouter();
  const { me } = useSession();
  const school = me!.school.location;
  const routes = useQ(api.routes.list, {});
  const students = useQ(api.students.list, {});
  const team = useQ(api.team.list, {});
  const save = useM(api.routes.save);
  const remove = useM(api.routes.remove);
  const toast = useToast();
  const [form, setForm] = useState<Form | null>(
    isNew ? { name: "", direction: "to_school", days: [1, 2, 3, 4, 5], startTime: "06:30", vehicleId: "", driverId: "", active: true, stops: [] } : null,
  );
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragged, setDragged] = useState<number | null>(null);

  const route = routes?.find((r) => r._id === id);
  useEffect(() => {
    if (form || !route) return;
    setForm({
      name: route.name, direction: route.direction, days: route.days, startTime: route.startTime,
      vehicleId: route.vehicleId ?? "", driverId: route.driverId ?? "", active: route.active, stops: route.stops,
    });
  }, [route, form]);

  // Estudiantes ya ocupados en otra ruta del mismo sentido.
  const taken = useMemo(() => {
    const ids = new Set<string>();
    for (const r of routes ?? []) {
      if (r._id !== id && r.direction === form?.direction) r.stops.forEach((s) => s.studentIds.forEach((x) => ids.add(x)));
    }
    return ids;
  }, [routes, id, form?.direction]);

  if (!routes || !students || !team || !form) return isNew || route || !routes ? <Spinner /> : <p className="text-muted">Esta ruta ya no existe.</p>;

  const byId = new globalThis.Map(students.map((s) => [s._id, s]));
  const inRoute = new Set(form.stops.flatMap((s) => s.studentIds));
  const q = search.trim().toLowerCase();
  const available = students.filter((s) => !inRoute.has(s._id) && !taken.has(s._id) && (!q || s.name.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q)));
  const vehicle = team.vehicles.find((v) => v._id === form.vehicleId);
  const total = inRoute.size;
  const over = vehicle && total > vehicle.capacity;

  const patch = (p: Partial<Form>) => setForm((f) => ({ ...f!, ...p }));
  const retime = (stops: Stop[], f: Form = form) => {
    const times = estimateTimes(stops, f.startTime, school, f.direction);
    return stops.map((s, i) => ({ ...s, time: times[i] }));
  };

  const addStudent = (studentId: Id<"students">) => {
    const student = byId.get(studentId)!;
    if (!student.home) return;
    const near = form.stops.find((s) => distance(s, student.home!) <= SAME_STOP_METERS);
    const stops = near
      ? form.stops.map((s) => (s === near ? { ...s, studentIds: [...s.studentIds, studentId] } : s))
      : [...form.stops, { id: newId(), name: student.address || student.name, ...student.home, time: form.startTime, studentIds: [studentId] }];
    patch({ stops: near ? stops : retime(stops) });
  };
  const removeStudent = (studentId: Id<"students">) =>
    patch({ stops: form.stops.map((s) => ({ ...s, studentIds: s.studentIds.filter((x) => x !== studentId) })).filter((s) => s.studentIds.length) });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= form.stops.length || from === to) return;
    const stops = [...form.stops];
    stops.splice(to, 0, stops.splice(from, 1)[0]);
    patch({ stops: retime(stops) });
  };
  const optimize = () => {
    if (!school) return toast("Primero ubica el colegio en Ajustes.", "bad");
    patch({ stops: retime(orderStops(form.stops, school, form.direction)) });
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await save({
        id: isNew ? undefined : (id as Id<"routes">),
        name: form.name, direction: form.direction, days: form.days, startTime: form.startTime,
        vehicleId: form.vehicleId || undefined, driverId: form.driverId || undefined, active: form.active, stops: form.stops,
      });
      toast("Ruta guardada");
      router.push("/admin/rutas");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };
  const onRemove = async () => {
    if (!confirm(`¿Eliminar la ruta ${form.name}? El historial de viajes se conserva.`)) return;
    setBusy(true);
    try {
      await remove({ id: id as Id<"routes"> });
      toast("Ruta eliminada");
      router.push("/admin/rutas");
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const pins: Pin[] = [
    ...(school ? [{ id: "school", kind: "school" as const, lat: school.lat, lng: school.lng, title: "Colegio" }] : []),
    ...form.stops.map((s, i) => ({ id: s.id, kind: "stop" as const, lat: s.lat, lng: s.lng, label: String(i + 1), title: `${s.time} · ${s.name}` })),
  ];
  const stopsLine = form.stops.map((s) => [s.lat, s.lng] as [number, number]);
  const schoolPoint = school ? ([[school.lat, school.lng]] as [number, number][]) : [];
  const line = form.direction === "to_school" ? [...stopsLine, ...schoolPoint] : [...schoolPoint, ...stopsLine];

  return (
    <>
      <Link href="/admin/rutas" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Rutas
      </Link>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-5">
          <h1 className="font-display text-3xl tracking-tight">{isNew ? "Nueva ruta" : "Editar ruta"}</h1>
          <Card className="space-y-4 p-4">
            <Field label="Nombre">
              <input className={inputClass} placeholder="Norte mañana" value={form.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              {(["to_school", "from_school"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={form.direction === d}
                  onClick={() => patch({ direction: d, stops: retime([...form.stops].reverse(), { ...form, direction: d }) })}
                  className={cx("h-11 rounded-full border text-sm font-medium", form.direction === d ? "border-ink bg-ink text-paper" : "border-line bg-surface")}
                >
                  {d === "to_school" ? "Hacia el colegio" : "Desde el colegio"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Días</legend>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={form.days.includes(d)}
                      onClick={() => patch({ days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d] })}
                      className={cx("h-11 flex-1 rounded-lg border text-xs font-medium", form.days.includes(d) ? "border-ink bg-ink text-paper" : "border-line bg-surface text-muted")}
                    >
                      {DAY_NAMES[d][0]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Field label={form.direction === "to_school" ? "Primera parada" : "Sale del colegio"}>
                <input className={inputClass} type="time" value={form.startTime} onChange={(e) => e.target.value && setForm((f) => ({ ...f!, startTime: e.target.value, stops: retime(f!.stops, { ...f!, startTime: e.target.value }) }))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bus">
                <select className={inputClass} value={form.vehicleId} onChange={(e) => patch({ vehicleId: e.target.value as Form["vehicleId"] })}>
                  <option value="">Sin asignar</option>
                  {team.vehicles.filter((v) => v.active).map((v) => <option key={v._id} value={v._id}>{v.name} ({v.capacity})</option>)}
                </select>
              </Field>
              <Field label="Conductor">
                <select className={inputClass} value={form.driverId} onChange={(e) => patch({ driverId: e.target.value as Form["driverId"] })}>
                  <option value="">Sin asignar</option>
                  {team.members.filter((m) => m.role === "driver" && m.active).map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-ink" checked={form.active} onChange={(e) => patch({ active: e.target.checked })} />
              Ruta activa
            </label>
          </Card>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium">
                Paradas <span className="font-normal text-muted">· {total} estudiantes{vehicle ? ` de ${vehicle.capacity}` : ""}</span>
              </h2>
              <Button variant="secondary" size="sm" onClick={optimize} disabled={form.stops.length < 2}><Wand2 className="size-4" /> Ordenar</Button>
            </div>
            {over && <p className="mb-2 rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">Hay más estudiantes que puestos en {vehicle!.name}.</p>}
            {!form.stops.length ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">Agrega estudiantes de la lista de abajo. Cada domicilio se vuelve una parada.</p>
            ) : (
              <ol className="space-y-2">
                {form.stops.map((stop, i) => (
                  <li
                    key={stop.id}
                    draggable
                    onDragStart={() => setDragged(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => (dragged !== null && move(dragged, i), setDragged(null))}
                    className={cx("rounded-2xl border border-line bg-surface p-3", dragged === i && "opacity-40")}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-4 shrink-0 cursor-grab text-muted" aria-hidden />
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-paper">{i + 1}</span>
                      <input
                        className="min-w-0 flex-1 truncate bg-transparent text-sm font-medium focus:outline-none"
                        aria-label={`Nombre de la parada ${i + 1}`}
                        value={stop.name}
                        onChange={(e) => patch({ stops: form.stops.map((s) => (s === stop ? { ...s, name: e.target.value } : s)) })}
                      />
                      <input
                        type="time"
                        aria-label={`Hora de la parada ${i + 1}`}
                        className="h-8 rounded-lg border border-line bg-surface px-1.5 text-sm tabular-nums"
                        value={stop.time}
                        onChange={(e) => e.target.value && patch({ stops: form.stops.map((s) => (s === stop ? { ...s, time: e.target.value } : s)) })}
                      />
                      <button type="button" aria-label="Subir parada" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid size-7 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"><ArrowUp className="size-4" /></button>
                      <button type="button" aria-label="Bajar parada" onClick={() => move(i, i + 1)} disabled={i === form.stops.length - 1} className="grid size-7 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"><ArrowDown className="size-4" /></button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-12">
                      {stop.studentIds.map((sid) => (
                        <span key={sid} className="inline-flex items-center gap-1 rounded-full bg-ink/6 py-0.5 pl-2.5 pr-1 text-xs font-medium">
                          {byId.get(sid)?.name ?? "Estudiante retirado"}
                          <button type="button" aria-label={`Quitar a ${byId.get(sid)?.name}`} onClick={() => removeStudent(sid)} className="grid size-5 place-items-center rounded-full hover:bg-ink/10"><X className="size-3" /></button>
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium">Agregar estudiantes</h2>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted" />
              <input className={`${inputClass} pl-10`} placeholder="Buscar por nombre o grado" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Card className="max-h-72 divide-y divide-line/70 overflow-y-auto">
              {available.map((s) => (
                <button key={s._id} type="button" disabled={!s.home} onClick={() => addStudent(s._id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-paper disabled:opacity-60">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name} <span className="font-normal text-muted">· {s.grade}</span></p>
                    <p className="truncate text-xs text-muted">{s.address || "Sin dirección"}</p>
                  </div>
                  {s.home ? <Plus className="size-4 shrink-0" /> : <Badge tone="bad">Sin ubicación</Badge>}
                </button>
              ))}
              {!available.length && <p className="px-3 py-6 text-center text-sm text-muted">No quedan estudiantes disponibles para este sentido.</p>}
            </Card>
          </section>

          {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
          <div className="flex justify-between gap-3">
            {isNew ? <span /> : <Button variant="ghost" className="text-bad" onClick={onRemove} disabled={busy}>Eliminar ruta</Button>}
            <Button size="lg" onClick={submit} loading={busy}>Guardar ruta</Button>
          </div>
        </div>

        <Card className="h-80 overflow-hidden lg:sticky lg:top-8 lg:h-[calc(100dvh-6rem)]">
          <Map pins={pins} line={line} fitKey={form.stops.map((s) => s.id).join()} />
        </Card>
      </div>
    </>
  );
}
