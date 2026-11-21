"use client";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { api, useQ } from "@/components/session";
import { Badge, Card, DIRECTION, Empty, PageHeader, Spinner } from "@/components/ui";
import { DAY_NAMES } from "@/lib/dates";

const newRoute = "inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-paper hover:bg-ink-deep";

export default function Rutas() {
  const routes = useQ(api.routes.list, {});
  if (!routes) return <Spinner />;
  return (
    <>
      <PageHeader title="Rutas" subtitle="La plantilla de cada recorrido: paradas, estudiantes, días y hora.">
        <Link href="/admin/rutas/nueva" className={newRoute}><Plus className="size-4" /> Nueva ruta</Link>
      </PageHeader>
      {!routes.length ? (
        <Empty
          title="Aún no hay rutas"
          text="Crea la primera: eliges los estudiantes y las paradas se arman desde sus domicilios."
          action={<Link href="/admin/rutas/nueva" className={newRoute}><Plus className="size-4" /> Nueva ruta</Link>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {routes.map((r) => {
            const over = r.vehicle && r.students > r.vehicle.capacity;
            return (
              <Link key={r.id} href={`/admin/rutas/${r.id}`}>
                <Card className="flex items-center gap-4 px-4 py-4 transition hover:border-ink/40">
                  <span className="w-16 font-display text-2xl tabular-nums">{r.startTime}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-medium">
                      {r.name}
                      {!r.active && <Badge>Inactiva</Badge>}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {DIRECTION[r.direction]} · {r.days.map((d) => DAY_NAMES[d]).join(" ")}
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge>{r.stops.length} paradas</Badge>
                      <Badge tone={over ? "bad" : "neutral"}>
                        {r.students}{r.vehicle ? ` de ${r.vehicle.capacity}` : ""} estudiantes
                      </Badge>
                      {r.driverName ? <Badge>{r.driverName}</Badge> : <Badge tone="warn">Sin conductor</Badge>}
                      {r.vehicle ? <Badge>{r.vehicle.name}</Badge> : <Badge tone="warn">Sin bus</Badge>}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
