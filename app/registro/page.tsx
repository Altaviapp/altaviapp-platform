"use client";
// Registro de un colegio nuevo con su primer coordinador.
import { useAction } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { errorText, useSession } from "@/components/session";
import { TIMEZONES } from "@/lib/dates";
import { AuthFrame } from "@/components/auth-frame";
import { Button, Field, inputClass } from "@/components/ui";

export default function Registro() {
  const register = useAction(api.auth.registerSchool);
  const verify = useAction(api.auth.verifyCode);
  const { signIn } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ schoolName: "", name: "", email: "", timezone: "America/Guayaquil" });
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!sent) {
        await register(form);
        setSent(true);
      } else {
        signIn((await verify({ email: form.email, code })).token);
        router.replace("/admin/ajustes");
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <h1 className="font-display text-4xl tracking-tight">{sent ? "Confirma tu correo" : "Registra tu colegio"}</h1>
      <p className="mt-2 text-lg text-muted">
        {sent
          ? `Enviamos un código de 6 dígitos a ${form.email}.`
          : "Serás el primer coordinador. Luego agregas estudiantes, buses y rutas."}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {!sent ? (
          <>
            <Field label="Nombre del colegio">
              <input className={inputClass} required minLength={3} value={form.schoolName} onChange={set("schoolName")} />
            </Field>
            <Field label="Tu nombre">
              <input className={inputClass} required autoComplete="name" value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Tu correo">
              <input className={inputClass} type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
            </Field>
            <Field label="País" hint="Define la zona horaria de las rutas.">
              <select className={inputClass} value={form.timezone} onChange={set("timezone")}>
                {TIMEZONES.map(([tz, label]) => (
                  <option key={tz} value={tz}>{label}</option>
                ))}
              </select>
            </Field>
          </>
        ) : (
          <Field label="Código">
            <input
              className={`${inputClass} h-16 text-center font-display text-3xl tracking-[0.35em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
        )}
        {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {sent ? "Entrar" : "Crear colegio"}
        </Button>
      </form>
      <p className="mt-10 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/" className="font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">Entra</Link>
      </p>
    </AuthFrame>
  );
}
