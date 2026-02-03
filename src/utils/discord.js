/**
 * Discord Webhooks - Powiadomienia o akcjach w systemie
 */

const WEBHOOK_EXAMS = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_EXAMS;
const WEBHOOK_ADMIN = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_ADMIN;
const WEBHOOK_REGISTER = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_REGISTER;

/**
 * Wysyła wiadomość na Discord webhook
 */
async function sendWebhook(webhookUrl, payload) {
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
  } catch (error) {
    console.error('Discord webhook error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Powiadomienie o rejestracji nowego użytkownika
 * Tylko dla nowych rejestracji (timeDiff < 60s)
 */
export async function notifyUserAuth(user, timeDiff) {
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

/**
 * Powiadomienie o ukończeniu egzaminu
 */
export async function notifyExamSubmission(examData) {
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
 * Powiadomienie o akcji admina
 */
export async function notifyAdminAction(actionData) {
  const {
    action, // 'archive', 'delete', 'grant_admin', 'revoke_admin', 'force_logout', etc.
    actor, // Kto wykonał akcję
    targetUser, // Na kim (opcjonalne)
    details, // Dodatkowe szczegóły (opcjonalne)
  } = actionData;

  // Mapowanie akcji na emojis i kolory
  const actionMap = {
    archive: { emoji: '📦', title: 'Archiwizacja Egzaminu', color: 0x3498db },
    delete: { emoji: '🗑️', title: 'Usunięcie', color: 0xe74c3c },
    delete_exam: { emoji: '🗑️', title: 'Usunięcie Egzaminu', color: 0xe74c3c },
    delete_user: { emoji: '👤❌', title: 'Usunięcie Użytkownika', color: 0xe74c3c },
    grant_admin: { emoji: '👑', title: 'Nadanie Admina', color: 0xf1c40f },
    revoke_admin: { emoji: '👤', title: 'Odbieranie Admina', color: 0x95a5a6 },
    force_logout: { emoji: '🚪', title: 'Wymuś Wylogowanie', color: 0xe67e22 },
    add_question: { emoji: '➕', title: 'Dodanie Pytania', color: 0x2ecc71 },
    edit_question: { emoji: '✏️', title: 'Edycja Pytania', color: 0x3498db },
    delete_question: { emoji: '🗑️', title: 'Usunięcie Pytania', color: 0xe74c3c },
  };

  const actionInfo = actionMap[action] || {
    emoji: '⚙️',
    title: 'Akcja Admina',
    color: 0x95a5a6,
  };

  const fields = [
    {
      name: 'Administrator',
      value: actor.mta_nick || actor.username || actor.email,
      inline: true,
    },
    {
      name: 'Akcja',
      value: actionInfo.title,
      inline: true,
    },
  ];

  // Dodaj target user jeśli istnieje
  if (targetUser) {
    fields.push({
      name: 'Cel',
      value: targetUser.mta_nick || targetUser.username || targetUser.email,
      inline: true,
    });
  }

  // Dodaj szczegóły jeśli istnieją
  if (details) {
    fields.push({
      name: 'Szczegóły',
      value: details,
      inline: false,
    });
  }

  const payload = {
    embeds: [
      {
        title: `${actionInfo.emoji} ${actionInfo.title}`,
        color: actionInfo.color,
        fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - Panel Administratora',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_ADMIN, payload);
}

/**
 * Powiadomienie o akcji na pytaniu egzaminacyjnym
 */
export async function notifyExamQuestionAction(questionActionData) {
  const {
    action, // 'add', 'edit', 'delete'
    actor,
    examType,
    question, // Tekst pytania (opcjonalnie)
    questionId, // ID pytania
  } = questionActionData;

  const actionVerbs = {
    add: 'Dodanie',
    edit: 'Edycja',
    delete: 'Usunięcie',
  };

  const fields = [
    {
      name: 'Administrator',
      value: actor.mta_nick || actor.username || actor.email,
      inline: true,
    },
    {
      name: 'Typ Egzaminu',
      value: examType,
      inline: true,
    },
  ];

  if (questionId) {
    fields.push({
      name: 'ID Pytania',
      value: questionId.toString(),
      inline: true,
    });
  }

  if (question && action !== 'delete') {
    fields.push({
      name: 'Pytanie',
      value: question.length > 200 ? question.substring(0, 200) + '...' : question,
      inline: false,
    });
  }

  return notifyAdminAction({
    action: `${action}_question`,
    actor,
    details: `${actionVerbs[action]} pytania dla egzaminu: ${examType}`,
  });
}
