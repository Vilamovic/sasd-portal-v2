/**
 * Discord Webhooks - Shared Utilities
 */

/**
 * Wysyła wiadomość na Discord webhook
 */
export async function sendWebhook(webhookUrl: string | undefined, payload: any) {
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
