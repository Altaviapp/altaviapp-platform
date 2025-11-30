/**
 * Email HTML Templates
 *
 * Generates professional HTML emails for:
 * - User invitations (parent/driver/admin)
 * - Email verification
 * - Password reset (future)
 *
 * Following Alquemist pattern: Backend generates HTML, Frontend (Bubble) sends
 */

interface EmailTemplate {
  html: string;
  text: string; // Plain text fallback
  subject: string;
}

/**
 * Generates invitation email for new users (parent/driver/admin)
 */
export function generateInvitationEmail(params: {
  firstName: string;
  invitationCode: string;
  role: string;
  institutionName: string;
  invitedBy: string;
}): EmailTemplate {
  const { firstName, invitationCode, role, institutionName, invitedBy } = params;

  // Get Bubble app URL from environment (fallback to localhost for dev)
  const appUrl = process.env.BUBBLE_APP_URL || 'http://localhost:3000';
  const invitationLink = `${appUrl}/signup-invitation?code=${invitationCode}`;

  const roleSpanish = role === 'parent' ? 'Padre de Familia' :
                     role === 'driver' ? 'Conductor' : 'Administrador';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a Altaviapp</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 32px;">🚌 Altaviapp</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Invitación para ${roleSpanish}</p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px; background: #fafafa;">
      <p style="font-size: 18px; margin: 0 0 20px 0; color: #333;">¡Hola <strong>${firstName}</strong>!</p>

      <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 25px 0;">
        <strong>${invitedBy}</strong> te ha invitado a unirte a <strong>${institutionName}</strong> en Altaviapp.
      </p>

      <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Tu código de invitación es:</p>

      <div style="background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 25px 0;">
        <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #6366f1;">
          ${invitationCode}
        </span>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
          Aceptar Invitación
        </a>
      </div>

      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          ⏰ <strong>Este código expira en 7 días.</strong>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f0f0f0; padding: 20px 30px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        © 2025 Altaviapp - Sistema de Gestión de Transporte Escolar
      </p>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #aaa;">
        Si no esperabas este email, puedes ignorarlo.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
¡Hola ${firstName}!

${invitedBy} te ha invitado a ${institutionName} en Altaviapp.

Tu código de invitación: ${invitationCode}

Visita: ${invitationLink}

⏰ Este código expira en 7 días.

---
© 2025 Altaviapp - Sistema de Gestión de Transporte Escolar
  `.trim();

  const subject = `🚌 Invitación a Altaviapp - ${institutionName}`;

  return { html, text, subject };
}

/**
 * Generates email verification email
 */
export function generateEmailVerificationEmail(params: {
  firstName: string;
  verificationToken: string;
}): EmailTemplate {
  const { firstName, verificationToken } = params;

  const appUrl = process.env.BUBBLE_APP_URL || 'http://localhost:3000';
  const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 32px;">✅ Verifica tu Email</h1>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; margin: 0 0 20px 0; color: #333;">¡Hola <strong>${firstName}</strong>!</p>

      <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 25px 0;">
        Para completar tu registro en Altaviapp, verifica tu dirección de email usando el código:
      </p>

      <div style="background: #f9fafb; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 25px 0;">
        <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 3px; color: #10b981;">
          ${verificationToken}
        </span>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="display: inline-block; background: #10b981; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
          Verificar Email
        </a>
      </div>

      <div style="background: #fee; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;">
          ⏰ <strong>Este código expira en 24 horas.</strong>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f0f0f0; padding: 20px 30px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        © 2025 Altaviapp - Sistema de Gestión de Transporte Escolar
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
¡Hola ${firstName}!

Para completar tu registro en Altaviapp, verifica tu email con el código:

${verificationToken}

Visita: ${verificationLink}

⏰ Expira en 24 horas.

---
© 2025 Altaviapp
  `.trim();

  const subject = `🚌 Verifica tu email - Altaviapp`;

  return { html, text, subject };
}

/**
 * Generates password reset email (for future implementation)
 */
export function generatePasswordResetEmail(params: {
  firstName: string;
  resetToken: string;
}): EmailTemplate {
  const { firstName, resetToken } = params;

  const appUrl = process.env.BUBBLE_APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #f4f4f4;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden;">

    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 32px;">🔒 Restablecer Contraseña</h1>
    </div>

    <div style="padding: 40px 30px;">
      <p style="font-size: 18px; color: #333;">¡Hola ${firstName}!</p>

      <p style="font-size: 16px; line-height: 1.6; color: #555;">
        Recibimos una solicitud para restablecer tu contraseña. Tu código es:
      </p>

      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 3px; color: #dc2626;">
          ${resetToken}
        </span>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; background: #ef4444; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px;">
          Restablecer Contraseña
        </a>
      </div>

      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          Si no solicitaste esto, ignora este email. Tu contraseña no cambiará.
        </p>
      </div>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
¡Hola ${firstName}!

Código para restablecer contraseña: ${resetToken}

Visita: ${resetLink}

Si no solicitaste esto, ignora este email.
  `.trim();

  const subject = `🔒 Restablecer Contraseña - Altaviapp`;

  return { html, text, subject };
}
