/**
 * Discord Webhooks - System Egzaminacyjny
 */

const WEBHOOK_EXAMS = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_EXAMS;
const WEBHOOK_ALERT = 'https://discord.com/api/webhooks/1468697045257687112/Dg3MBXbjWK6UajRdQebKMiuh1l5KFrMxPJ5oprSHvtk7_QQGZnodeyKzWnXAikQGoYyU';

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
 * Powiadomienie o ukończeniu egzaminu
 */
export async function notifyExamSubmission(examData: {
  username: string;
  examType: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  examId: string;
  passingThreshold?: number;
}) {
  const {
    username,
    examType,
    score,
    total,
    percentage,
    passed,
    examId,
  } = examData;

  // Określ próg zdania
  const threshold = examType.toLowerCase().includes('trainee') ||
    examType.toLowerCase().includes('pościgowy') ||
    examType.toLowerCase().includes('swat')
    ? 50
    : 75;

  const payload = {
    embeds: [
      {
        title: `${passed ? '✅' : '❌'} Egzamin ${passed ? 'Zdany' : 'Niezaliczony'}`,
        color: passed ? 0x00ff00 : 0xff0000, // Zielony/Czerwony
        fields: [
          {
            name: 'Zdający',
            value: username,
            inline: true,
          },
          {
            name: 'Typ Egzaminu',
            value: examType,
            inline: true,
          },
          {
            name: 'Wynik',
            value: `${score}/${total} (${percentage.toFixed(1)}%)`,
            inline: true,
          },
          {
            name: 'Próg Zdania',
            value: `${threshold}%`,
            inline: true,
          },
          {
            name: 'ID Egzaminu',
            value: examId,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Egzaminacyjny',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_EXAMS, payload);
}

/**
 * Powiadomienie o wykryciu cheatingu
 */
export async function notifyCheat(cheatData: {
  username: string;
  mtaNick: string;
  email: string;
  examType: string;
  cheatType: 'tab_switch' | 'window_blur';
  timestamp: string;
}) {
  const {
    username,
    mtaNick,
    email,
    examType,
    cheatType,
    timestamp,
  } = cheatData;

  const cheatTypeMap = {
    tab_switch: {
      emoji: '🚨',
      title: 'Wykryto Przełączenie Karty',
      description: 'Użytkownik przełączył kartę podczas egzaminu',
      color: 0xff0000, // Czerwony
    },
    window_blur: {
      emoji: '⚠️',
      title: 'Wykryto Utratę Focusu',
      description: 'Okno przeglądarki straciło focus podczas egzaminu',
      color: 0xffa500, // Pomarańczowy
    },
  };

  const cheatInfo = cheatTypeMap[cheatType] || {
    emoji: '🔴',
    title: 'Podejrzana Aktywność',
    description: 'Wykryto podejrzaną aktywność podczas egzaminu',
    color: 0xff0000,
  };

  const payload = {
    embeds: [
      {
        title: `${cheatInfo.emoji} ${cheatInfo.title}`,
        description: cheatInfo.description,
        color: cheatInfo.color,
        fields: [
          {
            name: 'Użytkownik',
            value: username || 'N/A',
            inline: true,
          },
          {
            name: 'MTA Nick',
            value: mtaNick || 'Brak',
            inline: true,
          },
          {
            name: 'Email',
            value: email || 'N/A',
            inline: true,
          },
          {
            name: 'Typ Egzaminu',
            value: examType,
            inline: true,
          },
          {
            name: 'Typ Oszustwa',
            value: cheatInfo.title,
            inline: true,
          },
          {
            name: 'Czas Wykrycia',
            value: new Date(timestamp).toLocaleString('pl-PL'),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Anty-Cheating',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_ALERT, payload);
}
