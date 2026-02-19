export function passwordResetTemplate(
  username: string | undefined,
  resetLink: string
) {
  const colors = {
    primary: '#713e5a',   // Morado
    accent: '#ca6680',    // Rosa
    beige: '#edc79b',     // Beige
    terra: '#d57a66',     // Terracotta
    bg: '#fdfaf5',        // Crema (Fondo)
    text: '#331d29'       // Morado oscuro para texto
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bg}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(113, 62, 90, 0.1); border: 1px solid ${colors.beige};">
          <tr>
            <td bgcolor="${colors.primary}" style="padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">Seguridad de la Cuenta</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="color: ${colors.text}; font-size: 18px; margin-top: 0;">Hola <strong style="color: ${colors.terra};">${username ?? 'usuario'}</strong>,</p>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Task Flow</strong>. 
                Si no realizaste esta solicitud, puedes ignorar este correo de forma segura; tu contraseña actual no cambiará.
              </p>
              <div style="margin: 35px 0;">
                <a href="${resetLink}" style="background-color: ${colors.accent}; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(202, 102, 128, 0.3);">
                  Restablecer Contraseña
                </a>
              </div>
              <p style="color: #8e7a84; font-size: 13px; margin-top: 25px; font-style: italic;">
                Este enlace expirará pronto por razones de seguridad.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fdfaf5; padding: 25px; text-align: center; border-top: 1px solid ${colors.beige};">
              <p style="margin: 0; font-size: 12px; color: #8e7a84; line-height: 1.4;">
                Si tienes problemas con el botón, copia y pega este enlace en tu navegador:<br>
                <span style="color: ${colors.primary}; word-break: break-all;">${resetLink}</span>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 11px; color: ${colors.terra}; font-weight: bold; text-transform: uppercase;">
                &copy; 2026 Task Flow
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}