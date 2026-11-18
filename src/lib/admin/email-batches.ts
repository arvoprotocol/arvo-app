export type BroadcastRecipient = { email: string; name: string };
type Progress = { sent: number; total: number; waiting?: boolean };
type Options = {
  subject: string;
  body: string;
  recipients: BroadcastRecipient[];
  onProgress?: (progress: Progress) => void;
  onConfirmed?: (remaining: BroadcastRecipient[]) => void;
  request?: typeof fetch;
  /** 'waitlist' adds unsubscribe links and skips unsubscribed contacts server-side. */
  audience?: 'waitlist';
  wait?: (milliseconds: number) => Promise<void>;
};
export type BroadcastResult = {
  sent: number;
  remaining: BroadcastRecipient[];
  uncertain: BroadcastRecipient[];
  error: string;
};

// Uses the existing authenticated sender and its existing 100-recipient limit.
// Only a 429 may be retried automatically: the route rejects it before sending.
export async function sendEmailBatches(options: Options): Promise<BroadcastResult> {
  const request = options.request ?? fetch;
  const wait = options.wait ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const unique = new Map<string, BroadcastRecipient>();
  for (const recipient of options.recipients) {
    const email = recipient.email.trim().toLowerCase();
    if (email) unique.set(email, { ...recipient, email });
  }
  let remaining = [...unique.values()];
  const total = remaining.length;
  let sent = 0;
  while (remaining.length) {
    const batch = remaining.slice(0, 100);
    let response: Response;
    let throttled = 0;
    for (;;) {
      try {
        response = await request('/api/admin/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'send', subject: options.subject, body: options.body, recipients: batch, audience: options.audience }),
        });
      } catch {
        return { sent, remaining: remaining.slice(batch.length), uncertain: batch,
          error: 'The connection ended before this batch was confirmed. Check Recent emails before sending those addresses again.' };
      }
      if (response.status !== 429) break;
      if (++throttled > 12) return { sent, remaining, uncertain: [], error: 'The sending limit is still active. No more requests were made. Resume later for the remaining recipients.' };
      options.onProgress?.({ sent, total, waiting: true });
      // Keep the existing limiter. Wait in the browser, without retrying sent mail.
      await wait(60_000);
    }
    if ([400, 401, 403, 413, 415].includes(response.status)) {
      return { sent, remaining, uncertain: [], error: response.status === 401 || response.status === 403
        ? 'Your admin session or origin could not be verified. Reconnect before sending the remaining recipients.'
        : 'This batch was rejected before sending. Check the subject, message and recipient details.' };
    }
    let result: Record<string, unknown>;
    try { result = await response.json() as Record<string, unknown>; }
    catch {
      return { sent, remaining: remaining.slice(batch.length), uncertain: batch, error: 'The batch response could not be read. Check Recent emails before retrying these addresses.' };
    }
    const failed = Array.isArray(result.failed) && result.failed.every(value => typeof value === 'string')
      ? new Set((result.failed as string[]).map(email => email.toLowerCase())) : null;
    const skipped = typeof result.skipped === 'number' && Number.isSafeInteger(result.skipped) && result.skipped >= 0 ? result.skipped : 0;
    const fullSuccess = response.status === 200 && result.ok === true && result.sent === batch.length - skipped;
    const knownFailure = failed !== null && [...failed].every(email => batch.some(r => r.email === email))
      && failed.size > 0 && result.sent === batch.length - failed.size - skipped
      && (response.status === 207 || response.status === 500);
    if (!fullSuccess && !knownFailure) {
      return { sent, remaining: remaining.slice(batch.length), uncertain: batch,
        error: 'The server did not confirm a complete result for this batch. Check Recent emails before retrying these addresses.' };
    }
    const failedRecipients = knownFailure ? batch.filter(recipient => failed!.has(recipient.email)) : [];
    sent += batch.length - failedRecipients.length - skipped;
    remaining = [...failedRecipients, ...remaining.slice(batch.length)];
    options.onConfirmed?.(remaining);
    options.onProgress?.({ sent, total });
    if (failedRecipients.length) return {
      sent, remaining, uncertain: [],
      error: `${failedRecipients.length} email(s) failed. Confirmed recipients were removed; only failed and unattempted recipients remain selected.`,
    };
  }
  return { sent, remaining, uncertain: [], error: '' };
}
