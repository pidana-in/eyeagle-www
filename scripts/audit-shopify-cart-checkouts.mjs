import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  EYEAGLE_MEMBERSHIP_PLANS,
  EYEAGLE_SHOPIFY_CONFIG,
  getEyEagleConfiguredPurchase,
} from "../src/data/shopify-configurator.ts";

// Read-only purchase audit: creates temporary Shopify carts, but never submits an order.
// Run locally with: node scripts/audit-shopify-cart-checkouts.mjs
const curl = (...args) => execFileSync("curl", [
  "--silent", "--show-error", "--fail", "--max-time", "20", ...args,
], { encoding: "utf8" });

const auditDir = mkdtempSync(join(tmpdir(), "eyeagle-cart-audit-"));
const failures = [];
let checked = 0;

try {
  for (let bathrooms = EYEAGLE_SHOPIFY_CONFIG.bathroomMin; bathrooms <= EYEAGLE_SHOPIFY_CONFIG.bathroomMax; bathrooms++) {
    for (let sos = EYEAGLE_SHOPIFY_CONFIG.additionalSosMin; sos <= EYEAGLE_SHOPIFY_CONFIG.additionalSosMax; sos++) {
      for (const membership of [0, 12, 36]) {
        const key = `${bathrooms} bathrooms / ${sos} extra SOS / ${membership || "monthly"}`;
        try {
          const purchase = getEyEagleConfiguredPurchase(bathrooms, sos, membership);
          assert.ok(purchase);
          const cookieJar = join(auditDir, `cart-${bathrooms}-${sos}-${membership}.txt`);
          const previewUrl = new URL(purchase.shopifyCartUrl);
          previewUrl.searchParams.set("storefront", "true");
          curl("--location", "--cookie", cookieJar, "--cookie-jar", cookieJar, "--output", "/dev/null", previewUrl.toString());
          const cart = JSON.parse(curl("--cookie", cookieJar, `https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/cart.js`));

          const expectedLines = purchase.cartLines.map(({ variantId, quantity }) => ({
            variantId: Number(variantId),
            quantity,
          }));
          const actualLines = cart.items.map(({ variant_id, quantity }) => ({
            variantId: variant_id,
            quantity,
          }));
          assert.deepEqual(actualLines, expectedLines, "product IDs, quantities or checkout order differ");
          assert.equal(cart.item_count, expectedLines.reduce((sum, line) => sum + line.quantity, 0), "item count differs");
          assert.equal(cart.total_price, purchase.totalInr * 100, "subtotal differs");
          assert.equal(cart.attributes["EyEagle plan"], EYEAGLE_MEMBERSHIP_PLANS[membership].title, "plan attribute differs");
          assert.equal(cart.attributes["EyEagle bathrooms"], String(bathrooms), "bathroom attribute differs");
          assert.equal(cart.attributes["EyEagle additional SOS"], String(sos), "extra SOS attribute differs");
          checked++;
          if (checked % 5 === 0) console.log(`Verified ${checked}/45 Shopify carts`);
        } catch (error) {
          failures.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
          console.error(`FAILED ${key}: ${error instanceof Error ? error.message : error}`);
        }
      }
    }
  }
} finally {
  rmSync(auditDir, { recursive: true, force: true });
}

console.log(`Shopify cart audit: ${checked}/45 passed, ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
