"use client";
// Plan y pagos: estado de la suscripción, pago del periodo con Wompi e historial.
import { ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api, errorText, useM, useQ } from "@/components/session";
import { Badge, Button, Card, Field, PageHeader, Spinner, type Tone, inputClass, useToast } from "@/components/ui";

const money = (pesos: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(pesos);
const day = (at: number) => new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(at);

const STATUS: Record<string, { title: string; tone: Tone }> = {
  trial: { title: "Prueba gratis", tone: "brand" },
  active: { title: "Suscripción activa", tone: "ok" },
  past_due: { title: "Pago pendiente", tone: "warn" },
  suspended: { title: "Suspendida", tone: "bad" },
  cancelled: { title: "Cancelada", tone: "bad" },
};
const CHARGE: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Sin confirmar", tone: "neutral" },
  paid: { label: "Pagado", tone: "ok" },
  failed: { label: "Rechazado", tone: "bad" },
};

export default function Plan() {
  return (
    <Suspense fallback={<Spinner />}>
      <PlanPage />
    </Suspense>
  );
}

function PlanPage() {
  const data = useQ(api.billing.status, {});
  const checkout = useM(api.billing.checkout);
  const saveInfo = useM(api.billing.saveInfo);
  const toast = useToast();
  const returning = useSearchParams().has("id"); // Wompi redirige aquí con ?id=<transacción>
  const [paying, setPaying] = useState<1 | 12 | null>(null);
  const [info, setInfo] = useState<{ legalName: string; taxId: string; billingEmail: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !info) setInfo({ legalName: data.legalName, taxId: data.taxId, billingEmail: data.billingEmail });
  }, [data, info]);

  if (!data || !info) return <Spinner />;
  const state = STATUS[data.status];
  const waiting = returning && data.charges[0]?.status === "pending";

  const pay = async (months: 1 | 12) => {
    setPaying(months);
    try {
      window.location.href = (await checkout({ months })).url;
    } catch (e) {
      toast(errorText(e), "bad");
      setPaying(null);
    }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveInfo(info);
      toast("Datos de facturación guardados");
    } catch (err) {
      toast(errorText(err), "bad");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Plan y pagos" subtitle="Pagas solo por los estudiantes activos en una ruta." />
      {waiting && (
        <p className="mb-5 rounded-2xl bg-info-soft px-4 py-3 text-sm text-info">
          Estamos confirmando tu pago con Wompi. Esta pantalla se actualiza sola cuando llegue la confirmación.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-(--radius-card) bg-ink p-6 text-paper">
            <Badge tone={state.tone}>{state.title}</Badge>
            <p className="mt-4 text-sm text-paper/65">
              {data.status === "trial" ? "Termina el" : data.status === "active" ? "Pagada hasta el" : "Venció el"}
            </p>
            <p className="font-display text-4xl leading-tight tracking-tight text-brand">{day(data.coveredUntil)}</p>
            {data.status === "suspended" && (
              <p className="mt-3 text-sm text-paper/75">
                La edición está bloqueada. Los viajes y el seguimiento a las familias siguen funcionando.
              </p>
            )}
          </div>

          <Card className="p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Tu tarifa hoy</p>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label={`${data.monthly.students} estudiantes × ${money(data.pricePerStudent)}`} value={money(data.monthly.subtotal)} />
              <Row label={`IVA ${data.monthly.taxPercent} %`} value={money(data.monthly.tax)} />
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-line/70 pt-4">
              <span className="text-muted">Total al mes</span>
              <span className="font-display text-4xl leading-none tabular-nums">{money(data.monthly.total)}</span>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Button size="lg" loading={paying === 1} disabled={!data.canPay || paying !== null} onClick={() => pay(1)}>Pagar 1 mes</Button>
              <Button size="lg" variant="secondary" className="whitespace-nowrap px-4 text-sm" loading={paying === 12} disabled={!data.canPay || paying !== null} onClick={() => pay(12)}>
                12 meses · {money(data.yearly.total)}
              </Button>
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              {!data.gatewayReady
                ? "Los pagos en línea aún no están activos. Escríbenos para pagar por transferencia."
                : data.pricePerStudent <= 0
                  ? "Tu colegio no tiene tarifa asignada todavía."
                  : data.monthly.students === 0
                    ? "Cuando tengas estudiantes en rutas activas podrás pagar aquí."
                    : "El pago se hace en Wompi (Bancolombia): PSE, tarjeta, Nequi o Botón Bancolombia. Abordo no ve ni guarda los datos de tu medio de pago."}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-muted">Datos de facturación</p>
            <form onSubmit={save} className="space-y-4">
              <Field label="Razón social"><input className={inputClass} value={info.legalName} onChange={(e) => setInfo({ ...info, legalName: e.target.value })} /></Field>
              <Field label="NIT"><input className={inputClass} value={info.taxId} onChange={(e) => setInfo({ ...info, taxId: e.target.value })} /></Field>
              <Field label="Correo de facturación" hint="Aquí llegan los recordatorios de pago.">
                <input className={inputClass} type="email" value={info.billingEmail} onChange={(e) => setInfo({ ...info, billingEmail: e.target.value })} />
              </Field>
              <Button type="submit" variant="secondary" loading={saving}>Guardar datos</Button>
            </form>
          </Card>

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">Historial de pagos</h2>
            {!data.charges.length ? (
              <p className="rounded-(--radius-card) border border-dashed border-ink/20 px-6 py-8 text-center text-sm text-muted">Aún no hay pagos.</p>
            ) : (
              <Card className="divide-y divide-line/70">
                {data.charges.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium tabular-nums">{money(c.total)}</p>
                      <p className="truncate text-xs text-muted">
                        {day(c.paidAt ?? c.createdAt)} · {c.months} {c.months === 1 ? "mes" : "meses"} · {c.students} estudiantes
                        {c.method ? ` · ${c.method === "manual" ? "transferencia" : c.method}` : ""}
                      </p>
                    </div>
                    <Badge tone={CHARGE[c.status].tone}>{CHARGE[c.status].label}</Badge>
                  </div>
                ))}
              </Card>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
