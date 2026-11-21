"use client";
// Actividad: notificaciones push y asistencia de los últimos 30 días.
import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { FAMILY_NAV } from "@/components/family-nav";
import { type PushSupport, pushSupport, subscribePush, unsubscribePush } from "@/components/push";
import { useM, useQ, useSession } from "@/components/session";
import { MobileFrame } from "@/components/shell";
import { Badge, Button, Empty, STATUS, Spinner, formatDate, formatTime, useToast } from "@/components/ui";

export default function Actividad() {
  const { me } = useSession();
  const tz = me!.school.timezone;
  const activity = useQ(api.family.activity, {});
  const byDate = new Map<string, NonNullable<typeof activity>>();
  for (const row of activity ?? []) byDate.set(row.date, [...(byDate.get(row.date) ?? []), row]);

  return (
    <MobileFrame nav={FAMILY_NAV} title="Actividad" subtitle="Avisos y asistencia de tus hijos">
      <div className="space-y-5">
        <PushCard />
        {!activity ? (
          <Spinner />
        ) : !activity.length ? (
          <Empty title="Sin registros todavía" text="Aquí verás cada vez que tus hijos suban o bajen del bus." />
        ) : (
          [...byDate].map(([date, rows]) => (
            <section key={date}>
              <h2 className="mb-2 px-1 text-xs uppercase tracking-[0.14em] text-muted">{formatDate(date)}</h2>
              <ul className="divide-y divide-line/70 overflow-hidden rounded-[1.5rem] border border-line/70 bg-surface">
                {rows.map((r) => (
                  <li key={r._id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-12 font-display text-lg tabular-nums">{formatTime(r.at, tz)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{r.studentName.split(" ")[0]}</p>
                      <p className="truncate text-xs text-muted">{r.routeName}</p>
                    </div>
                    <Badge tone={STATUS[r.status].tone}>
                      {r.status === "dropped" && r.direction === "to_school" ? "En el colegio" : STATUS[r.status].label}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </MobileFrame>
  );
}

function PushCard() {
  const data = useQ(api.notifications.mine, {});
  const subscribe = useM(api.notifications.subscribe);
  const unsubscribe = useM(api.notifications.unsubscribe);
  const toast = useToast();
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => setSupport(pushSupport()), []);
  if (!data || !support) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (data.pushOn) {
        const endpoint = await unsubscribePush();
        if (endpoint) await unsubscribe({ endpoint });
        toast("Notificaciones desactivadas en este dispositivo");
      } else {
        await subscribe(await subscribePush());
        toast("Listo. Te avisaremos cuando suban y bajen del bus.");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudieron activar las notificaciones.", "bad");
    } finally {
      setBusy(false);
    }
  };

  const on = data.pushOn && support === "ready";
  return (
    <div className={`rounded-[1.75rem] p-5 ${on ? "border border-line/70 bg-surface" : "bg-ink text-paper"}`}>
      <div className="flex items-start gap-3">
        {on ? <BellRing className="mt-0.5 size-6 text-ok" strokeWidth={1.75} /> : <BellOff className="mt-0.5 size-6 text-brand" strokeWidth={1.75} />}
        <div className="flex-1">
          <p className="font-display text-2xl leading-tight">{on ? "Notificaciones activas" : "Recibe un aviso en cada momento"}</p>
          <p className={`mt-1 text-sm ${on ? "text-muted" : "text-paper/70"}`}>
            {support === "needs-install"
              ? "En iPhone: toca Compartir y luego «Añadir a pantalla de inicio». Abre Abordo desde ese icono y vuelve aquí."
              : support === "unsupported"
                ? "Este navegador no admite notificaciones. Los avisos siguen llegando dentro de la app."
                : support === "unconfigured"
                  ? "Las notificaciones push aún no están configuradas en este servidor. Los avisos llegan dentro de la app."
                  : on
                    ? "Te avisamos cuando el bus sale, se acerca, y cuando tus hijos suben y bajan."
                    : "El bus salió, está por llegar, subió, llegó al colegio, bajó en casa."}
          </p>
        </div>
      </div>
      {support === "ready" && (
        <Button variant={on ? "secondary" : "accent"} className="mt-4 w-full" loading={busy} onClick={toggle}>
          {on ? "Desactivar en este dispositivo" : "Activar notificaciones"}
        </Button>
      )}
    </div>
  );
}
