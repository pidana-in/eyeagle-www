// Refresh config/fx-rates.json, the rates /store uses to show prices in a visitor's local currency.
// Checkout is always in INR; these only power the approximate local figure shown beside it.
//
//   node scripts/update-fx-rates.mjs
//
// Floating currencies come from the ECB reference rates (frankfurter.dev, no key needed). Gulf
// currencies are not in the ECB set; they are pegged to the US dollar, so they are derived from it.
import { readFile, writeFile } from "node:fs/promises";

const outputPath = new URL("../config/fx-rates.json", import.meta.url);

// Local currency units per US dollar. KWD follows a basket rather than a hard peg, but has stayed
// within about 1% of this for years; check it when refreshing.
const USD_PEGS = { AED: 3.6725, SAR: 3.75, QAR: 3.64, OMR: 0.3845, BHD: 0.376, KWD: 0.306 };
const ECB_CURRENCIES = ["USD", "CAD", "GBP", "EUR", "AUD", "NZD", "SGD", "HKD", "MYR", "JPY", "CHF"];

const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=INR,${ECB_CURRENCIES.filter((code) => code !== "EUR").join(",")}`);
if (!response.ok) throw new Error(`Rate lookup failed: HTTP ${response.status}`);
const { date, rates } = await response.json();

// ECB quotes everything per euro; INR per unit of X = (INR per EUR) / (X per EUR).
const perEur = { ...rates, EUR: 1 };
const inrPer = (code) => perEur.INR / perEur[code];
const round = (value) => Math.round(value * 10_000) / 10_000;

const inrPerUnit = Object.fromEntries([
  ...ECB_CURRENCIES.map((code) => [code, round(inrPer(code))]),
  ...Object.entries(USD_PEGS).map(([code, perUsd]) => [code, round(inrPer("USD") / perUsd)]),
]);

const current = JSON.parse(await readFile(outputPath, "utf8").catch(() => "{}"));

// Refuse to write anything doubtful; a failed run keeps the last good rates. A currency moving by
// more than a fifth in one refresh is far likelier to be a bad feed than a real move.
const MAX_MOVE = 0.2;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) throw new Error(`Rate lookup returned no usable date: ${date}`);
for (const [code, rate] of Object.entries(inrPerUnit)) {
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`No usable rate for ${code}: ${rate}`);
  const previous = current.inrPerUnit?.[code];
  if (previous && Math.abs(rate / previous - 1) > MAX_MOVE) {
    throw new Error(`${code} moved from ₹${previous} to ₹${rate}; check it, then update config/fx-rates.json by hand.`);
  }
}

await writeFile(outputPath, `${JSON.stringify({
  $comment: current.$comment ?? "INR per one unit of each currency, for the approximate local prices on /store. Refresh with: node scripts/update-fx-rates.mjs",
  date,
  inrPerUnit,
}, null, 2)}\n`);

console.log(`Rates of ${date}:`, inrPerUnit);
