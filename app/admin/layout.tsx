"use client";
import { Bus, CalendarClock, CreditCard, GraduationCap, History, Route, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/components/session";
import { Shell } from "@/components/shell";
import { Spinner } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Hoy", icon: CalendarClock },
  { href: "/admin/estudiantes", label: "Estudiantes", icon: GraduationCap },
  { href: "/admin/rutas", label: "Rutas", icon: Route },
  { href: "/admin/equipo", label: "Equipo", icon: Bus },
  { href: "/admin/historial", label: "Historial", icon: History },
  { href: "/admin/plan", label: "Plan", icon: CreditCard },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

const DAY = 86400000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = useRole("admin");
  const path = usePathname();
  if (!me) return <Spinner className="min-h-dvh" />;
  const sub = me.subscription;
  const daysLeft = sub ? Math.ceil((Math.max(sub.paidUntil ?? 0, sub.trialEndsAt) - Date.now()) / DAY) : 99;
  const notice =
    sub?.status === "suspended"
      ? "La suscripción está suspendida: la edición quedó bloqueada. Los viajes y las familias no se afectan."
      : sub?.status === "past_due"
        ? "Hay un pago pendiente. Regularízalo para que no se bloquee la edición."
        : sub?.status === "trial" && daysLeft <= 7 && daysLeft > 0
          ? `Tu prueba gratis termina en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}.`
          : null;
  return (
    <Shell nav={NAV}>
      {notice && path !== "/admin/plan" && (
        <Link
          href="/admin/plan"
          className={`mb-6 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm ${sub?.status === "trial" ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad"}`}
        >
          <span>{notice}</span>
          <span className="shrink-0 font-medium underline underline-offset-4">Ver plan y pagos</span>
        </Link>
      )}
      {children}
    </Shell>
  );
}
