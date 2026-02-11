/**
 * Discord Webhook - Raporty dywizji (portal-report)
 */
import { sendWebhook } from './utils';
import { DIVISION_COLORS } from '@/src/components/divisions/Reports/reportConfig';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471067560194605110/hT8ftPX-DlHS0VDBCYNME1HTQcNg0cCyADE4SHTxchd1OQuuC2VwA9E6wGRsz5IaJyvO';

interface ReportNotifyParams {
  division: string;
  reportTypeLabel: string;
  author: { username: string; mta_nick: string | null };
  date: string;
  time: string;
  location: string;
  participants: string[]; // usernames
}

export async function notifyDivisionReport(params: ReportNotifyParams) {
  const { division, reportTypeLabel, author, date, time, location, participants } = params;

  const authorName = author.mta_nick || author.username;
  const color = DIVISION_COLORS[division] || 0x3a6a3a;

  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const fields = [
    { name: 'Dywizja', value: division, inline: true },
    { name: 'Typ raportu', value: reportTypeLabel, inline: true },
    { name: 'Autor', value: authorName, inline: true },
    { name: 'Data zdarzenia', value: `${formattedDate}, ${time}`, inline: true },
    { name: 'Lokalizacja', value: location || 'Nie podano', inline: true },
  ];

  if (participants.length > 0) {
    fields.push({ name: 'Uczestnicy', value: participants.join(', '), inline: false });
  }

  const payload = {
    embeds: [
      {
        title: `📋 Nowy raport — ${division}`,
        color,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return sendWebhook(WEBHOOK_URL, payload);
}
