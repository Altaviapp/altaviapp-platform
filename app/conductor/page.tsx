"use client";
// Mis viajes de hoy.
import { ArrowUpRight, Bus, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { errorText, useM, useNow, useQ, useSession } from "@/components/session";
import { MobileFrame } from "@/components/shell";
import { Button, DIRECTION, Empty, Spinner, cx, useToast } from "@/components/ui";

const longDate = (date: string) =>
  new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

export default function MisViajes() {
  const { me } = useSession();
  const now = useNow(me!.school.timezone);
  const routes = useQ(api.trips.myDay, { date: now.date });
  const start = useM(api.trips.start);
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState<Id<"routes"> | null>(null);

  const onStart = async (routeId: Id<"routes">) => {
    setStarting(routeId);
    try {
      router.push(`/conductor/viaje/${await start({ routeId })}`);
    } catch (e) {
      toast(errorText(e), "bad");
      setStarting(null);
    }
  };

  // El primer viaje por hacer (o en curso) se destaca en oscuro.
  const nextUp = routes?.find((r) => r.trip?.status !== "completed");

  return (
    <MobileFrame title={`Hola, ${me!.user.name.split(" ")[0]}`} subtitle={longDate(now.date)}>
      {!routes ? (
        <Spinner />
      ) : !routes.length ? (
        <Empty title="Hoy no tienes viajes" text="Cuando el colegio te asigne una ruta para este día, aparecerá aquí." />
      ) : (
        <div className="space-y-3">
          {routes.map((r) => {
            const running = r.trip?.status === "in_progress";
            const done = r.trip?.status === "completed";
            const dark = r === nextUp;
            return (
              <article
                key={r.routeId}
                className={cx(
                  "rounded-[1.75rem] p-5",
                  dark ? "bg-ink text-paper" : "border border-line/70 bg-surface",
                  done && "opacity-70",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={cx("font-display text-6xl leading-none tabular-nums", dark && "text-brand")}>{r.startTime}</p>
                  <span className={cx("rounded-full px-3 py-1 text-xs", dark ? "bg-paper/12" : "bg-ink/7")}>
                    {running ? "En curso" : done ? "Terminado" : DIRECTION[r.direction]}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-medium">{r.name}</h2>
                <p className={cx("mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm", dark ? "text-paper/70" : "text-muted")}>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" strokeWidth={1.75} /> {r.stops} paradas</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" strokeWidth={1.75} /> {r.expected} estudiantes{r.absent > 0 && ` · ${r.absent} ausente${r.absent > 1 ? "s" : ""}`}
                  </span>
                  {r.vehicle && <span className="inline-flex items-center gap-1.5"><Bus className="size-4" strokeWidth={1.75} /> {r.vehicle.name}</span>}
                </p>
                <div className="mt-5">
                  {r.trip ? (
                    <Button
                      variant={dark ? "accent" : "secondary"}
                      size="lg"
                      className="w-full"
                      onClick={() => router.push(`/conductor/viaje/${r.trip!._id}`)}
                    >
                      {running ? "Continuar viaje" : "Ver resumen"} <ArrowUpRight className="size-5" strokeWidth={1.75} />
                    </Button>
                  ) : (
                    <Button
                      variant={dark ? "accent" : "secondary"}
                      size="lg"
                      className="w-full"
                      loading={starting === r.routeId}
                      disabled={starting !== null}
                      onClick={() => onStart(r.routeId)}
                    >
                      Iniciar viaje
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </MobileFrame>
  );
}
