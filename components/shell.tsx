"use client";
// Marcos de navegación.
// Shell: coordinador (barra lateral oscura en escritorio, barra flotante en celular).
// MobileFrame: conductor y familia (cabecera oscura y contenido en una hoja clara).
import { Bell, LogOut, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useM, useQ, useSession } from "./session";
import { Emblem, Logo, Modal, cx, formatTime } from "./ui";

export type NavItem = { href: string; label: string; icon: LucideIcon };

function useActive(nav: NavItem[]) {
  const path = usePathname();
  const root = nav[0]?.href;
  return (href: string) => (href === root ? path === root : path.startsWith(href));
}

export function Shell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  const { me, signOut } = useSession();
  const active = useActive(nav);
  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-3 left-3 hidden w-58 flex-col rounded-[2rem] bg-ink px-4 py-6 text-paper lg:flex">
        <Logo light className="px-2" />
        <p className="mt-2 truncate px-2 text-xs uppercase tracking-[0.14em] text-gold">{me?.school.name}</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex h-11 items-center gap-3 rounded-full px-4 text-[15px] transition",
                active(item.href) ? "bg-brand font-medium text-brand-ink" : "text-paper/75 hover:bg-paper/8 hover:text-paper",
              )}
            >
              <item.icon className="size-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 border-t border-paper/12 pt-4">
          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-sm">{me?.user.name}</p>
            <p className="truncate text-xs text-paper/55">{me?.user.email}</p>
          </div>
          <Notifications dark />
          <IconButton dark label="Cerrar sesión" onClick={signOut}><LogOut className="size-[18px]" strokeWidth={1.75} /></IconButton>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo className="text-xl" />
        <div className="flex items-center gap-1">
          <Notifications />
          <IconButton label="Cerrar sesión" onClick={signOut}><LogOut className="size-[18px]" strokeWidth={1.75} /></IconButton>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
      <TabBar nav={nav} className="lg:hidden" />
    </div>
  );
}

/** Marco de celular: saludo sobre verde y el contenido en una hoja crema. */
export function MobileFrame({
  nav, title, subtitle, children,
}: { nav?: NavItem[]; title: string; subtitle?: string; children: React.ReactNode }) {
  const { signOut } = useSession();
  return (
    <div className="min-h-dvh bg-ink">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col">
        <header className="px-5 pb-7 pt-[max(1.25rem,env(safe-area-inset-top))] text-paper">
          <div className="flex items-center justify-between">
            <Emblem />
            <div className="flex items-center gap-1">
              <Notifications dark />
              <IconButton dark label="Cerrar sesión" onClick={signOut}><LogOut className="size-[18px]" strokeWidth={1.75} /></IconButton>
            </div>
          </div>
          <h1 className="mt-6 font-display text-4xl tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-paper/65">{subtitle}</p>}
        </header>
        <main className={cx("flex-1 rounded-t-[2rem] bg-paper px-4 pt-5", nav ? "pb-32" : "pb-10")}>{children}</main>
      </div>
      {nav && <TabBar nav={nav} />}
    </div>
  );
}

function TabBar({ nav, className }: { nav: NavItem[]; className?: string }) {
  const active = useActive(nav);
  if (nav.length < 2) return null;
  return (
    <nav className={cx("pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]", className)}>
      <div className="pointer-events-auto flex w-full max-w-md gap-1 rounded-full bg-ink p-1.5 shadow-xl shadow-ink-deep/25">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active(item.href) ? "page" : undefined}
            className={cx(
              "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm transition",
              active(item.href) ? "bg-brand px-4 font-medium text-brand-ink" : "text-paper/70",
            )}
          >
            <item.icon className="size-5 shrink-0" strokeWidth={1.75} />
            <span className={cx(active(item.href) || nav.length <= 3 ? "inline" : "sr-only")}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function IconButton({ label, onClick, children, dark }: { label: string; onClick: () => void; children: React.ReactNode; dark?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx("relative grid size-10 shrink-0 place-items-center rounded-full", dark ? "text-paper hover:bg-paper/10" : "hover:bg-ink/6")}
    >
      {children}
    </button>
  );
}

function Notifications({ dark }: { dark?: boolean }) {
  const { me } = useSession();
  const data = useQ(api.notifications.mine, {});
  const readAll = useM(api.notifications.readAll);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    if (data?.unread) void readAll({});
  };
  return (
    <>
      <IconButton dark={dark} label="Avisos" onClick={() => setOpen(true)}>
        <Bell className="size-[18px]" strokeWidth={1.75} />
        {!!data?.unread && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-bad px-1 text-[10px] font-semibold text-paper">
            {data.unread}
          </span>
        )}
      </IconButton>
      <Modal open={open} onClose={close} title="Avisos">
        {!data?.items.length ? (
          <p className="py-10 text-center text-muted">Aún no tienes avisos.</p>
        ) : (
          <ul className="divide-y divide-line/70 text-ink">
            {data.items.map((n) => (
              <li key={n._id} className="flex gap-3 py-3.5">
                <span className={cx("mt-2 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-moss")} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted">{n.body}</p>
                </div>
                <time className="shrink-0 pt-0.5 text-xs text-muted">
                  {new Date(n.at).toDateString() === new Date().toDateString()
                    ? formatTime(n.at, me!.school.timezone)
                    : new Date(n.at).toLocaleDateString("es", { day: "numeric", month: "short" })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
