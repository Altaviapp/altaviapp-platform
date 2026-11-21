"use client";
// Inicio de la familia: dónde está cada hijo ahora y qué sigue hoy.
import { CalendarOff, Megaphone, Phone, ScanFace, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AbsenceForm } from "@/components/absence-form";
import { FaceEnroll } from "@/components/face-enroll";
import { FAMILY_NAV } from "@/components/family-nav";
import { Map, type Pin } from "@/components/map";
import { errorText, useM, useNow, useQ, useSession } from "@/components/session";
import { MobileFrame } from "@/components/shell";
import { Button, Empty, Modal, Spinner, cx, formatDate, useToast } from "@/components/ui";

type Home = NonNullable<(typeof api.family.home)["_returnType"]>;
type Child = Home["children"][number];
type Leg = Child["legs"][number];
type Dialog = { kind: "absence"; childId?: Id<"students"> } | { kind: "face"; child: Child } | null;

const longDate = (date: string) =>
  new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

/**
 * El trayecto que importa ahora: el que está en curso; si no, el último que ya ocurrió
 * (así "En el colegio" se mantiene hasta que arranca la tarde); si no, el primero por hacer.
 */
function currentLeg(legs: Leg[]): Leg | undefined {
  return (
    legs.find((l) => l.trip?.status === "in_progress") ??
    legs.findLast((l) => l.trip) ??
    legs.find((l) => l.status !== "absent") ??
    legs[0]
  );
}

/** Titular y detalle del estado, en palabras de la familia. */
function describe(leg: Leg, first: string): { title: string; detail: string; live: boolean } {
  const toSchool = leg.direction === "to_school";
  const stop = leg.stop?.name ?? "su parada";
  const running = leg.trip?.status === "in_progress";
  switch (leg.status) {
    case "absent":
      return { title: "No viaja", detail: `Ausencia reportada para ${toSchool ? "la mañana" : "la tarde"}.`, live: false };
    case "boarded":
      return toSchool
        ? { title: "A bordo", detail: "Va camino al colegio.", live: running }
        : { title: "A bordo", detail: leg.trip?.departed ? `Llega a ${stop} hacia las ${leg.eta}.` : "Ya subió al bus en el colegio.", live: running };
    case "dropped":
      return toSchool
        ? { title: "En el colegio", detail: `${first} llegó bien.`, live: false }
        : { title: "En casa", detail: `Bajó en ${stop}.`, live: false };
    case "no_show":
      return { title: "No abordó", detail: toSchool ? `No salió en ${stop}.` : "No subió al bus en el colegio.", live: false };
    default:
      if (running && toSchool) {
        const away = leg.trip!.stopsAway;
        return {
          title: away === 0 ? "El bus ya llega" : "El bus va en camino",
          detail: `Pasa por ${stop} hacia las ${leg.eta}${away > 0 ? ` · ${away} parada${away > 1 ? "s" : ""} antes` : ""}.`,
          live: true,
        };
      }
      if (running) return { title: "Abordando", detail: "El bus está en el colegio recogiendo a los estudiantes.", live: false };
      return toSchool
        ? { title: leg.stop?.time ?? leg.startTime, detail: `Lo recogen en ${stop}.`, live: false }
        : { title: leg.stop?.time ?? leg.startTime, detail: `Lo dejan en ${stop}.`, live: false };
  }
}

export default function Inicio() {
  const { me } = useSession();
  const now = useNow(me!.school.timezone);
  const data = useQ(api.family.home, { date: now.date });
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  return (
    <MobileFrame nav={FAMILY_NAV} title={`Hola, ${me!.user.name.split(" ")[0]}`} subtitle={longDate(now.date)}>
      {!data ? (
        <Spinner />
      ) : !data.children.length ? (
        <Empty title="Aún no hay estudiantes a tu nombre" text="Pide al colegio que te registre como acudiente con este correo." />
      ) : (
        <div className="space-y-4">
          {data.children.map((child, i) => {
            // Hermanos en el mismo viaje: el mapa se muestra una sola vez.
            const tripId = currentLeg(child.legs)?.trip?._id;
            const repeated = !!tripId && data.children.slice(0, i).some((c) => currentLeg(c.legs)?.trip?._id === tripId);
            return <ChildCard key={child._id} child={child} school={data.school} showMap={!repeated} onDialog={setDialog} />;
          })}
        </div>
      )}

      <Modal open={dialog?.kind === "absence"} onClose={close} title="Reportar ausencia">
        {dialog?.kind === "absence" && data && (
          <AbsenceForm
            students={[...data.children].sort((a) => (a._id === dialog.childId ? -1 : 0)).map((c) => ({ _id: c._id, name: c.name }))}
            today={now.date}
            onDone={close}
          />
        )}
      </Modal>
      <Modal open={dialog?.kind === "face"} onClose={close} title={dialog?.kind === "face" ? `Rostro de ${dialog.child.name.split(" ")[0]}` : ""}>
        {dialog?.kind === "face" && (
          <FaceEnroll studentId={dialog.child._id} studentName={dialog.child.name} hasFace={dialog.child.hasFace} source="guardian" onDone={close} />
        )}
      </Modal>
    </MobileFrame>
  );
}

