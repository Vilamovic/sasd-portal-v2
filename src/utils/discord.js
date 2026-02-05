/**
 * Discord Webhooks - Powiadomienia o akcjach w systemie
 */

const WEBHOOK_EXAMS = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_EXAMS;
const WEBHOOK_ADMIN = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_ADMIN;
const WEBHOOK_REGISTER = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_REGISTER;
const WEBHOOK_ALERT = 'https://discord.com/api/webhooks/1468697045257687112/Dg3MBXbjWK6UajRdQebKMiuh1l5KFrMxPJ5oprSHvtk7_QQGZnodeyKzWnXAikQGoYyU';
const WEBHOOK_KARTOTEKA = 'https://discord.com/api/webhooks/1469077729562329198/q6y-YC61ry9qhWkVvk_ohwiNgn6Anfco-1cwTsLbsiisMbNx0gcx_2ZwAnRj9ZoyDj1P';

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

/**
 * Powiadomienie o wykryciu cheatingu
 */
export async function notifyCheat(cheatData) {
  const {
    username,
    mtaNick,
    email,
    examType,
    cheatType, // 'tab_switch', 'window_blur'
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

// ============================================
// KARTOTEKA - System Zarządzania Personelem
// ============================================

/**
 * Powiadomienie o nadaniu kary/nagrody (PLUS/MINUS/zawieszenie)
 */
export async function notifyPenalty(penaltyData) {
  const {
    type, // 'plus', 'minus', 'zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'upomnienie_pisemne'
    user, // { username, mta_nick }
    description,
    evidenceLink,
    durationHours,
    createdBy, // { username, mta_nick }
  } = penaltyData;

  // Mapowanie typów kar na emojis i kolory
  const penaltyTypeMap = {
    plus: {
      emoji: '➕',
      title: 'Nadano PLUS',
      color: 3066993, // Zielony
    },
    minus: {
      emoji: '➖',
      title: 'Nadano MINUS',
      color: 15158332, // Czerwony
    },
    zawieszenie_sluzba: {
      emoji: '🚫',
      title: 'Zawieszenie w Czynnościach Służbowych',
      color: 16744192, // Pomarańczowy
    },
    zawieszenie_dywizja: {
      emoji: '⚠️',
      title: 'Zawieszenie w Czynnościach Dywizyjnych',
      color: 16744192, // Pomarańczowy
    },
    zawieszenie_uprawnienia: {
      emoji: '🔒',
      title: 'Zawieszenie Uprawnień',
      color: 16744192, // Pomarańczowy
    },
    upomnienie_pisemne: {
      emoji: '📝',
      title: 'Upomnienie Pisemne',
      color: 16744192, // Pomarańczowy
    },
  };

  const penaltyInfo = penaltyTypeMap[type] || {
    emoji: '⚙️',
    title: 'Akcja Kadrowa',
    color: 0x95a5a6,
  };

  const fields = [
    {
      name: 'Użytkownik',
      value: `${user.mta_nick || user.username} (@${user.username})`,
      inline: true,
    },
    {
      name: 'Przez',
      value: createdBy.mta_nick || createdBy.username,
      inline: true,
    },
    {
      name: 'Powód',
      value: description || 'Brak opisu',
      inline: false,
    },
  ];

  // Dodaj czas trwania dla zawieszeń
  if (durationHours && type.startsWith('zawieszenie_')) {
    const days = Math.floor(durationHours / 24);
    const hours = durationHours % 24;
    const durationText = days > 0
      ? `${days} dni ${hours > 0 ? `${hours}h` : ''}`
      : `${hours}h`;

    fields.push({
      name: 'Czas trwania',
      value: durationText,
      inline: true,
    });
  }

  // Dodaj link do dowodu jeśli istnieje
  if (evidenceLink) {
    fields.push({
      name: 'Dowód',
      value: `[Link](${evidenceLink})`,
      inline: true,
    });
  }

  const payload = {
    embeds: [
      {
        title: `${penaltyInfo.emoji} ${penaltyInfo.title}`,
        color: penaltyInfo.color,
        fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Kartoteki',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_KARTOTEKA, payload);
}

/**
 * Powiadomienie o awansie/degradacji
 */
export async function notifyBadgeChange(badgeChangeData) {
  const {
    user, // { username, mta_nick }
    oldBadge,
    newBadge,
    isPromotion, // true = awans, false = degradacja
    createdBy, // { username, mta_nick }
  } = badgeChangeData;

  const emoji = isPromotion ? '⬆️' : '⬇️';
  const title = isPromotion ? 'Awans' : 'Degradacja';
  const color = 12745742; // Złoty

  const payload = {
    embeds: [
      {
        title: `${emoji} ${title}`,
        color,
        fields: [
          {
            name: 'Użytkownik',
            value: `${user.mta_nick || user.username} (@${user.username})`,
            inline: true,
          },
          {
            name: 'Przez',
            value: createdBy.mta_nick || createdBy.username,
            inline: true,
          },
          {
            name: 'Poprzedni Stopień',
            value: oldBadge || 'Brak',
            inline: true,
          },
          {
            name: 'Nowy Stopień',
            value: newBadge,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Kartoteki',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_KARTOTEKA, payload);
}

/**
 * Powiadomienie o nadaniu/odebraniu uprawnienia
 */
export async function notifyPermissionChange(permissionChangeData) {
  const {
    user, // { username, mta_nick }
    permission, // 'SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch'
    isGranted, // true = nadanie, false = odebranie
    createdBy, // { username, mta_nick }
  } = permissionChangeData;

  const emoji = isGranted ? '✅' : '❌';
  const title = isGranted ? 'Nadano Uprawnienie' : 'Odebrano Uprawnienie';
  const color = isGranted ? 3066993 : 15158332; // Zielony/Czerwony

  const payload = {
    embeds: [
      {
        title: `${emoji} ${title}`,
        color,
        fields: [
          {
            name: 'Użytkownik',
            value: `${user.mta_nick || user.username} (@${user.username})`,
            inline: true,
          },
          {
            name: 'Przez',
            value: createdBy.mta_nick || createdBy.username,
            inline: true,
          },
          {
            name: 'Uprawnienie',
            value: permission,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Kartoteki',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_KARTOTEKA, payload);
}

/**
 * Powiadomienie o nadaniu/odebraniu dywizji
 */
export async function notifyDivisionChange(divisionChangeData) {
  const {
    user, // { username, mta_nick }
    division, // 'FTO', 'SS', 'DTU', 'GU'
    isGranted, // true = nadanie, false = odebranie
    createdBy, // { username, mta_nick }
    isCommander, // true jeśli user został Commanderem
  } = divisionChangeData;

  const emoji = isGranted ? '🎖️' : '❌';
  const title = isGranted ? 'Nadano Dywizję' : 'Odebrano Dywizję';
  const color = isGranted ? 3066993 : 15158332; // Zielony/Czerwony

  // Rozszerzona nazwa dywizji
  const divisionNames = {
    FTO: 'Training Staff (FTO)',
    SS: 'Supervisory Staff (SS)',
    DTU: 'Detective Task Unit (DTU)',
    GU: 'Gang Unit (GU)',
  };

  const divisionName = isCommander && isGranted
    ? `${divisionNames[division]} - **Commander**`
    : divisionNames[division] || division;

  const payload = {
    embeds: [
      {
        title: `${emoji} ${title}`,
        color,
        fields: [
          {
            name: 'Użytkownik',
            value: `${user.mta_nick || user.username} (@${user.username})`,
            inline: true,
          },
          {
            name: 'Przez',
            value: createdBy.mta_nick || createdBy.username,
            inline: true,
          },
          {
            name: 'Dywizja',
            value: divisionName,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SASD Portal - System Kartoteki',
        },
      },
    ],
  };

  return sendWebhook(WEBHOOK_KARTOTEKA, payload);
}
