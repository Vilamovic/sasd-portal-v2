/**
 * Discord Webhooks - System Zgłoszeń
 */

import { sendWebhook } from './utils';

const WEBHOOK_SUBMISSIONS = 'https://discord.com/api/webhooks/1470073559505178758/Stv65QK_zyhRLYR4U4pXdqTbHbQRaKhdra5AQ-8zO1XYwIfDC_40XyRGIUB7zfmCt0TQ';

const TYPE_MAP: Record<string, { emoji: string; title: string; color: number }> = {
  bug_report: { emoji: '🐛', title: 'Zgłoszenie Błędu', color: 15158332 },
  division_application: { emoji: '📋', title: 'Podanie do Dywizji', color: 3447003 },
  idea: { emoji: '💡', title: 'Pomysł / Propozycja', color: 16776960 },
  vacation: { emoji: '🏖️', title: 'Wniosek o Urlop', color: 3066993 },
  excuse: { emoji: '📝', title: 'Usprawiedliwienie', color: 16744192 },
  exam_booking: { emoji: '🎯', title: 'Rezerwacja Egzaminu', color: 10181046 },
  plus_exchange: { emoji: '🔄', title: 'Wymiana Plusów', color: 15844367 },
};

/**
 * Powiadomienie o nowym zgłoszeniu
 */
export async function notifyNewSubmission(submissionData: {
  type: string;
  title?: string;
  description?: string;
  user: { username: string; mta_nick?: string };
  metadata?: Record<string, any>;
}) {
  const { type, title, user, metadata } = submissionData;

  const typeInfo = TYPE_MAP[type] || { emoji: '📄', title: 'Zgłoszenie', color: 0x95a5a6 };

  const fields: any[] = [
    {
      name: 'Autor',
      value: `${user.mta_nick || user.username} (@${user.username})`,
      inline: true,
    },
    {
      name: 'Typ',
      value: typeInfo.title,
      inline: true,
    },
  ];

  if (title) {
    fields.push({ name: 'Tytuł', value: title, inline: false });
  }

  // Type-specific fields
  if (type === 'division_application' && metadata?.division) {
    fields.push({ name: 'Dywizja', value: metadata.division, inline: true });
  }
  if (type === 'vacation' && metadata?.date_from && metadata?.date_to) {
    fields.push({ name: 'Okres', value: `${metadata.date_from} → ${metadata.date_to}`, inline: true });
  }
  if (type === 'plus_exchange' && metadata?.benefit) {
    fields.push({ name: 'Benefit', value: `${metadata.benefit} (koszt: ${metadata.cost} plusów)`, inline: true });
  }
  if (type === 'idea' && metadata?.category) {
    fields.push({ name: 'Kategoria', value: metadata.category === 'frakcja' ? 'Frakcja' : 'Strona', inline: true });
  }

  const payload = {
    embeds: [
      {
        title: `${typeInfo.emoji} Nowe Zgłoszenie: ${typeInfo.title}`,
        color: typeInfo.color,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'SASD Portal - System Zgłoszeń' },
      },
    ],
  };

  return sendWebhook(WEBHOOK_SUBMISSIONS, payload);
}

/**
 * Powiadomienie o zmianie statusu zgłoszenia
 */
export async function notifySubmissionStatusChange(data: {
  type: string;
  title?: string;
  status: 'approved' | 'rejected';
  user: { username: string; mta_nick?: string };
  reviewedBy: { username: string; mta_nick?: string };
  adminResponse?: string;
}) {
  const { type, title, status, user, reviewedBy, adminResponse } = data;

  const typeInfo = TYPE_MAP[type] || { emoji: '📄', title: 'Zgłoszenie', color: 0x95a5a6 };
  const statusEmoji = status === 'approved' ? '✅' : '❌';
  const statusText = status === 'approved' ? 'Zaakceptowane' : 'Odrzucone';
  const color = status === 'approved' ? 3066993 : 15158332;

  const fields: any[] = [
    { name: 'Autor', value: `${user.mta_nick || user.username} (@${user.username})`, inline: true },
    { name: 'Rozpatrzone przez', value: reviewedBy.mta_nick || reviewedBy.username, inline: true },
    { name: 'Typ', value: typeInfo.title, inline: true },
  ];

  if (title) {
    fields.push({ name: 'Tytuł', value: title, inline: false });
  }
  if (adminResponse) {
    fields.push({ name: 'Odpowiedź', value: adminResponse, inline: false });
  }

  const payload = {
    embeds: [
      {
        title: `${statusEmoji} Zgłoszenie ${statusText}`,
        color,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'SASD Portal - System Zgłoszeń' },
      },
    ],
  };

  return sendWebhook(WEBHOOK_SUBMISSIONS, payload);
}
