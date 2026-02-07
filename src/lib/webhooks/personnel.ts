/**
 * Discord Webhooks - System Zarządzania Personelem (Kartoteka)
 */

const WEBHOOK_KARTOTEKA = 'https://discord.com/api/webhooks/1469077729562329198/q6y-YC61ry9qhWkVvk_ohwiNgn6Anfco-1cwTsLbsiisMbNx0gcx_2ZwAnRj9ZoyDj1P';

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
 * Powiadomienie o nadaniu kary/nagrody (PLUS/MINUS/zawieszenie)
 */
export async function notifyPenalty(penaltyData: {
  type: 'plus' | 'minus' | 'zawieszenie_sluzba' | 'zawieszenie_dywizja' | 'zawieszenie_uprawnienia' | 'zawieszenie_poscigowe' | 'upomnienie_pisemne';
  user: { username: string; mta_nick?: string };
  description?: string;
  evidenceLink?: string;
  durationHours?: number;
  createdBy: { username: string; mta_nick?: string };
}) {
  const {
    type,
    user,
    description,
    evidenceLink,
    durationHours,
    createdBy,
  } = penaltyData;

  // Mapowanie typów kar na emojis i kolory
  const penaltyTypeMap: Record<string, { emoji: string; title: string; color: number }> = {
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
    zawieszenie_poscigowe: {
      emoji: '🚔',
      title: 'Zawieszenie Uprawnień Pościgowych',
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

  const fields: any[] = [
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
export async function notifyBadgeChange(badgeChangeData: {
  user: { username: string; mta_nick?: string };
  oldBadge?: string;
  newBadge: string;
  isPromotion: boolean;
  createdBy: { username: string; mta_nick?: string };
}) {
  const {
    user,
    oldBadge,
    newBadge,
    isPromotion,
    createdBy,
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
export async function notifyPermissionChange(permissionChangeData: {
  user: { username: string; mta_nick?: string };
  permission: string;
  isGranted: boolean;
  createdBy: { username: string; mta_nick?: string };
}) {
  const {
    user,
    permission,
    isGranted,
    createdBy,
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
export async function notifyDivisionChange(divisionChangeData: {
  user: { username: string; mta_nick?: string };
  division: 'FTO' | 'SS' | 'DTU' | 'GU';
  isGranted: boolean;
  createdBy: { username: string; mta_nick?: string };
  isCommander?: boolean;
}) {
  const {
    user,
    division,
    isGranted,
    createdBy,
    isCommander,
  } = divisionChangeData;

  const emoji = isGranted ? '🎖️' : '❌';
  const title = isGranted ? 'Nadano Dywizję' : 'Odebrano Dywizję';
  const color = isGranted ? 3066993 : 15158332; // Zielony/Czerwony

  // Rozszerzona nazwa dywizji
  const divisionNames: Record<string, string> = {
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
