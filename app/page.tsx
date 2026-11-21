"use client";
// Entrada única: correo, luego código de 6 dígitos. El rol decide a dónde se va.
import { useAction } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { HOME, errorText, useSession } from "@/components/session";
import { AuthFrame } from "@/components/auth-frame";
import { Button, Field, Spinner, inputClass } from "@/components/ui";

export default function Entrar() {
  const { me, signIn } = useSession();
  const router = useRouter();
  const requestCode = useAction(api.auth.requestCode);
  const verifyCode = useAction(api.auth.verifyCode);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (me) router.replace(HOME[me.user.role]);
  }, [me, router]);

  if (me === undefined || me) return <Spinner className="min-h-dvh" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (step === "email") {
        await requestCode({ email });
        setStep("code");
      } else {
        signIn((await verifyCode({ email, code })).token);
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <h1 className="font-display text-4xl tracking-tight">
        {step === "email" ? "Entra con tu correo" : "Revisa tu correo"}
      </h1>
      <p className="mt-2 text-lg text-muted">
        {step === "email"
          ? "Te enviamos un código de acceso. No necesitas contraseña."
          : `Si ${email} está registrado, te llegó un código de 6 dígitos. Vence en 10 minutos.`}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {step === "email" ? (
          <Field label="Correo">
            <input
              className={inputClass}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="nombre@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        ) : (
          <Field label="Código" hint="¿No llega? Pide a tu colegio que confirme tu correo.">
            <input
              className={`${inputClass} h-16 text-center font-display text-3xl tracking-[0.35em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
        )}
        {error && <p role="alert" className="rounded-2xl bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {step === "email" ? "Enviar código" : "Entrar"}
        </Button>
        {step === "code" && (
          <Button variant="ghost" className="w-full" onClick={() => (setStep("email"), setCode(""), setError(""))}>
            Usar otro correo
          </Button>
        )}
      </form>

      <p className="mt-10 text-sm text-muted">
        ¿Tu colegio aún no usa Abordo?{" "}
        <Link href="/registro" className="font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">
          Regístralo
        </Link>
      </p>
    </AuthFrame>
  );
}
