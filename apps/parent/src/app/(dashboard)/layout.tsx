"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  Home,
  MapPin,
  Clock,
  Bell,
  User,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Seguimiento", href: "/tracking", icon: MapPin },
  { name: "Historial", href: "/history", icon: Clock },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-16 bg-primary flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">Altaviapp</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-white/80 hover:text-white relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-white/80 hover:text-white"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="p-4">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-primary"
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          <button className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-primary">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
