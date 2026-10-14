import { datadogRum } from '@datadog/browser-rum';

/* Datadog RUM: real-player sessions, errors and game events.
   Only the production build (the live site) reports, so local dev doesn't pollute the data.
   The application id and client token are public by design: they can only send data, not read it.
   Sample rates and privacy are managed in Datadog via remote configuration, no deploy needed. */
const enabled = import.meta.env.PROD;
// the live site reports as prod; a local `npm run preview` as local, so test sessions are easy to filter out
const env = location.hostname.endsWith('github.io') ? 'prod' : 'local';

export function initMonitoring() {
  if (!enabled) return;
  datadogRum.init({
    applicationId: 'd3255fde-cdc4-498f-b528-c16247675580',
    clientToken: 'pube393ee5c4f56a5da695061c837aaa3e2',
    remoteConfiguration: { id: 'c9fba9f2-08d1-454d-b934-a82606f27065' },
    site: 'datadoghq.com',
    service: 'tuersteher-berlin',
    env,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackResources: true,
    trackUserInteractions: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input'
  });
}

/** A game event (door rejected, quest done, …). Use snake_case names; keep context values short strings or numbers. */
export function track(name: string, context: Record<string, string | number | boolean> = {}) {
  if (enabled) datadogRum.addAction(name, context);
}
