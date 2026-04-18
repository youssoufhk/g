/**
 * Single source of truth for currency, date, and number formatting.
 * Every page must use these helpers - do not reinvent per page.
 *
 * Currency output uses NBSP (\u00a0) between symbol and amount per OPUS C16.
 * Date output is locale-aware via Intl.DateTimeFormat.
 */

const NBSP = "\u00a0";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "\u20ac",
  USD: "$",
  GBP: "\u00a3",
  CHF: "CHF",
  JPY: "\u00a5",
};

export type CurrencyCode = "EUR" | "USD" | "GBP" | "CHF" | "JPY" | string;

export function currencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

/**
 * Format a money amount with currency symbol and NBSP.
 * Default locale "en-GB" gives "1,250.00" (comma thousands, dot decimal).
 * Pass "fr-FR" for "1\u00a0250,00" if needed.
 *
 * Examples:
 *   formatCurrency(1250, "EUR")          -> "\u20ac\u00a01,250.00"
 *   formatCurrency(1250, "GBP")          -> "\u00a3\u00a01,250.00"
 *   formatCurrency(1250, "EUR", { fractionDigits: 0 }) -> "\u20ac\u00a01,250"
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "EUR",
  opts: { locale?: string; fractionDigits?: number } = {},
): string {
  const { locale = "en-GB", fractionDigits = 2 } = opts;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
  return `${currencySymbol(currency)}${NBSP}${formatted}`;
}

/**
 * Compact currency for KPI / dashboard use ("\u20ac\u00a012.5k", "\u20ac\u00a01.2M").
 * Returns "-" for non-positive values.
 */
export function formatCurrencyCompact(amount: number, currency: CurrencyCode = "EUR"): string {
  if (amount <= 0) return "-";
  const sym = currencySymbol(currency);
  if (amount >= 1_000_000) {
    return `${sym}${NBSP}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `${sym}${NBSP}${Math.round(amount / 1000)}k`;
  }
  if (amount >= 1000) {
    return `${sym}${NBSP}${(amount / 1000).toFixed(1)}k`;
  }
  return `${sym}${NBSP}${Math.round(amount)}`;
}

export type DateFormat = "short" | "medium" | "long" | "iso" | "monthDay" | "withTime" | "weekdayLong";

/**
 * Format an ISO date string.
 *
 *   short        -> "5 Apr"
 *   medium       -> "5 Apr 2026"
 *   long         -> "5 April 2026"
 *   iso          -> "2026-04-05"
 *   monthDay     -> "Apr 5"
 *   withTime     -> "5 Apr 2026, 14:30"
 *   weekdayLong  -> "Saturday, 5 April"
 */
export function formatDate(iso: string | Date, format: DateFormat = "medium", locale: string = "en-GB"): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  switch (format) {
    case "short":
      return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
    case "medium":
      return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    case "long":
      return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    case "iso":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    case "monthDay":
      return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
    case "withTime":
      return `${d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
    case "weekdayLong":
      return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    default:
      return d.toLocaleDateString(locale);
  }
}

/** Map a next-intl locale ("en", "fr", ...) to an Intl locale ("en-GB", "fr-FR"). */
export function intlLocale(locale: string): string {
  return locale === "fr" ? "fr-FR" : "en-GB";
}

/**
 * Format a period (start - end). Collapses to a single date if start === end.
 * Uses a hyphen separator (CLAUDE.md rule 5: never em dash).
 */
export function formatPeriod(startIso: string, endIso: string, locale: string = "en-GB"): string {
  if (startIso === endIso) return formatDate(startIso, "medium", locale);
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    const sDay = s.toLocaleDateString(locale, { day: "numeric" });
    const tail = e.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
    return `${sDay} - ${tail}`;
  }
  return `${formatDate(startIso, "short", locale)} - ${formatDate(endIso, "medium", locale)}`;
}

/** Compute inclusive day count between two ISO dates. */
export function daysBetween(startIso: string, endIso: string): number {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

/** Format a number with locale grouping. Tabular-nums by default in CSS. */
export function formatNumber(value: number, locale: string = "en-GB", fractionDigits: number = 0): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
