/**
 * Discord Webhooks - Panel Administratora
 */

const WEBHOOK_ADMIN = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_ADMIN;

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
 * Powiadomienie o akcji admina
 */
export async function notifyAdminAction(actionData: {
  action: string;
  actor: { mta_nick?: string; username?: string; email?: string };
  targetUser?: { mta_nick?: string; username?: string; email?: string };
  details?: string;
}) {
  const {
    action,
    actor,
    targetUser,
    details,
  } = actionData;

  // Mapowanie akcji na emojis i kolory
  const actionMap: Record<string, { emoji: string; title: string; color: number }> = {
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

  const fields: any[] = [
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
export async function notifyExamQuestionAction(questionActionData: {
  action: 'add' | 'edit' | 'delete';
  actor: { mta_nick?: string; username?: string; email?: string };
  examType: string;
  question?: string;
  questionId?: number;
}) {
  const {
    action,
    actor,
    examType,
    question,
    questionId,
  } = questionActionData;

  const actionVerbs: Record<string, string> = {
    add: 'Dodanie',
    edit: 'Edycja',
    delete: 'Usunięcie',
  };

  const fields: any[] = [
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
