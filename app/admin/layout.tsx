"use client";
import { Bus, CalendarClock, GraduationCap, History, Route, Settings } from "lucide-react";
import { useRole } from "@/components/session";
import { Shell } from "@/components/shell";
import { Spinner } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Hoy", icon: CalendarClock },
  { href: "/admin/estudiantes", label: "Estudiantes", icon: GraduationCap },
  { href: "/admin/rutas", label: "Rutas", icon: Route },
  { href: "/admin/equipo", label: "Equipo", icon: Bus },
  { href: "/admin/historial", label: "Historial", icon: History },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = useRole("admin");
  if (!me) return <Spinner className="min-h-dvh" />;
  return <Shell nav={NAV}>{children}</Shell>;
}
