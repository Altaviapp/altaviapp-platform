"use client";
// Componentes base. Junto con app/globals.css concentran la identidad visual.
import { Loader2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-[15px]",
        size === "lg" && "h-14 px-7 text-base",
        variant === "primary" && "bg-ink text-paper hover:bg-ink-deep",
        variant === "accent" && "bg-brand text-brand-ink hover:brightness-95",
        variant === "secondary" && "border border-line bg-surface text-ink hover:border-ink/30",
        variant === "ghost" && "text-ink hover:bg-ink/6",
        variant === "danger" && "bg-bad text-paper hover:brightness-110",
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export const inputClass =
  "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none disabled:bg-paper";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("rounded-(--radius-card) border border-line/70 bg-surface", className)} {...rest}>
      {children}
    </div>
  );
}

export type Tone = "neutral" | "ok" | "info" | "bad" | "warn" | "brand";
const TONES: Record<Tone, string> = {
  neutral: "bg-ink/7 text-ink",
  ok: "bg-ok-soft text-ok",
  info: "bg-info-soft text-info",
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  brand: "bg-brand text-brand-ink",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-none", TONES[tone])}>
      {children}
    </span>
  );
}

export const STATUS: Record<string, { label: string; tone: Tone }> = {
  expected: { label: "Pendiente", tone: "neutral" },
  boarded: { label: "A bordo", tone: "info" },
  dropped: { label: "Entregado", tone: "ok" },
  no_show: { label: "No abordó", tone: "bad" },
  absent: { label: "Ausente", tone: "warn" },
};

export const DIRECTION = { to_school: "Hacia el colegio", from_school: "Desde el colegio" } as const;

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-(--radius-card) border border-dashed border-ink/20 px-6 py-14 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cx("grid place-items-center py-16 text-muted", className)} role="status" aria-label="Cargando">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Diálogo: hoja inferior en celular, ventana centrada en pantallas grandes. */
export function Modal({
  open, onClose, title, children, wide,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal aria-label={title}>
      <div className="absolute inset-0 bg-ink-deep/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cx(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-[2rem] bg-surface shadow-2xl sm:rounded-[2rem]",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-6 pb-2 pt-5">
          <h2 className="font-display text-2xl tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid size-9 place-items-center rounded-full hover:bg-ink/5">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">{children}</div>
      </div>
    </div>
  );
}

type Toast = { id: number; text: string; tone: "ok" | "bad" };
const ToastContext = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "rounded-full px-5 py-2.5 text-sm font-medium text-paper shadow-lg",
              t.tone === "ok" ? "bg-ink" : "bg-bad",
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/** Emblema: un camino que termina en una marca de "a bordo". */
export function Emblem({ className }: { className?: string }) {
  return (
    <span className={cx("grid size-9 shrink-0 place-items-center rounded-[0.8rem] bg-brand text-brand-ink", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17c0-5 3-7 7-7" />
        <path d="M12.5 12.5l2.5 2.5 5-6" />
        <circle cx="4" cy="19.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5 font-display text-2xl tracking-tight", light ? "text-paper" : "text-ink", className)}>
      <Emblem />
      Abordo
    </span>
  );
}

/** Selector de opciones tipo píldora. */
export function Segmented<T extends string>({
  value, options, onChange, dark,
}: { value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void; dark?: boolean }) {
  return (
    <div className={cx("flex gap-1 rounded-full p-1", dark ? "bg-paper/10" : "bg-ink/7")} role="tablist">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={cx(
            "h-10 flex-1 rounded-full px-3 text-sm font-medium transition",
            value === v ? (dark ? "bg-brand text-brand-ink" : "bg-ink text-paper") : dark ? "text-paper/70" : "text-ink/70",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export const formatTime = (at: number, timezone: string) =>
  new Intl.DateTimeFormat("es", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
