import { captureException, init } from '@sentry/browser';
import { PUBLIC_SENTRY_DSN } from 'astro:env/client';

// Telemetry catches errors itself, and Bugsink has no use for sessions
const skip = ['GlobalHandlers', 'BrowserApiErrors', 'BrowserSession'];

export function start() {
  init({
    dsn: PUBLIC_SENTRY_DSN,
    sendClientReports: false,
    dataCollection: { userInfo: false },
    integrations: (all) => all.filter(({ name }) => !skip.includes(name)),
  });
  return captureException;
}
