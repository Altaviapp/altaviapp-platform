"use client";
import { useRole } from "@/components/session";
import { Spinner } from "@/components/ui";

export default function ConductorLayout({ children }: { children: React.ReactNode }) {
  const me = useRole("driver");
  if (!me) return <Spinner className="min-h-dvh" />;
  return children;
}
