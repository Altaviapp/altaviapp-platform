import { Logo } from "./ui";

/** Marco de entrada y registro: lema sobre verde bosque, formulario en hoja crema. */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[1.1fr_1fr] lg:p-3">
      <section className="relative flex flex-col justify-between overflow-hidden px-6 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] text-paper lg:rounded-[2rem] lg:p-12">
        <svg aria-hidden viewBox="0 0 600 600" className="pointer-events-none absolute -right-40 -top-24 size-[38rem] text-paper/[0.06]" fill="none" stroke="currentColor" strokeWidth="1.5">
          {[90, 150, 210, 270, 330].map((r) => <circle key={r} cx="300" cy="300" r={r} />)}
          <path d="M40 430c120-40 150-170 260-180s150 90 260 40" strokeWidth="3" className="hidden text-brand/40 lg:block" stroke="currentColor" strokeDasharray="2 14" strokeLinecap="round" />
        </svg>
        <Logo light />
        <div className="relative mt-14 lg:mt-0">
          <p className="font-display text-[2.6rem] leading-[1.05] tracking-tight lg:text-6xl">
            Cada niño,<br /><span className="text-brand">a bordo.</span>
          </p>
          <p className="mt-4 max-w-sm text-paper/65 lg:text-lg">
            Las rutas de tu colegio en vivo: quién subió, dónde va el bus y cuándo llega.
          </p>
        </div>
        <p className="relative hidden text-xs uppercase tracking-[0.16em] text-gold lg:block">Rutas escolares</p>
      </section>
      <main className="flex min-h-[60dvh] flex-col justify-center rounded-t-[2rem] bg-paper px-6 py-10 lg:min-h-0 lg:rounded-[2rem] lg:px-0">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
