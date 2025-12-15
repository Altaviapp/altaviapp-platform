"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Initialize Resend client
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }
  return new Resend(apiKey);
};

/**
 * Core email sending function using Resend
 */
async function sendEmailWithResend(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from: "Altaviapp <noreply@altaviapp.com>",
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("Email sent successfully:", data?.id);
    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Send an email using Resend (generic)
 */
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
  },
  handler: async (_, args) => {
    return sendEmailWithResend(args);
  },
});

/**
 * Send verification email
 */
export const sendVerificationEmail = action({
  args: {
    to: v.string(),
    firstName: v.string(),
    verificationCode: v.string(),
  },
  handler: async (_, args) => {
    const html = generateVerificationEmailHtml(args.firstName, args.verificationCode);
    const text = generateVerificationEmailText(args.firstName, args.verificationCode);

    return sendEmailWithResend({
      to: args.to,
      subject: `Verifica tu cuenta - Altaviapp`,
      html,
      text,
    });
  },
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = action({
  args: {
    to: v.string(),
    firstName: v.string(),
    resetCode: v.string(),
  },
  handler: async (_, args) => {
    const html = generatePasswordResetEmailHtml(args.firstName, args.resetCode);
    const text = generatePasswordResetEmailText(args.firstName, args.resetCode);

    return sendEmailWithResend({
      to: args.to,
      subject: `Restablecer contraseña - Altaviapp`,
      html,
      text,
    });
  },
});

/**
 * Send invitation email
 */
export const sendInvitationEmail = action({
  args: {
    to: v.string(),
    firstName: v.string(),
    invitationCode: v.string(),
    role: v.string(),
    institutionName: v.string(),
  },
  handler: async (_, args) => {
    const html = generateInvitationEmailHtml(
      args.firstName,
      args.invitationCode,
      args.role,
      args.institutionName
    );
    const text = generateInvitationEmailText(
      args.firstName,
      args.invitationCode,
      args.role,
      args.institutionName
    );

    return sendEmailWithResend({
      to: args.to,
      subject: `Invitación a Altaviapp - ${args.institutionName}`,
      html,
      text,
    });
  },
});

// ============================================
// Email Templates
// ============================================

function generateVerificationEmailHtml(firstName: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #042940; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #DBF227; font-size: 28px; font-weight: bold;">Altaviapp</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Transporte Escolar Seguro</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #042940; font-size: 24px;">¡Hola ${firstName}!</h2>
              <p style="margin: 0 0 24px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Gracias por registrarte en Altaviapp. Para completar tu registro, ingresa el siguiente código de verificación:
              </p>

              <!-- Code Box -->
              <div style="background-color: #f0f9ff; border: 2px dashed #042940; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;">Tu código de verificación:</p>
                <p style="margin: 0; color: #042940; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</p>
              </div>

              <p style="margin: 24px 0 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Este código expira en <strong>24 horas</strong>. Si no solicitaste esta verificación, puedes ignorar este correo.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Altaviapp. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateVerificationEmailText(firstName: string, code: string): string {
  return `
¡Hola ${firstName}!

Gracias por registrarte en Altaviapp.

Tu código de verificación es: ${code}

Este código expira en 24 horas.

Si no solicitaste esta verificación, puedes ignorar este correo.

© ${new Date().getFullYear()} Altaviapp
  `.trim();
}

function generatePasswordResetEmailHtml(firstName: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #042940; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #DBF227; font-size: 28px; font-weight: bold;">Altaviapp</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Transporte Escolar Seguro</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #042940; font-size: 24px;">Restablecer contraseña</h2>
              <p style="margin: 0 0 24px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Hola ${firstName}, recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:
              </p>

              <!-- Code Box -->
              <div style="background-color: #fff3cd; border: 2px dashed #856404; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;">Tu código de restablecimiento:</p>
                <p style="margin: 0; color: #856404; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</p>
              </div>

              <p style="margin: 24px 0 0 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Este código expira en <strong>1 hora</strong>. Si no solicitaste restablecer tu contraseña, ignora este correo.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Altaviapp. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generatePasswordResetEmailText(firstName: string, code: string): string {
  return `
Hola ${firstName},

Recibimos una solicitud para restablecer tu contraseña.

Tu código de restablecimiento es: ${code}

Este código expira en 1 hora.

Si no solicitaste restablecer tu contraseña, ignora este correo.

© ${new Date().getFullYear()} Altaviapp
  `.trim();
}

function generateInvitationEmailHtml(
  firstName: string,
  code: string,
  role: string,
  institutionName: string
): string {
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    driver: "Conductor",
    monitor: "Monitor",
    parent: "Padre/Tutor",
  };
  const roleLabel = roleLabels[role] || role;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a Altaviapp</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #042940; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #DBF227; font-size: 28px; font-weight: bold;">Altaviapp</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Transporte Escolar Seguro</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #042940; font-size: 24px;">¡Hola ${firstName}!</h2>
              <p style="margin: 0 0 24px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Has sido invitado a unirte a <strong>${institutionName}</strong> como <strong>${roleLabel}</strong> en Altaviapp.
              </p>

              <!-- Code Box -->
              <div style="background-color: #d4edda; border: 2px dashed #155724; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;">Tu código de invitación:</p>
                <p style="margin: 0; color: #155724; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</p>
              </div>

              <p style="margin: 0 0 16px 0; color: #555555; font-size: 14px; line-height: 1.5;">
                <strong>Para completar tu registro:</strong>
              </p>
              <ol style="margin: 0 0 24px 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                <li>Descarga la app Altaviapp</li>
                <li>Selecciona "Tengo un código de invitación"</li>
                <li>Ingresa el código anterior</li>
                <li>Completa tus datos</li>
              </ol>

              <p style="margin: 0; color: #888888; font-size: 14px;">
                Este código expira en <strong>7 días</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Altaviapp. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateInvitationEmailText(
  firstName: string,
  code: string,
  role: string,
  institutionName: string
): string {
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    driver: "Conductor",
    monitor: "Monitor",
    parent: "Padre/Tutor",
  };
  const roleLabel = roleLabels[role] || role;

  return `
¡Hola ${firstName}!

Has sido invitado a unirte a ${institutionName} como ${roleLabel} en Altaviapp.

Tu código de invitación es: ${code}

Para completar tu registro:
1. Descarga la app Altaviapp
2. Selecciona "Tengo un código de invitación"
3. Ingresa el código anterior
4. Completa tus datos

Este código expira en 7 días.

© ${new Date().getFullYear()} Altaviapp
  `.trim();
}