function ChildCard({
  child, school, showMap, onDialog,
}: { child: Child; school: Home["school"]; showMap: boolean; onDialog: (d: Dialog) => void }) {
  const cancel = useM(api.family.cancelAbsence);
  const toast = useToast();
  const first = child.name.split(" ")[0];
  const leg = currentLeg(child.legs);
  const info = leg && describe(leg, first);
  const others = child.legs.filter((l) => l !== leg);
  const dark = !!leg?.trip && leg.trip.status === "in_progress";

  const onCancel = async (id: Id<"absences">) => {
    try {
      await cancel({ id });
      toast("Ausencia cancelada");
    } catch (e) {
      toast(errorText(e), "bad");
    }
  };

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-line/70 bg-surface">
      <div className={cx("p-5", dark && "bg-ink text-paper")}>
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{child.name}</p>
          <span className={cx("rounded-full px-3 py-1 text-xs", dark ? "bg-paper/12" : "bg-ink/7")}>{child.grade}</span>
        </div>
        {!leg || !info ? (
          <p className="mt-4 text-muted">Hoy no tiene ruta programada.</p>
        ) : (
          <>
            <p className={cx("mt-5 text-xs uppercase tracking-[0.14em]", dark ? "text-gold" : "text-muted")}>
              {leg.direction === "to_school" ? "Hacia el colegio" : "De regreso a casa"} · {leg.routeName}
            </p>
            <p className={cx("mt-1 font-display text-5xl leading-[1.05] tracking-tight", dark && "text-brand")}>{info.title}</p>
            <p className={cx("mt-2", dark ? "text-paper/75" : "text-muted")}>{info.detail}</p>
            {leg.trip?.notices.map((n) => (
              <p key={n.at} className="mt-3 flex items-start gap-2 rounded-2xl bg-warn-soft px-3 py-2.5 text-sm text-warn">
                <Megaphone className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} /> {n.message}
              </p>
            ))}
          </>
        )}
      </div>

      {showMap && leg?.trip && info?.live && leg.stop && <LiveMap leg={leg} school={school} />}

      <div className="space-y-3 p-4">
        {others.map((l) => {
          const d = describe(l, first);
          return (
            <div key={l.direction + l.routeName} className="flex items-center justify-between gap-3 rounded-2xl bg-ink/5 px-4 py-3 text-sm">
              <span className="text-muted">{l.direction === "to_school" ? "Mañana" : "Tarde"} · {l.routeName}</span>
              <span className="font-medium">{d.title}</span>
            </div>
          );
        })}

        {child.absences.map((a) => (
          <div key={a._id} className="flex items-center justify-between gap-2 rounded-2xl bg-warn-soft py-2 pl-4 pr-2 text-sm text-warn">
            <span>
              Ausencia {a.from === a.to ? `el ${formatDate(a.from)}` : `del ${formatDate(a.from)} al ${formatDate(a.to)}`}
              {a.direction !== "both" && ` · solo ${a.direction === "to_school" ? "mañana" : "tarde"}`}
            </span>
            <button type="button" aria-label="Cancelar ausencia" title="Cancelar ausencia" onClick={() => onCancel(a._id)} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-warn/10">
              <X className="size-4" />
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => onDialog({ kind: "absence", childId: child._id })}>
            <CalendarOff className="size-4" strokeWidth={1.75} /> Reportar ausencia
          </Button>
          {leg?.driver?.phone && (
            <a href={`tel:${leg.driver.phone.replace(/\s/g, "")}`} aria-label={`Llamar a ${leg.driver.name}`} title={`Llamar a ${leg.driver.name}`} className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface hover:border-ink/30">
              <Phone className="size-[18px]" strokeWidth={1.75} />
            </a>
          )}
          <button
            type="button"
            aria-label="Reconocimiento facial"
            title="Reconocimiento facial"
            onClick={() => onDialog({ kind: "face", child })}
            className={cx("grid size-11 shrink-0 place-items-center rounded-full border", child.hasFace ? "border-ok/40 bg-ok-soft text-ok" : "border-line bg-surface hover:border-ink/30")}
          >
            <ScanFace className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>
        {leg?.driver && (
          <p className="text-center text-xs text-muted">
            Conduce {leg.driver.name}{leg.vehicle ? ` · ${leg.vehicle.name} ${leg.vehicle.plate}` : ""}
          </p>
        )}
      </div>
    </article>
  );
}

function LiveMap({ leg, school }: { leg: Leg; school: Home["school"] }) {
  const position = useQ(api.trips.livePosition, { tripId: leg.trip!._id });
  const pins: Pin[] = [
    ...(school ? [{ id: "school", kind: "school" as const, lat: school.lat, lng: school.lng, title: "Colegio" }] : []),
    { id: "mine", kind: "mine", lat: leg.stop!.lat, lng: leg.stop!.lng, title: leg.stop!.name },
    ...(position ? [{ id: "bus", kind: "bus" as const, lat: position.lat, lng: position.lng }] : []),
  ];
  return (
    <div className="relative h-56">
      <Map pins={pins} fitKey={`${leg.trip!._id}|${position ? 1 : 0}`} />
      {!position && (
        <p className="absolute inset-x-4 bottom-4 rounded-full bg-surface/95 px-4 py-2 text-center text-sm text-muted shadow">
          Esperando la ubicación del bus…
        </p>
      )}
    </div>
  );
}
