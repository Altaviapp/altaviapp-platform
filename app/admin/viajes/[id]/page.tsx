"use client";
// Detalle de un viaje: mapa, paradas y estado de cada estudiante.
import { ArrowLeft, ScanFace } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Map, type Pin } from "@/components/map";
import { errorText, useM, useQ, useSession } from "@/components/session";
import { Badge, Button, Card, DIRECTION, STATUS, Spinner, formatDate, formatTime, useToast } from "@/components/ui";

export default function Viaje() {
  const { id } = useParams<{ id: Id<"trips"> }>();
  const { me } = useSession();
  const tz = me!.school.timezone;
  const trip = useQ(api.trips.detail, { tripId: id });
  const position = useQ(api.trips.livePosition, trip?.status === "in_progress" ? { tripId: id } : "skip");
  const close = useM(api.trips.close);
  const toast = useToast();
  const [closing, setClosing] = useState(false);
  if (!trip) return <Spinner />;
  const running = trip.status === "in_progress";

  const pins: Pin[] = [
    ...(trip.school ? [{ id: "school", kind: "school" as const, lat: trip.school.lat, lng: trip.school.lng, title: "Colegio" }] : []),
    ...trip.stops.map((s, i) => ({
      id: s.id, kind: i < trip.stopIndex ? ("done" as const) : ("stop" as const),
      lat: s.lat, lng: s.lng, label: String(i + 1), title: s.name,
    })),
    ...(position ? [{ id: "bus", kind: "bus" as const, lat: position.lat, lng: position.lng, title: trip.routeName }] : []),
  ];
  const stopsLine = trip.stops.map((s) => [s.lat, s.lng] as [number, number]);
  const schoolPoint = trip.school ? ([[trip.school.lat, trip.school.lng]] as [number, number][]) : [];
  const line = trip.direction === "to_school" ? [...stopsLine, ...schoolPoint] : [...schoolPoint, ...stopsLine];

  const onClose = async () => {
    if (!confirm("¿Cerrar este viaje? El conductor ya no podrá registrar asistencia.")) return;
    setClosing(true);
    try {
      await close({ tripId: id });
      toast("Viaje cerrado");
    } catch (e) {
      toast(errorText(e), "bad");
    } finally {
      setClosing(false);
    }
  };

  return (
    <>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Hoy
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl tracking-tight">{trip.routeName}</h1>
            {running ? <Badge tone="info">En curso</Badge> : <Badge tone="ok">Terminado</Badge>}
            {running && trip.delayMin >= 5 && <Badge tone="warn">+{trip.delayMin} min</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted">
            {DIRECTION[trip.direction]} · {formatDate(trip.date)} · {formatTime(trip.startedAt, tz)}
            {trip.endedAt ? `–${formatTime(trip.endedAt, tz)}` : ""} · {trip.driver?.name}
            {trip.driver?.phone ? ` (${trip.driver.phone})` : ""}{trip.vehicle ? ` · ${trip.vehicle.name} ${trip.vehicle.plate}` : ""}
          </p>
        </div>
        {running && <Button variant="secondary" onClick={onClose} loading={closing}>Cerrar viaje</Button>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            {(["expected", "boarded", "dropped", "no_show"] as const).map((k) => (
              <Card key={k} className="px-2 py-3">
                <p className="text-2xl font-semibold tabular-nums">{trip.counts[k]}</p>
                <p className="text-xs text-muted">{STATUS[k].label}</p>
              </Card>
            ))}
          </div>
          {trip.notices.length > 0 && (
            <Card className="divide-y divide-line/70">
              {trip.notices.map((n) => (
                <p key={n.at} className="px-4 py-3 text-sm">
                  <b>{{ delay: "Retraso", breakdown: "Avería", other: "Aviso" }[n.kind]}</b> · {n.message}
                  <span className="text-muted"> · {formatTime(n.at, tz)}{n.toFamilies ? " · enviado a familias" : ""}</span>
                </p>
              ))}
            </Card>
          )}
          {trip.stops.map((stop, i) => (
            <Card key={stop.id} className={running && i === trip.stopIndex ? "border-ink" : ""}>
              <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold text-paper ${i < trip.stopIndex ? "bg-muted/60" : "bg-ink"}`}>{i + 1}</span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{stop.name}</p>
                <span className="text-sm tabular-nums text-muted">
                  {running && i >= trip.stopIndex && stop.eta !== stop.time ? <><s>{stop.time}</s> <b className="text-warn">{stop.eta}</b></> : stop.time}
                </span>
              </div>
              <ul className="divide-y divide-line/70">
                {stop.students.map((s) => (
                  <li key={s._id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <p className="min-w-0 truncate text-sm">{s.name} <span className="text-muted">· {s.grade}</span></p>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                      {s.method === "face" && <ScanFace className="size-4" aria-label="Por reconocimiento facial" />}
                      {s.at && formatTime(s.at, tz)}
                      <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <Card className="h-80 overflow-hidden lg:sticky lg:top-8 lg:h-[calc(100dvh-10rem)]">
          <Map pins={pins} line={line} fitKey={trip._id} />
        </Card>
      </div>
    </>
  );
}
