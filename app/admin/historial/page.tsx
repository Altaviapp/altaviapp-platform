"use client";
// Historial de viajes con exportación de asistencia a CSV.
import { useConvex } from "convex/react";
import { Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { errorText, useNow, useQ, useSession } from "@/components/session";
import { Badge, Button, Card, DIRECTION, Empty, Field, PageHeader, STATUS, Spinner, formatDate, formatTime, inputClass, useToast } from "@/components/ui";
import { addDays } from "@/lib/dates";

export default function Historial() {
  const { me, token } = useSession();
  const tz = me!.school.timezone;
  const now = useNow(tz);
  const [from, setFrom] = useState(() => addDays(now.date, -7));
  const [to, setTo] = useState(now.date);
  const trips = useQ(api.trips.history, from <= to ? { from, to } : "skip");
  const convex = useConvex();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);

  const exportCsv = async () => {
    if (!trips?.length || !token) return;
    setExporting(true);
    try {
      const cell = (v: string | number | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const lines = [["fecha", "ruta", "sentido", "conductor", "parada", "estudiante", "grado", "estado", "hora", "metodo"].join(",")];
      for (const t of trips) {
        const detail = await convex.query(api.trips.detail, { token, tripId: t._id });
        for (const stop of detail.stops) {
          for (const s of stop.students) {
            lines.push(
              [t.date, t.routeName, DIRECTION[t.direction], t.driverName, stop.name, s.name, s.grade, STATUS[s.status].label,
                s.at ? formatTime(s.at, tz) : "", s.method === "face" ? "rostro" : s.method === "tap" ? "lista" : ""].map(cell).join(","),
            );
          }
        }
      }
      const url = URL.createObjectURL(new Blob([`﻿${lines.join("\n")}`], { type: "text/csv;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `asistencia-${from}-a-${to}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(errorText(e), "bad");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader title="Historial" subtitle="Viajes realizados y asistencia por estudiante.">
        <Button variant="secondary" onClick={exportCsv} loading={exporting} disabled={!trips?.length}><Download className="size-4" /> Exportar CSV</Button>
      </PageHeader>
      <div className="mb-4 grid max-w-sm grid-cols-2 gap-3">
        <Field label="Desde"><input className={inputClass} type="date" max={to} value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} /></Field>
        <Field label="Hasta"><input className={inputClass} type="date" min={from} max={now.date} value={to} onChange={(e) => e.target.value && setTo(e.target.value)} /></Field>
      </div>
      {!trips ? (
        <Spinner />
      ) : !trips.length ? (
        <Empty title="Sin viajes en estas fechas" text="Los viajes aparecen aquí cuando el conductor los inicia." />
      ) : (
        <Card className="divide-y divide-line/70 overflow-hidden">
          {trips.map((t) => (
            <Link key={t._id} href={`/admin/viajes/${t._id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-paper/60">
              <span className="w-24 text-sm font-medium capitalize">{formatDate(t.date)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.routeName}</p>
                <p className="truncate text-xs text-muted">
                  {DIRECTION[t.direction]} · {t.driverName} · {formatTime(t.startedAt, tz)}{t.endedAt ? `–${formatTime(t.endedAt, tz)}` : ""}
                </p>
              </div>
              {t.summary ? (
                <span className="flex gap-1.5">
                  <Badge tone="ok">{t.summary.dropped} entregados</Badge>
                  {t.summary.noShow > 0 && <Badge tone="bad">{t.summary.noShow} no abordaron</Badge>}
                  {t.summary.absent > 0 && <Badge tone="warn">{t.summary.absent} ausentes</Badge>}
                </span>
              ) : (
                <Badge tone="info">En curso</Badge>
              )}
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
