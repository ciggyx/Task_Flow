import { SendStatsEmailDto } from '../mail/dto/send-user-stats.dto';

export const statsReportTemplate = (data: SendStatsEmailDto) => {
  const { user, stats, month, year } = data;

  const colors = {
    primary: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#f3f4f6'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Activity Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.bg}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td bgcolor="${colors.primary}" style="padding: 30px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Monthly Activity Report</h1>
              <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Performance Summary</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; margin-top: 0;">Hi <strong>${user.name}</strong>,</p>
              <p style="color: #666666; font-size: 14px; line-height: 1.5;">
                Here is your performance summary for the period: <strong>${month}/${year}</strong>.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Completion Rate</p>
                <div style="font-size: 48px; font-weight: 800; color: ${colors.primary};">${stats.completionRate}</div>
                
                <div style="background-color: #e5e7eb; border-radius: 999px; height: 10px; width: 80%; margin: 10px auto; overflow: hidden;">
                  <div style="background-color: ${colors.primary}; height: 100%; width: ${stats.completionRate}; border-radius: 999px;"></div>
                </div>
              </div>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td width="50%" style="padding-right: 10px; padding-bottom: 20px;">
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid ${colors.primary};">
                      <div style="font-size: 12px; color: #6b7280;">Total Tasks</div>
                      <div style="font-size: 20px; font-weight: bold; color: #111827;">${stats.totalTasks}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px; padding-bottom: 20px;">
                    <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid ${colors.success};">
                      <div style="font-size: 12px; color: #065f46;">✅ Completed</div>
                      <div style="font-size: 20px; font-weight: bold; color: #064e3b;">${stats.completed}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid ${colors.warning};">
                      <div style="font-size: 12px; color: #92400e;">⏳ In Progress</div>
                      <div style="font-size: 20px; font-weight: bold; color: #78350f;">${stats.inProgress}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid ${colors.danger};">
                      <div style="font-size: 12px; color: #991b1b;">📅 Pending</div>
                      <div style="font-size: 20px; font-weight: bold; color: #7f1d1d;">${stats.pending}</div>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                You are receiving this email as part of your automated monthly report.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                &copy; 2026 Task Service. All rights reserved.
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