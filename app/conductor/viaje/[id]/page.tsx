"use client";
// Viaje en curso: una parada a la vez, un toque por estudiante.
import { ArrowLeft, Check, Map as MapIcon, Megaphone, Navigation, ScanFace, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaceScan } from "@/components/face-scan";
import { Map, type Pin } from "@/components/map";
import { api, errorText, useM, useQ, useSession } from "@/components/session";
import { Badge, Button, Field, Modal, STATUS, Segmented, Spinner, cx, formatTime, inputClass, useToast } from "@/components/ui";

type Trip = NonNullable<(typeof api.trips.detail)["_returnType"]>;
type Student = Trip["stops"][number]["students"][number];
type Mark = "boarded" | "dropped" | "no_show" | "undo";

/** Envía la posición cada 10 s y mantiene la pantalla encendida mientras el viaje está en curso. */
function useTracking(tripId: string, active: boolean) {
  const send = useM(api.trips.position, { quiet: true });
  const [gps, setGps] = useState<"searching" | "ok" | "denied">("searching");
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!active || !("geolocation" in navigator)) return;
    let last = 0;
    const watch = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setGps("ok");
        setHere({ lat: coords.latitude, lng: coords.longitude });
        if (Date.now() - last < 10000) return;
        last = Date.now();
        const num = (n: number | null) => (n !== null && Number.isFinite(n) ? n : undefined);
        void send({ tripId, lat: coords.latitude, lng: coords.longitude, heading: num(coords.heading), speed: num(coords.speed) }).catch(() => {});
      },
      (error) => setGps(error.code === error.PERMISSION_DENIED ? "denied" : "searching"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    let lock: WakeLockSentinel | undefined;
    const keepAwake = () => {
      if (document.visibilityState === "visible") void navigator.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    };
    keepAwake();
    document.addEventListener("visibilitychange", keepAwake);
    return () => {
      navigator.geolocation.clearWatch(watch);
      document.removeEventListener("visibilitychange", keepAwake);
      void lock?.release();
    };
  }, [active, tripId, send]);
  return { gps, here };
}

