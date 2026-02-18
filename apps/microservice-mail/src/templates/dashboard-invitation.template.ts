export function dashboardInvitationTemplate(
  invitedBy: string,
  dashboardName: string,
  inviteLink: string
) {
  const colors = {
    primary: '#713e5a',   // Morado
    accent: '#ca6680',    // Rosa
    beige: '#edc79b',     // Beige
    terra: '#d57a66',     // Terracotta
    bg: '#fdfaf5'         // Crema (Fondo)
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación al Dashboard</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bg}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(113, 62, 90, 0.1); border: 1px solid ${colors.beige};">
          <tr>
            <td bgcolor="${colors.primary}" style="padding: 35px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">¡Nueva Invitación!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="background-color: #fdfaf5; border: 2px dashed ${colors.beige}; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <p style="margin: 0; color: ${colors.primary}; font-size: 16px;">
                  <strong style="color: ${colors.terra};">${invitedBy}</strong> te ha invitado a colaborar en:
                </p>
                <h2 style="color: ${colors.primary}; margin: 12px 0 0 0; font-size: 24px; font-weight: 800;">${dashboardName}</h2>
              </div>
              
              <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                Al unirte, podrás visualizar métricas, gestionar tareas y colaborar en tiempo real con el equipo dentro de nuestro espacio compartido.
              </p>

              <div style="margin: 35px 0;">
                <a href="${inviteLink}" style="background-color: ${colors.accent}; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(202, 102, 128, 0.3);">
                  Aceptar Invitación
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fdfaf5; padding: 25px; text-align: center; border-top: 1px solid ${colors.beige};">
              <p style="margin: 0; font-size: 12px; color: #8e7a84;">
                ¿No esperabas esta invitación? Puedes ignorar este mensaje de forma segura.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: ${colors.primary}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
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