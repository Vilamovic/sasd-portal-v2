/**
 * Discord Webhook - Rezerwacja egzaminu praktycznego (portal-termin)
 */
import { sendWebhook } from './utils';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1470157451356536853/4m7mW_VPVAw447YwTvc01_g4aQ9hnoSpgcz9vyRLP_GmL6wRVepX2nWpmZ7UlkjDniZv';

interface ExamBookingNotifyParams {
  booker: { username: string; mta_nick: string | null };
  examiner: { username: string; mta_nick: string | null };
  examType: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export async function notifyExamBooking(params: ExamBookingNotifyParams) {
  const { booker, examiner, examType, date, timeStart, timeEnd } = params;

  const bookerName = booker.mta_nick || booker.username;
  const examinerName = examiner.mta_nick || examiner.username;

  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const payload = {
    embeds: [
      {
        title: '📋 Nowa rezerwacja egzaminu',
        color: 0x3a6a3a,
        fields: [
          { name: 'Typ egzaminu', value: examType, inline: true },
          { name: 'Termin', value: `${formattedDate}\n${timeStart.slice(0, 5)} — ${timeEnd.slice(0, 5)}`, inline: true },
          { name: 'Zdający', value: bookerName, inline: true },
          { name: 'Egzaminator', value: examinerName, inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return sendWebhook(WEBHOOK_URL, payload);
}

export async function notifyExamCancellation(params: ExamBookingNotifyParams) {
  const { booker, examiner, examType, date, timeStart, timeEnd } = params;

  const bookerName = booker.mta_nick || booker.username;
  const examinerName = examiner.mta_nick || examiner.username;

  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const payload = {
    embeds: [
      {
        title: '❌ Anulowanie rezerwacji egzaminu',
        color: 0x8b1a1a,
        fields: [
          { name: 'Typ egzaminu', value: examType, inline: true },
          { name: 'Termin', value: `${formattedDate}\n${timeStart.slice(0, 5)} — ${timeEnd.slice(0, 5)}`, inline: true },
          { name: 'Zdający', value: bookerName, inline: true },
          { name: 'Egzaminator', value: examinerName, inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return sendWebhook(WEBHOOK_URL, payload);
}

export async function notifyExamSlotDeletion(params: {
  examType: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  deletedBy: { username: string; mta_nick: string | null };
  wasBooked: boolean;
  booker?: { username: string; mta_nick: string | null };
}) {
  const { examType, date, timeStart, timeEnd, deletedBy, wasBooked, booker } = params;

  const deleterName = deletedBy.mta_nick || deletedBy.username;

  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const fields = [
    { name: 'Typ egzaminu', value: examType, inline: true },
    { name: 'Termin', value: `${formattedDate}\n${timeStart.slice(0, 5)} — ${timeEnd.slice(0, 5)}`, inline: true },
    { name: 'Usunął', value: deleterName, inline: true },
  ];

  if (wasBooked && booker) {
    const bookerName = booker.mta_nick || booker.username;
    fields.push({ name: 'Zdający (anulowany)', value: bookerName, inline: true });
  }

  const payload = {
    embeds: [
      {
        title: '🗑️ Usunięcie slotu egzaminowego',
        color: 0x555555,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return sendWebhook(WEBHOOK_URL, payload);
}
