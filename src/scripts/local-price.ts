/**
 * Prices in the visitor's own currency.
 *
 * Checkout is always in INR on Shopify. Visitors abroad (mostly families
 * buying for parents in India) see an approximate local figure first, with the
 * INR price they will actually pay beside it. Visitors in India, or whose
 * location can't be told, see INR exactly as the server rendered it.
 *
 * The country comes from the device's time zone: no server or third party is
 * involved, and the local figure is there as soon as the page script runs.
 * `?currency=SGD` (or `?currency=INR`) overrides it, for testing and support.
 *
 * Markup contract:
 *   data-inr="79999"       shows the amount: local currency abroad, INR at home
 *   data-inr-alt="79999"   hidden at home; abroad shows "(INR 79,999<suffix>)"
 *   data-suffix=" + GST"   optional text after the INR amount in an alt
 *   data-local-note        hidden at home; abroad explains the conversion
 */

import fx from "../../config/fx-rates.json" with { type: "json" };
import { formatInr } from "../data/shopify-configurator";

type Currency = keyof typeof fx.inrPerUnit;

const INDIA_ZONES = new Set(["Asia/Kolkata", "Asia/Calcutta"]);

// Time zones mapped to the currency people there pay in. Any other zone
// outside India falls back to US dollars, which covers the rest of the
// Americas and is the most familiar reference elsewhere.
const CURRENCY_BY_ZONE: Record<string, Currency> = {
  "Asia/Singapore": "SGD", Singapore: "SGD",
  "Asia/Dubai": "AED", "Asia/Riyadh": "SAR", "Asia/Qatar": "QAR",
  "Asia/Kuwait": "KWD", "Asia/Muscat": "OMR", "Asia/Bahrain": "BHD",
  "Asia/Hong_Kong": "HKD", Hongkong: "HKD",
  "Asia/Kuala_Lumpur": "MYR", "Asia/Kuching": "MYR",
  "Asia/Tokyo": "JPY", Japan: "JPY",
  "Europe/London": "GBP", "Europe/Belfast": "GBP", "Europe/Guernsey": "GBP",
  "Europe/Jersey": "GBP", "Europe/Isle_of_Man": "GBP", GB: "GBP",
  "Europe/Zurich": "CHF",
  "Pacific/Auckland": "NZD", "Pacific/Chatham": "NZD", NZ: "NZD",
  ...Object.fromEntries([
    "Amsterdam", "Andorra", "Athens", "Berlin", "Bratislava", "Brussels", "Dublin", "Helsinki",
    "Lisbon", "Ljubljana", "Luxembourg", "Madrid", "Malta", "Monaco", "Paris", "Riga", "Rome",
    "San_Marino", "Tallinn", "Vatican", "Vienna", "Vilnius", "Zagreb", "Nicosia",
  ].map((city) => [`Europe/${city}`, "EUR"])),
  "Asia/Nicosia": "EUR", "Asia/Famagusta": "EUR", "Africa/Ceuta": "EUR",
  "Atlantic/Canary": "EUR", "Atlantic/Madeira": "EUR", "Atlantic/Azores": "EUR",
  ...Object.fromEntries([
    "Toronto", "Montreal", "Vancouver", "Edmonton", "Winnipeg", "Halifax", "St_Johns", "Regina",
    "Moncton", "Glace_Bay", "Goose_Bay", "Whitehorse", "Yellowknife", "Iqaluit", "Swift_Current",
    "Dawson_Creek", "Fort_Nelson", "Rankin_Inlet", "Cambridge_Bay", "Inuvik", "Dawson",
    "Resolute", "Atikokan", "Blanc-Sablon", "Creston", "Nipigon", "Thunder_Bay", "Rainy_River",
  ].map((city) => [`America/${city}`, "CAD"])),
};
const CURRENCY_BY_PREFIX: [string, Currency][] = [["Australia/", "AUD"], ["Canada/", "CAD"]];

const detectCurrency = (): Currency | null => {
  const requested = new URLSearchParams(window.location.search).get("currency")?.toUpperCase();
  if (requested === "INR") return null;
  if (requested && requested in fx.inrPerUnit) return requested as Currency;

  let zone = "";
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""; } catch { /* very old browser */ }
  // UTC is what privacy-hardened browsers report; it says nothing about where someone is.
  if (!zone || INDIA_ZONES.has(zone) || zone === "UTC" || zone.startsWith("Etc/")) return null;
  return CURRENCY_BY_ZONE[zone] ?? CURRENCY_BY_PREFIX.find(([prefix]) => zone.startsWith(prefix))?.[1] ?? "USD";
};

/** The visitor's currency, or null when prices should stay in INR only. */
export const localCurrency = detectCurrency();

const byCode = (currency: string, locale = "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "code", maximumFractionDigits: 0 });
const localFormat = localCurrency ? byCode(localCurrency) : null;
const inrFormat = byCode("INR", "en-IN");

const render = (element: HTMLElement) => {
  if ("inrAlt" in element.dataset) {
    element.hidden = !localCurrency;
    if (localCurrency) element.textContent = `(${inrFormat.format(Number(element.dataset.inrAlt))}${element.dataset.suffix ?? ""})`;
    return;
  }
  const amountInr = Number(element.dataset.inr);
  element.textContent = localFormat && localCurrency
    ? localFormat.format(Math.round(amountInr / fx.inrPerUnit[localCurrency]))
    : formatInr(amountInr);
};

/** Show a new INR amount in a `data-inr` or `data-inr-alt` element. */
export const setPrice = (element: HTMLElement, amountInr: number) => {
  if ("inrAlt" in element.dataset) element.dataset.inrAlt = String(amountInr);
  else element.dataset.inr = String(amountInr);
  render(element);
};

/** Render every price and conversion note under `root` for the visitor's currency. */
export const renderPrices = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLElement>("[data-inr], [data-inr-alt]").forEach(render);
  root.querySelectorAll<HTMLElement>("[data-local-note]").forEach((note) => {
    note.hidden = !localCurrency;
    if (!localCurrency) return;
    const rate = `₹${fx.inrPerUnit[localCurrency].toFixed(2)}`;
    const date = new Date(`${fx.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    note.textContent = `${localCurrency} amounts are approximate, at about ${rate} per ${localCurrency} (rates of ${date}). You pay in INR at checkout; your card provider’s exchange rate and fees apply.`;
  });
};
