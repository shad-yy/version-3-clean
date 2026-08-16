/**
 * Date and time formatting for a global audience.
 *
 * Why this exists: the site previously hardcoded `en-GB` in 33 places and
 * `Europe/London` in 5, so every kick-off time on the site was rendered in London
 * local time with British formatting — for every visitor on Earth. A viewer in
 * Sydney saw a Saturday 17:30 fixture as "Sat 17:30" when it starts at 02:30 on
 * Sunday where they are. That is not a cosmetic problem; it is wrong information.
 *
 * Rules:
 *  - Never hardcode a locale. Pass one, or let the runtime decide.
 *  - Never hardcode a timezone unless the value genuinely belongs to a place —
 *    a broadcast listing for a specific country legitimately carries its own
 *    IANA zone (see lib/data/broadcast-rights.ts).
 *  - Never print a timezone abbreviation like "BST" as a literal string. Let
 *    Intl emit it, or omit it.
 *
 * SSR note: passing `undefined` as the locale makes Intl use the runtime default,
 * which differs between server and client and causes hydration mismatches. For
 * server-rendered timestamps either pass an explicit locale, or render the machine
 * value in the markup and localise on the client after mount.
 */

/** Locale used when a caller has none. Deliberately region-neutral. */
export const DEFAULT_LOCALE = "en"

export interface FormatOptions {
  /** BCP 47 tag, e.g. "en", "fr-FR". Omit to use DEFAULT_LOCALE. */
  locale?: string
  /** IANA zone, e.g. "Europe/Paris". Omit to use the runtime's zone. */
  timeZone?: string
}

function parse(value: string | number | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Safe wrapper around Intl.DateTimeFormat.
 *
 * Returns an empty string rather than throwing or printing "Invalid Date" —
 * a blank slot is recoverable in the UI, a wrong or broken time is not.
 */
function format(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions,
  { locale = DEFAULT_LOCALE, timeZone }: FormatOptions = {},
): string {
  const date = parse(value)
  if (!date) return ""
  try {
    return new Intl.DateTimeFormat(locale, { ...options, ...(timeZone ? { timeZone } : {}) }).format(date)
  } catch {
    // Unknown locale or timezone. Better to show nothing than something wrong.
    return ""
  }
}

/** "Sat 22 Aug" */
export function formatDate(value: string | number | Date, opts?: FormatOptions): string {
  return format(value, { weekday: "short", day: "numeric", month: "short" }, opts)
}

/** "22 August 2026" */
export function formatLongDate(value: string | number | Date, opts?: FormatOptions): string {
  return format(value, { day: "numeric", month: "long", year: "numeric" }, opts)
}

/** "17:30" — 24-hour, since most of the world uses it and sport listings assume it. */
export function formatTime(value: string | number | Date, opts?: FormatOptions): string {
  return format(value, { hour: "2-digit", minute: "2-digit", hour12: false }, opts)
}

/** "Sat 22 Aug, 17:30" */
export function formatDateTime(value: string | number | Date, opts?: FormatOptions): string {
  return format(
    value,
    { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false },
    opts,
  )
}

/**
 * Kick-off time with its timezone name, e.g. "17:30 BST".
 *
 * The abbreviation comes from Intl for the given zone — never a hardcoded string.
 * A literal "BST" is wrong for half the year even in Britain.
 */
export function formatKickoff(value: string | number | Date, opts?: FormatOptions): string {
  return format(value, { hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }, opts)
}

/** The visitor's IANA timezone. Client-side only; returns undefined on the server. */
export function getViewerTimeZone(): string | undefined {
  if (typeof Intl === "undefined") return undefined
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

/** The visitor's preferred locale. Client-side only; returns undefined on the server. */
export function getViewerLocale(): string | undefined {
  if (typeof navigator === "undefined") return undefined
  return navigator.language || undefined
}

/** ISO 8601 for `<time dateTime>` and schema. Always safe to server-render. */
export function toIsoString(value: string | number | Date): string {
  return parse(value)?.toISOString() ?? ""
}
