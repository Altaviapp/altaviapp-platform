// Correo por SMTP (cualquier proveedor). Sin SMTP_URL configurado, se escribe en el log.
import nodemailer, { type Transporter } from "nodemailer";

let transport: Transporter | undefined;

export async function sendEmail(to: string, subject: string, text: string) {
  const url = process.env.SMTP_URL;
  if (!url) {
    // En producción el contenido no se escribe en el log (lleva códigos de acceso), salvo EMAIL_DEBUG=1.
    const show = process.env.NODE_ENV !== "production" || process.env.EMAIL_DEBUG === "1";
    console.log(show ? `[correo sin enviar] para ${to}: ${subject} — ${text}` : `[correo sin enviar] para ${to}: falta configurar SMTP_URL`);
    return;
  }
  transport ??= nodemailer.createTransport(url);
  await transport.sendMail({ from: process.env.EMAIL_FROM ?? "Abordo <no-responder@localhost>", to, subject, text });
}

export const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

export function welcomeText(name: string, school: string, role: string) {
  const what =
    role === "parent"
      ? "seguir el bus de tus hijos y recibir avisos cuando suban y bajen"
      : role === "driver"
        ? "operar tus rutas desde el celular"
        : "coordinar las rutas del colegio";
  return (
    `Hola ${name}:\n\n${school} usa Abordo para sus rutas escolares. Ya puedes ${what}.\n\n` +
    `Entra en ${appUrl()} con este correo. Te enviaremos un código de acceso, no necesitas contraseña.`
  );
}
