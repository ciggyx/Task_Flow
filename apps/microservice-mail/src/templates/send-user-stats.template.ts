import { SendStatsEmailDto } from '../mail/dto/send-user-stats.dto';

export const statsReportTemplate = (data: SendStatsEmailDto) => {
  const { user, stats, month, year } = data;

  const colors = {
    primary: '#713e5a',   // Morado
    accent: '#ca6680',    // Rosa
    beige: '#edc79b',     // Beige
    terra: '#d57a66',     // Terracotta
    success: '#63a375',   // Verde de la paleta
    bg: '#fdfaf5'         // Crema (Fondo)
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Actividad Mensual</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bg}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(113, 62, 90, 0.1); border: 1px solid ${colors.beige};">
          
          <tr>
            <td bgcolor="${colors.primary}" style="padding: 35px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">Reporte de Actividad</h1>
              <p style="color: ${colors.beige}; margin: 5px 0 0 0; font-size: 16px; font-weight: 500;">Resumen de Rendimiento</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: ${colors.primary}; font-size: 18px; margin-top: 0;">Hola <strong>${user.name}</strong>,</p>
              <p style="color: #555555; font-size: 15px; line-height: 1.5;">
                Aquí tienes el resumen de tu desempeño durante el periodo: <strong style="color: ${colors.terra};">${month}/${year}</strong>.
              </p>

              <div style="text-align: center; margin: 40px 0; padding: 20px; background-color: ${colors.bg}; border-radius: 12px; border: 1px solid ${colors.beige};">
                <p style="color: ${colors.primary}; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; font-weight: bold;">Tasa de Finalización</p>
                <div style="font-size: 52px; font-weight: 800; color: ${colors.accent};">${stats.completionRate}</div>
                
                <div style="background-color: #ffffff; border: 1px solid ${colors.beige}; border-radius: 999px; height: 12px; width: 85%; margin: 15px auto; overflow: hidden;">
                  <div style="background-color: ${colors.accent}; height: 100%; width: ${stats.completionRate}; border-radius: 999px;"></div>
                </div>
              </div>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td width="50%" style="padding-right: 10px; padding-bottom: 20px;">
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid ${colors.beige}; border-left: 5px solid ${colors.primary};">
                      <div style="font-size: 11px; color: ${colors.primary}; font-weight: bold; text-transform: uppercase;">Total Tareas</div>
                      <div style="font-size: 24px; font-weight: 800; color: ${colors.primary};">${stats.totalTasks}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px; padding-bottom: 20px;">
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid ${colors.beige}; border-left: 5px solid ${colors.success};">
                      <div style="font-size: 11px; color: ${colors.success}; font-weight: bold; text-transform: uppercase;">✅ Completadas</div>
                      <div style="font-size: 24px; font-weight: 800; color: ${colors.success};">${stats.completed}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid ${colors.beige}; border-left: 5px solid ${colors.beige};">
                      <div style="font-size: 11px; color: ${colors.terra}; font-weight: bold; text-transform: uppercase;">⏳ En Progreso</div>
                      <div style="font-size: 24px; font-weight: 800; color: ${colors.terra};">${stats.inProgress}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid ${colors.beige}; border-left: 5px solid ${colors.accent};">
                      <div style="font-size: 11px; color: ${colors.accent}; font-weight: bold; text-transform: uppercase;">📅 Pendientes</div>
                      <div style="font-size: 24px; font-weight: 800; color: ${colors.accent};">${stats.pending}</div>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color: ${colors.bg}; padding: 30px; text-align: center; border-top: 1px solid ${colors.beige};">
              <p style="margin: 0; font-size: 12px; color: #8e7a84; line-height: 1.4;">
                Recibes este correo como parte de tu reporte mensual automatizado de <strong>Task Flow</strong>.
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: ${colors.primary}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                &copy; 2026 Task Flow. Todos los derechos reservados.
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
};