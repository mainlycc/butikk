export function generateRejectionEmail(
  fullName: string,
  reason?: string
): string {
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Odpowiedź na zgłoszenie - Butik Kandydatów</title>
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
                Witaj ${fullName}!
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 0 0 16px;">
                Dziękujemy za przesłanie zgłoszenia do Butik Kandydatów. Po dokładnym przeanalizowaniu Twojego zgłoszenia, niestety nie jesteśmy w stanie przyjąć go w tym momencie.
              </p>
              
              ${reason ? `
              <div style="background-color: #f1f5f9; border-left: 4px solid #64748b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #475569; font-size: 14px; line-height: 22px; margin: 0;">
                  <strong>Powód:</strong><br>
                  ${reason}
                </p>
              </div>
              ` : ''}
              
              <p style="color: #334155; font-size: 16px; line-height: 26px; margin: 24px 0 16px;">
                Doceniamy Twoje zainteresowanie naszą platformą i zachęcamy do kontaktu w przyszłości, gdy Twoja sytuacja się zmieni lub będziemy mogli zaoferować odpowiednie możliwości.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0;">
                Jeśli masz pytania, zachęcamy do kontaktu z naszym zespołem.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 16px 0 0;">
                Z poważaniem,<br>
                <strong>Zespół Butik Kandydatów</strong>
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

