import nodemailer from 'nodemailer';

export function obtenerTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000
    });
  }

  return null;
}

/**
 * Enviar credenciales de nueva contraseña al Gmail del cliente
 */
export async function enviarCorreoNuevaPassword({ clienteNombre, clienteEmail, nuevaPassword }) {
  const mailer = obtenerTransporter();
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;

  if (!mailer || !gmailUser) {
    console.warn('[MAILER] Credenciales GMAIL_USER o GMAIL_PASS no configuradas en entorno.');
    return {
      enviado: false,
      motivo: 'Credenciales GMAIL_USER y GMAIL_PASS no configuradas en el servidor.'
    };
  }

  const remitente = gmailUser;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 1px;">Botica Nova Salud</span>
        <h2 style="font-size: 18px; font-weight: 900; color: #1e293b; margin: 4px 0 0 0;">Restablecimiento de Contraseña</h2>
      </div>
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        Hola <strong>${clienteNombre}</strong>,
      </p>
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        El Administrador de <strong>Botica Nova Salud</strong> ha procesado tu solicitud de recuperación y reasignó una nueva contraseña para tu cuenta de cliente.
      </p>
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 6px;">Tu Nueva Contraseña Temporal</span>
        <span style="font-family: monospace; font-size: 20px; font-weight: 900; color: #0d9488; letter-spacing: 2px;">${nuevaPassword}</span>
      </div>
      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        Puedes ingresar a tu cuenta con tu DNI o este correo electrónico. Por seguridad, te sugerimos actualizarla desde tu portal personal una vez iniciada la sesión.
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
        Botica Nova Salud • Jr. Mariano Núñez 485, Juliaca, San Román, Puno
      </div>
    </div>
  `;

  try {
    const envioPromise = mailer.sendMail({
      from: `"Botica Nova Salud" <${remitente}>`,
      to: clienteEmail,
      subject: 'Tu nueva contraseña de acceso - Botica Nova Salud',
      text: `Hola ${clienteNombre},\n\nTu contraseña de acceso a Botica Nova Salud ha sido restablecida por el administrador.\n\nNueva Contraseña: ${nuevaPassword}\n\nIngresa a tu cuenta con tu correo o DNI.\n\nBotica Nova Salud`,
      html
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado al conectar con el servidor SMTP de Gmail')), 7000)
    );

    const info = await Promise.race([envioPromise, timeoutPromise]);
    return {
      enviado: true,
      messageId: info?.messageId || 'OK'
    };
  } catch (err) {
    console.error(`[MAILER] Error al enviar correo a ${clienteEmail}:`, err.message);
    return {
      enviado: false,
      motivo: err.message
    };
  }
}
