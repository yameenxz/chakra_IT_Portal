/**
 * Monthly batch naming.
 *
 * A batch runs from the 15th of one month to the 14th of the next, and is
 * named after the month it starts in:
 *
 *   15 Aug 2026 – 14 Sep 2026  →  "August 2026"
 *   15 Sep 2026 – 14 Oct 2026  →  "September 2026"
 *
 * The original algorithm was correct. Two things about it were not:
 *
 *  1. It used `new Date()` and `.getDate()`, which read the HOST timezone.
 *     On the server that is whatever the OS is set to; in a client component
 *     it is the viewer's browser. Those are not the same clock, and at the
 *     boundary they disagree by a whole batch.
 *
 *  2. It was duplicated verbatim inside src/app/partner/page.tsx, which is a
 *     "use client" component — so the Partner dashboard computed the batch in
 *     the partner's local timezone while the Guru dashboard and the upload API
 *     used the server's.
 *
 * This version pins the timezone explicitly, so every caller — server or
 * client, wherever the viewer happens to be — agrees on which batch is active.
 */

/** The firm's operating timezone. Batch boundaries are defined in local time. */
export const BATCH_TIMEZONE =
  process.env.NEXT_PUBLIC_BATCH_TIMEZONE ?? "Asia/Kolkata";

/** Day of month on which a new batch opens. */
const BATCH_START_DAY = 15;

/**
 * Name of the batch active at `now`.
 *
 * `now` is injectable so the boundary cases can be unit-tested without
 * mocking the system clock — see batch.test.ts.
 */
export function getCurrentBatchName(
  now: Date = new Date()
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BATCH_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  const part = (type: string): number =>
    Number(
      parts.find((p) => p.type === type)?.value ?? "0"
    );

  const day = part("day");
  let month = part("month") - 1; // Intl months are 1-based
  let year = part("year");

  if (day < BATCH_START_DAY) {
    month -= 1;

    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  // Build the label in UTC so the month name can't be shifted by the host.
  const monthName = new Date(
    Date.UTC(year, month, 1)
  ).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });

  return `${monthName} ${year}`;
}

/**
 * Inclusive start and end instants of a batch, for querying by date range
 * rather than by name. Not currently used, but the alternative is parsing
 * the display string back into dates, which is worse.
 */
export function getBatchWindow(
  now: Date = new Date()
): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BATCH_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  const part = (type: string): number =>
    Number(
      parts.find((p) => p.type === type)?.value ?? "0"
    );

  const day = part("day");
  let month = part("month") - 1;
  let year = part("year");

  if (day < BATCH_START_DAY) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  const start = new Date(
    Date.UTC(year, month, BATCH_START_DAY)
  );

  const end = new Date(
    Date.UTC(year, month + 1, BATCH_START_DAY - 1, 23, 59, 59, 999)
  );

  return { start, end };
}
