"use client";
import { useRole } from "@/components/session";
import { Spinner } from "@/components/ui";

export default function FamiliaLayout({ children }: { children: React.ReactNode }) {
  const me = useRole("parent");
  if (!me) return <Spinner className="min-h-dvh" />;
  return children;
}