export default function Viaje() {
  const { id } = useParams<{ id: string }>();
  const { me } = useSession();
  const tz = me!.school!.timezone;
  const trip = useQ(api.trips.detail, { tripId: id });
  const mark = useM(api.trips.mark);
  const depart = useM(api.trips.depart);
  const finish = useM(api.trips.finish);
  const toast = useToast();
  const running = trip?.status === "in_progress";
  const { gps, here } = useTracking(id, !!running);
  const [dialog, setDialog] = useState<"scan" | "notice" | "map" | null>(null);
  const [busy, setBusy] = useState(false);

  if (!trip) return <Spinner className="min-h-dvh" />;
  if (!running) return <Summary trip={trip} timezone={tz} />;

  const toSchool = trip.direction === "to_school";
  const boardingAtSchool = !toSchool && !trip.departedAt;
  const all = trip.stops.flatMap((s) => s.students);
  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e) {
      toast(errorText(e), "bad");
    }
  };
  const doMark = (studentId: string, status: Mark, method: "tap" | "face" = "tap") =>
    mark({ tripId: id, studentId, status, method });
  const tap = (studentId: string, status: Mark) => act(() => doMark(studentId, status));

  // Qué hace el escáner según el momento del viaje.
  const scanAction = toSchool || boardingAtSchool ? "boarded" : "dropped";
  const scanPending = all.filter((s) => (scanAction === "boarded" ? s.status === "expected" || s.status === "absent" : s.status === "boarded"));

  const onDepart = async () => {
    const left = all.filter((s) => s.status === "expected").length;
    if (left && !confirm(`${left} estudiante${left > 1 ? "s" : ""} sin marcar quedará${left > 1 ? "n" : ""} como "no abordó". ¿Salir del colegio?`)) return;
    setBusy(true);
    await act(() => depart({ tripId: id }));
    setBusy(false);
  };
  const onFinish = async () => {
    const left = all.filter((s) => s.status === "expected").length;
    const text = toSchool
      ? `¿Llegaron al colegio? ${trip.counts.boarded} estudiante${trip.counts.boarded === 1 ? "" : "s"} a bordo.${left ? ` ${left} sin marcar quedará${left > 1 ? "n" : ""} como "no abordó".` : ""}`
      : "¿Terminar el viaje?";
    if (!confirm(text)) return;
    setBusy(true);
    await act(() => finish({ tripId: id }));
    setBusy(false);
  };

  const next = trip.stops[trip.stopIndex];
  const pins: Pin[] = [
    ...(trip.school ? [{ id: "school", kind: "school" as const, lat: trip.school.lat, lng: trip.school.lng, title: "Colegio" }] : []),
    ...trip.stops.map((s, i) => ({ id: s.id, kind: i < trip.stopIndex ? ("done" as const) : ("stop" as const), lat: s.lat, lng: s.lng, label: String(i + 1), title: s.name })),
    ...(here ? [{ id: "bus", kind: "bus" as const, ...here }] : []),
  ];

  return (
    <div className="min-h-dvh bg-ink">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <header className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-paper">
          <div className="flex items-center justify-between">
            <Link href="/conductor" aria-label="Volver a mis viajes" className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-paper/10">
              <ArrowLeft className="size-5" strokeWidth={1.75} />
            </Link>
            <span className={cx("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs", gps === "ok" ? "bg-paper/12" : "bg-bad text-paper")}>
              <span className={cx("size-2 rounded-full", gps === "ok" ? "bg-brand" : "bg-paper")} />
              {gps === "ok" ? "Ubicación activa" : gps === "denied" ? "Sin permiso de ubicación" : "Buscando ubicación"}
            </span>
          </div>
          <p className="mt-4 text-sm text-paper/65">{trip.routeName}{trip.vehicle ? ` · ${trip.vehicle.name}` : ""}</p>
          {boardingAtSchool ? (
            <h1 className="mt-1 font-display text-4xl tracking-tight">Abordaje en el colegio</h1>
          ) : next ? (
            <>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-gold">Parada {trip.stopIndex + 1} de {trip.stops.length}</p>
              <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight">{next.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand px-3 py-1 text-sm font-medium text-brand-ink">{next.eta}</span>
                {trip.delayMin >= 5 && <span className="rounded-full bg-paper/12 px-3 py-1 text-sm">+{trip.delayMin} min</span>}
                <a href={`https://waze.com/ul?ll=${next.lat},${next.lng}&navigate=yes`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1 text-sm">
                  <Navigation className="size-4" strokeWidth={1.75} /> Waze
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${next.lat},${next.lng}`} target="_blank" rel="noreferrer" className="rounded-full bg-paper/12 px-3 py-1 text-sm">
                  Maps
                </a>
              </div>
            </>
          ) : (
            <h1 className="mt-1 font-display text-4xl tracking-tight">{toSchool ? "Rumbo al colegio" : "Recorrido completo"}</h1>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Count value={trip.counts.boarded} label="A bordo" accent />
            <Count value={trip.counts.expected} label="Pendientes" />
            <Count value={toSchool ? trip.counts.no_show + trip.counts.absent : trip.counts.dropped} label={toSchool ? "No viajan" : "Entregados"} />
          </div>
        </header>

        <main className="flex-1 space-y-3 rounded-t-[2rem] bg-paper px-4 pb-36 pt-5">
          {boardingAtSchool ? (
            <ul className="overflow-hidden rounded-[1.5rem] border border-line/70 bg-surface">
              {[...all].sort((a, b) => a.name.localeCompare(b.name, "es")).map((s) => (
                <StudentRow key={s.id} student={s} big mode="board" hideNoShow onTap={tap} />
              ))}
            </ul>
          ) : (
            trip.stops.map((stop, i) => {
              const current = i === trip.stopIndex;
              return (
                <section key={stop.id} className={cx("overflow-hidden rounded-[1.5rem] border bg-surface", current ? "border-ink" : "border-line/70", i < trip.stopIndex && "opacity-75")}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className={cx("grid size-7 shrink-0 place-items-center rounded-full text-xs font-medium text-paper", i < trip.stopIndex ? "bg-muted/60" : "bg-ink")}>
                      {i < trip.stopIndex ? <Check className="size-4" /> : i + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate font-medium">{stop.name}</p>
                    <span className="text-sm tabular-nums text-muted">{i >= trip.stopIndex ? stop.eta : stop.time}</span>
                  </div>
                  <ul className="border-t border-line/70">
                    {stop.students.map((s) => (
                      <StudentRow key={s.id} student={s} big={current} mode={toSchool ? "board" : "drop"} onTap={tap} />
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </main>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex w-full max-w-md items-center gap-1.5 rounded-full bg-ink p-1.5 shadow-xl shadow-ink-deep/30">
          <BarButton label="Avisar" onClick={() => setDialog("notice")}><Megaphone className="size-5" strokeWidth={1.75} /></BarButton>
          <BarButton label="Mapa" onClick={() => setDialog("map")}><MapIcon className="size-5" strokeWidth={1.75} /></BarButton>
          <BarButton label="Escanear rostro" onClick={() => setDialog("scan")}><ScanFace className="size-5" strokeWidth={1.75} /></BarButton>
          <Button variant="accent" className="h-12 flex-1 px-3" loading={busy} onClick={boardingAtSchool ? onDepart : onFinish}>
            {boardingAtSchool ? "Salir del colegio" : toSchool ? "Llegamos al colegio" : "Terminar viaje"}
          </Button>
        </div>
      </div>

      <Modal open={dialog === "scan"} onClose={() => setDialog(null)} title="Escanear rostro">
        {dialog === "scan" && (
          <FaceScan
            tripId={id}
            pending={scanPending}
            actionLabel={scanAction === "boarded" ? "Subió" : "Bajó"}
            onMark={async (studentId) => void (await doMark(studentId, scanAction, "face"))}
          />
        )}
      </Modal>
      <Modal open={dialog === "map"} onClose={() => setDialog(null)} title="Recorrido">
        {dialog === "map" && (
          <div className="h-[60dvh] overflow-hidden rounded-[1.5rem]">
            <Map pins={pins} line={trip.stops.map((s) => [s.lat, s.lng])} path={trip.path} fitKey={trip.id} />
          </div>
        )}
      </Modal>
      <Modal open={dialog === "notice"} onClose={() => setDialog(null)} title="Avisar">
        {dialog === "notice" && <NoticeForm tripId={id} onDone={() => setDialog(null)} />}
      </Modal>
    </div>
  );
}

function Count({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={cx("rounded-2xl px-2 py-3", accent ? "bg-brand text-brand-ink" : "bg-paper/8")}>
      <p className="font-display text-3xl leading-none tabular-nums">{value}</p>
      <p className={cx("mt-1 text-xs", accent ? "text-brand-ink/75" : "text-paper/65")}>{label}</p>
    </div>
  );
}

function BarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="grid size-12 shrink-0 place-items-center rounded-full text-paper hover:bg-paper/10">
      {children}
    </button>
  );
}

/** Fila de estudiante. En la parada actual los botones son grandes; en las demás, compactos. */
function StudentRow({
  student: s, big, mode, hideNoShow, onTap,
}: {
  student: Student; big: boolean; mode: "board" | "drop";
  /** En el abordaje del colegio no hace falta marcar "no salió": lo resuelve "Salir del colegio". */
  hideNoShow?: boolean;
  onTap: (id: string, status: Mark) => void;
}) {
  const pending = mode === "board" ? s.status === "expected" || s.status === "absent" : s.status === "boarded";
  const canUndo = s.status === "boarded" || s.status === "dropped" || s.status === "no_show";
  return (
    <li className={cx("flex items-center gap-3 border-b border-line/70 px-4 last:border-b-0", big ? "py-3" : "py-2.5")}>
      <div className="min-w-0 flex-1">
        <p className={cx("truncate", big && "text-lg font-medium")}>{s.name}</p>
        <p className="truncate text-xs text-muted">
          {s.grade}{s.note ? ` · ${s.note}` : ""}{s.status === "absent" ? " · Ausencia reportada" : ""}
        </p>
      </div>
      {pending && mode === "board" && !hideNoShow && s.status !== "absent" && (
        <button type="button" aria-label={`${s.name} no salió`} onClick={() => onTap(s.id, "no_show")} className={cx("grid shrink-0 place-items-center rounded-full border border-line text-muted hover:border-bad hover:text-bad", big ? "size-12" : "size-9")}>
          <X className="size-5" strokeWidth={1.75} />
        </button>
      )}
      {pending ? (
        <button
          type="button"
          onClick={() => onTap(s.id, mode === "board" ? "boarded" : "dropped")}
          className={cx("shrink-0 rounded-full bg-ink font-medium text-paper active:scale-95", big ? "h-12 px-6" : "h-9 px-4 text-sm")}
        >
          {mode === "board" ? "Subió" : "Bajó"}
        </button>
      ) : (
        <>
          <Badge tone={STATUS[s.status].tone}>{s.method === "face" && <ScanFace className="size-3.5" />}{STATUS[s.status].label}</Badge>
          {canUndo && (
            <button type="button" aria-label={`Deshacer ${s.name}`} title="Deshacer" onClick={() => onTap(s.id, "undo")} className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/6">
              <Undo2 className="size-4" strokeWidth={1.75} />
            </button>
          )}
        </>
      )}
    </li>
  );
}

const KINDS = [["delay", "Retraso"], ["breakdown", "Avería"], ["other", "Otro"]] as const;

function NoticeForm({ tripId, onDone }: { tripId: string; onDone: () => void }) {
  const notice = useM(api.trips.notice);
  const toast = useToast();
  const [kind, setKind] = useState<(typeof KINDS)[number][0]>("delay");
  const [message, setMessage] = useState("");
  const [toFamilies, setToFamilies] = useState(true);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await notice({ tripId, kind, message, toFamilies });
      toast("Aviso enviado");
      onDone();
    } catch (err) {
      toast(errorText(err), "bad");
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Segmented value={kind} options={KINDS} onChange={setKind} />
      <Field label="Mensaje (opcional)">
        <input className={inputClass} maxLength={240} placeholder="Tráfico en la avenida, unos 10 minutos" value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      <label className="flex items-center gap-3 rounded-2xl bg-ink/5 px-4 py-3">
        <input type="checkbox" className="size-5 accent-ink" checked={toFamilies} onChange={(e) => setToFamilies(e.target.checked)} />
        <span>Avisar también a las familias</span>
      </label>
      <Button type="submit" size="lg" className="w-full" loading={busy}>Enviar aviso al colegio</Button>
    </form>
  );
}

function Summary({ trip, timezone }: { trip: Trip; timezone: string }) {
  const minutes = trip.endedAt ? Math.max(1, Math.round((trip.endedAt - trip.startedAt) / 60000)) : 0;
  const missing = trip.stops.flatMap((s) => s.students).filter((s) => s.status === "no_show");
  return (
    <div className="min-h-dvh bg-ink">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <header className="px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-paper">
          <Link href="/conductor" aria-label="Volver a mis viajes" className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-paper/10">
            <ArrowLeft className="size-5" strokeWidth={1.75} />
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-gold">Viaje terminado</p>
          <h1 className="mt-1 font-display text-4xl tracking-tight">{trip.routeName}</h1>
          <p className="mt-1 text-paper/65">
            {formatTime(trip.startedAt, timezone)}{trip.endedAt ? ` a ${formatTime(trip.endedAt, timezone)}` : ""}
          </p>
        </header>
        <main className="flex-1 space-y-3 rounded-t-[2rem] bg-paper px-4 pb-10 pt-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[[trip.counts.dropped, "Transportados"], [trip.counts.no_show, "No abordaron"], [minutes, "Minutos"]].map(([value, label]) => (
              <div key={label} className="rounded-[1.5rem] border border-line/70 bg-surface px-2 py-5">
                <p className="font-display text-4xl leading-none tabular-nums">{value}</p>
                <p className="mt-2 text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
          {missing.length > 0 && (
            <div className="rounded-[1.5rem] border border-line/70 bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">No abordaron</p>
              <ul className="mt-2 space-y-1">{missing.map((s) => <li key={s.id}>{s.name} <span className="text-muted">· {s.grade}</span></li>)}</ul>
            </div>
          )}
          <Link href="/conductor" className="flex h-14 items-center justify-center rounded-full bg-ink font-medium text-paper">Volver a mis viajes</Link>
        </main>
      </div>
    </div>
  );
}
