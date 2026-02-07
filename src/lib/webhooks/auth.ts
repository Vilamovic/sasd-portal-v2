/**
 * Discord Webhooks - Autoryzacja i Rejestracja
 */

const WEBHOOK_REGISTER = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_REGISTER;

/**
 * Wysyła wiadomość na Discord webhook
 */
async function sendWebhook(webhookUrl: string | undefined, payload: any) {
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return { success: false, error: 'Webhook URL missing' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Discord webhook error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Powiadomienie o rejestracji nowego użytkownika
 * Tylko dla nowych rejestracji (timeDiff < 60s)
 */
export async function notifyUserAuth(user: any, timeDiff: number) {
  // Wysyłaj tylko dla nowych rejestracji
  if (timeDiff >= 60) {
    return { success: false, skipped: true };
  }

  const payload = {
    embeds: [
      {
        title: '📝 Nowa Rejestracja',
        color: 0x00ff00, // Zielony
        fields: [
          {
            name: 'Użytkownik',
            value: user.username || 'N/A',
            inline: true,
          },
          {
            name: 'Email',
            value: user.email || 'N/A',
            inline: true,
          },
          {
            name: 'MTA Nick',
            value: user.mta_nick || 'Nie ustawiono',
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Rejestracji',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_REGISTER, payload);
}
