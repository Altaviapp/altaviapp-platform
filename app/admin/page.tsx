"use client";
// Hoy: la operación del día en una pantalla.
import { AlertTriangle, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Map, type Pin } from "@/components/map";
import { useNow, useQ, useSession } from "@/components/session";
import { Badge, Card, DIRECTION, Empty, PageHeader, Spinner, formatDate, formatTime } from "@/components/ui";
import { toMinutes } from "@/lib/dates";

export default function Hoy() {
  const { me } = useSession();
  const school = me!.school;
  const now = useNow(school.timezone);
  const data = useQ(api.trips.today, { date: now.date });
  const positions = useQ(api.trips.livePositions, {});
  if (!data) return <Spinner />;

  const running = data.trips.filter((t) => t.status === "in_progress");
  const done = data.trips.filter((t) => t.status === "completed");
  const lateBy = (startTime: string) => now.minutes - toMinutes(startTime);
  const late = data.pending.filter((r) => lateBy(r.startTime) >= 10);
  const urgent = late.filter((r) => lateBy(r.startTime) <= 180); // después de 3 h ya no es una alerta
  const notices = running.flatMap((t) => t.notices.map((n) => ({ ...n, routeName: t.routeName, tripId: t._id })));
  const nothing = !data.trips.length && !data.pending.length;

  const pins: Pin[] = [
    ...(school.location ? [{ id: "school", kind: "school" as const, lat: school.location.lat, lng: school.location.lng, title: school.name }] : []),
    ...(positions ?? []).map((p) => ({
      id: p.tripId, kind: "bus" as const, lat: p.lat, lng: p.lng,
      title: running.find((t) => t._id === p.tripId)?.routeName,
    })),
  ];

  return (
    <>
      <PageHeader title="Hoy" subtitle={formatDate(now.date)} />
      {nothing ? (
        <Empty
          title="Hoy no hay rutas programadas"
          text="Cuando tengas rutas activas para este día de la semana, aquí verás cada bus en vivo."
          action={<Link href="/admin/rutas" className="font-medium underline decoration-gold decoration-2 underline-offset-4">Ir a rutas</Link>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="En curso" value={running.length} dark />
              <Stat label="Sin iniciar" value={data.pending.length} alert={urgent.length > 0} />
              <Stat label="Terminados" value={done.length} />
              <Stat label="Ausencias" value={data.absences.length} />
            </div>
            {(urgent.length > 0 || notices.length > 0) && (
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-bad">Requiere atención</h2>
                <Card className="divide-y divide-line/70 border-bad/30">
                  {urgent.map((r) => (
                    <div key={r.routeId} className="flex items-center gap-3 px-4 py-3">
                      <Clock className="size-5 shrink-0 text-bad" />
                      <p className="text-sm">
                        <b>{r.name}</b> debía iniciar a las {r.startTime} y no ha salido.
                        {r.driverName ? ` Conductor: ${r.driverName}.` : " No tiene conductor asignado."}
                      </p>
                    </div>
                  ))}
                  {notices.map((n) => (
                    <Link key={`${n.tripId}${n.at}`} href={`/admin/viajes/${n.tripId}`} className="flex items-center gap-3 px-4 py-3 hover:bg-paper">
                      <AlertTriangle className="size-5 shrink-0 text-warn" />
                      <p className="text-sm">
                        <b>{n.routeName}</b>: {n.message}
                        <span className="text-muted"> · {formatTime(n.at, school.timezone)}</span>
                      </p>
                    </Link>
                  ))}
                </Card>
              </section>
            )}

            {running.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">En curso</h2>
                <div className="space-y-3">{running.map((t) => <TripCard key={t._id} trip={t} timezone={school.timezone} />)}</div>
              </section>
            )}

            {data.pending.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Sin iniciar</h2>
                <Card className="divide-y divide-line/70">
                  {data.pending.map((r) => (
                    <div key={r.routeId} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-14 font-display text-xl tabular-nums">{r.startTime}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <p className="truncate text-xs text-muted">
                          {r.driverName ?? "Sin conductor"} · {r.vehicleName ?? "Sin bus"} · {r.students} estudiantes
                        </p>
                      </div>
                      {late.includes(r) ? <Badge tone="bad">Atrasada</Badge> : !r.driverName ? <Badge tone="warn">Sin conductor</Badge> : null}
                    </div>
                  ))}
                </Card>
              </section>
            )}

            {done.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Terminados</h2>
                <div className="space-y-3">{done.map((t) => <TripCard key={t._id} trip={t} timezone={school.timezone} />)}</div>
              </section>
            )}

            {data.absences.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Ausencias de hoy</h2>
                <Card className="divide-y divide-line/70">
                  {data.absences.map((a) => (
                    <div key={a._id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.studentName} <span className="font-normal text-muted">· {a.grade}</span></p>
                        {a.note && <p className="truncate text-xs text-muted">{a.note}</p>}
                      </div>
                      <Badge tone="warn">{a.direction === "both" ? "Todo el día" : a.direction === "to_school" ? "Mañana" : "Tarde"}</Badge>
                    </div>
                  ))}
                </Card>
              </section>
            )}
          </div>

          <Card className="h-80 overflow-hidden lg:sticky lg:top-8 lg:h-[calc(100dvh-12rem)]">
            <Map pins={pins} fitKey={`${school.location?.lat}|${(positions ?? []).map((p) => p.tripId).join()}`} />
          </Card>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, alert, dark }: { label: string; value: number; alert?: boolean; dark?: boolean }) {
  return (
    <div
      className={`rounded-(--radius-card) px-4 py-4 ${
        dark ? "bg-ink text-paper" : alert ? "bg-bad-soft text-bad" : "border border-line/70 bg-surface"
      }`}
    >
      <p className={`font-display text-5xl leading-none tabular-nums ${dark ? "text-brand" : ""}`}>{value}</p>
      <p className={`mt-2 text-sm ${dark ? "text-paper/70" : alert ? "text-bad" : "text-muted"}`}>{label}</p>
    </div>
  );
}

