import assert from "node:assert/strict";
import {
  EYEAGLE_VARIANT_IDS,
  getEyEagleConfiguredPurchase,
} from "../src/data/shopify-configurator.ts";

const cases = [
  [1, 0, "50646822420673", 89_999],
  [1, 1, "50646822453441", 98_998],
  [1, 2, "50646822486209", 107_997],
  [1, 3, "50646822518977", 116_996],
  [1, 4, "50646822551745", 125_995],
  [2, 0, "50646822584513", 109_998],
  [2, 1, "50646822617281", 118_997],
  [2, 2, "50646822650049", 127_996],
  [2, 3, "50646822682817", 136_995],
  [2, 4, "50646822715585", 145_994],
  [3, 0, "50646822748353", 129_997],
  [3, 1, "50646822781121", 138_996],
  [3, 2, "50646822813889", 147_995],
  [3, 3, "50646822846657", 156_994],
  [3, 4, "50646822879425", 165_993],
];

assert.equal(Object.keys(EYEAGLE_VARIANT_IDS).length, 15);

for (const [bathrooms, additionalSos, variantId, totalInr] of cases) {
  const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos);
  assert.ok(purchase, `Missing purchase for ${bathrooms}:${additionalSos}`);
  assert.equal(purchase.variantId, variantId);
  assert.equal(purchase.totalInr, totalInr);
  assert.equal(purchase.quantity, 1);
  assert.equal(
    purchase.checkoutUrl,
    `https://shop.eyeagle.ai/cart/${variantId}:1`,
  );
}

for (const invalid of [[0, 0], [4, 0], [1, -1], [1, 5], [1.5, 0], [1, 0.5]]) {
  assert.equal(getEyEagleConfiguredPurchase(...invalid), null);
}

console.log(`Validated ${cases.length} EyEagle Shopify configurations.`);
