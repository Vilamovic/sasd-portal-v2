/**
 * Discord Webhooks - Autoryzacja i Rejestracja
 */

import { sendWebhook } from './utils';

const WEBHOOK_REGISTER = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_REGISTER;

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