type Trip = NonNullable<(typeof api.trips.today)["_returnType"]>["trips"][number];

function TripCard({ trip, timezone }: { trip: Trip; timezone: string }) {
  const c = trip.counts;
  const expected = c.total - c.absent;
  const running = trip.status === "in_progress";
  const progress = expected ? Math.round(((c.boarded + c.dropped + c.no_show) / expected) * 100) : 100;
  return (
    <Link href={`/admin/viajes/${trip._id}`}>
      <Card className="px-4 py-3 transition hover:border-ink/40">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{trip.routeName}</p>
            <p className="truncate text-xs text-muted">
              {DIRECTION[trip.direction]} · {trip.driverName}{trip.vehicleName ? ` · ${trip.vehicleName}` : ""}
            </p>
          </div>
          {running && trip.delayMin >= 5 && <Badge tone="warn">+{trip.delayMin} min</Badge>}
          {running ? <Badge tone="info">En curso</Badge> : <Badge tone="ok">Terminado</Badge>}
          <ChevronRight className="size-4 shrink-0 text-muted" />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8">
          <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {running ? (
            <>
              <b className="text-ink">{c.boarded} a bordo</b> · {c.dropped} entregados · {c.expected} pendientes
              {c.no_show > 0 && ` · ${c.no_show} no abordaron`}
              {trip.nextStop && ` · siguiente: ${trip.nextStop}`}
            </>
          ) : (
            <>
              {formatTime(trip.startedAt, timezone)}–{trip.endedAt ? formatTime(trip.endedAt, timezone) : ""} · {c.dropped} de {expected} entregados
              {c.no_show > 0 && ` · ${c.no_show} no abordaron`}
            </>
          )}
        </p>
      </Card>
    </Link>
  );
}
