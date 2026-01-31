// lib/log/logit.client.ts
export async function logit(domain: string, payload: any = {}, meta: any = {}) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain, payload, meta }),
    });
  } catch (err) {
    // swallow errors on client - avoid throwing
    // eslint-disable-next-line no-console
    console.error('Client-side log failed', err);
  }
}
