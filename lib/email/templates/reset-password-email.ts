export function generateResetPasswordEmail(
  resetLink: string,
  expiryHours: number = 1
): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resetowanie hasła - Butik Kandydatów</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e293b; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">Butik Kandydatów</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Otrzymaliśmy żądanie zresetowania hasła do Twojego konta.
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Aby ustawić nowe hasło, kliknij poniższy przycisk:
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                      Zresetuj hasło
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 24px 0 8px;">
                Lub skopiuj i wklej poniższy link do przeglądarki:
              </p>
              
              <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin: 0 0 24px;">
                ${resetLink}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0 0 8px;">
                <strong>Ważne:</strong> Link do resetowania hasła jest ważny przez ${expiryHours} ${expiryHours === 1 ? 'godzinę' : expiryHours < 5 ? 'godziny' : 'godzin'}.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0 0 8px;">
                Jeśli nie prosiłeś o zresetowanie hasła, możesz zignorować tę wiadomość. Twoje hasło pozostanie bez zmian.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0;">
                Ze względów bezpieczeństwa nie udostępniaj tego linku osobom trzecim.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

