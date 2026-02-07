/**
 * Sentry Client Configuration
 * Catches errors in browser (client-side)
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions (adjust based on traffic)

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking (auto-set by Vercel)
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Filtering
  beforeSend(event, hint) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry]', event);
      return null;
    }

    // Filter out specific errors
    const error = hint.originalException;
    if (error && typeof error === 'string') {
      // Ignore known non-critical errors
      if (error.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
    }

    return event;
  },
});
