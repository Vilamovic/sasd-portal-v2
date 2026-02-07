/**
 * Sentry Server Configuration
 * Catches errors in Node.js (server-side)
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Filtering
  beforeSend(event) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Server]', event);
      return null;
    }

    return event;
  },
});
