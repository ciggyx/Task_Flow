export function dashboardInvitationTemplate(
  invitedBy: string,
  dashboardName: string,
  inviteLink: string
) {
  const colors = {
    primary: '#4f46e5',
    success: '#10b981',
    bg: '#f3f4f6'
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
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td bgcolor="${colors.success}" style="padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">¡Nueva Invitación!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="background-color: #f0fdf4; border: 1px dashed ${colors.success}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 0; color: #065f46; font-size: 16px;">
                  <strong>${invitedBy}</strong> te ha invitado a colaborar en:
                </p>
                <h2 style="color: #064e3b; margin: 10px 0 0 0; font-size: 22px;">${dashboardName}</h2>
              </div>
              
              <p style="color: #666666; font-size: 15px; line-height: 1.6;">
                Al unirte, podrás visualizar métricas, gestionar tareas y colaborar en tiempo real con el equipo.
              </p>

              <div style="margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: ${colors.primary}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Aceptar Invitación
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                ¿No esperabas esta invitación? No te preocupes, puedes ignorar este mensaje.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                &copy; 2026 Task Flow.
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