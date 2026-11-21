// Correo por la API HTTP de Resend. Sin llave configurada, se escribe en el log (desarrollo).
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[correo sin enviar] para ${to}: ${subject} — ${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Abordo <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend respondió ${res.status}`);
}

export const welcome = internalAction({
  args: { to: v.string(), name: v.string(), school: v.string(), role: v.string() },
  handler: async (_ctx, { to, name, school, role }) => {
    const url = process.env.APP_URL ?? "http://localhost:3000";
    const what =
      role === "parent"
        ? "seguir el bus de tus hijos y recibir avisos cuando suban y bajen"
        : role === "driver"
          ? "operar tus rutas desde el celular"
          : "coordinar las rutas del colegio";
    await sendEmail(
      to,
      `${school} te agregó a Abordo`,
      `Hola ${name}:\n\n${school} usa Abordo para sus rutas escolares. Ya puedes ${what}.\n\n` +
        `Entra en ${url} con este correo. Te enviaremos un código de acceso, no necesitas contraseña.`,
    );
  },
});
