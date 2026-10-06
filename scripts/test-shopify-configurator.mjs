import assert from "node:assert/strict";
import {
  EYEAGLE_BASE_PLANS,
  EYEAGLE_VARIANT_IDS,
  getEyEagleBundleComponents,
  getEyEagleConfiguredPurchase,
  getEyEagleStoreSelection,
} from "../src/data/shopify-configurator.ts";

const legacyCases = [
  [1, 0, "50646822420673", 79_999],
  [1, 1, "50646822453441", 88_998],
  [1, 2, "50646822486209", 97_997],
  [1, 3, "50646822518977", 106_996],
  [1, 4, "50646822551745", 115_995],
  [2, 0, "50646822584513", 99_998],
  [2, 1, "50646822617281", 108_997],
  [2, 2, "50646822650049", 117_996],
  [2, 3, "50646822682817", 126_995],
  [2, 4, "50646822715585", 135_994],
  [3, 0, "50646822748353", 119_997],
  [3, 1, "50646822781121", 128_996],
  [3, 2, "50646822813889", 137_995],
  [3, 3, "50646822846657", 146_994],
  [3, 4, "50646822879425", 155_993],
];

assert.equal(Object.keys(EYEAGLE_VARIANT_IDS).length, 15);

for (const [bathrooms, additionalSos, variantId, totalInr] of legacyCases) {
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

assert.deepEqual(getEyEagleBundleComponents(1, 0), { controlUnit: 1, sosUnit: 1, protectionKit: 1, supportPlan: 1 });
assert.deepEqual(getEyEagleBundleComponents(3, 4), { controlUnit: 1, sosUnit: 7, protectionKit: 3, supportPlan: 1 });

assert.equal(EYEAGLE_BASE_PLANS.oneYear.priceInr, 49_999);
const shopifyPrices = [
  [1, 0, 49_999, 79_999], [1, 1, 58_998, 88_998], [1, 2, 67_997, 97_997],
  [2, 0, 69_998, 99_998], [2, 1, 78_997, 108_997], [2, 2, 87_996, 117_996],
  [3, 0, 89_997, 119_997], [3, 1, 98_996, 128_996], [3, 2, 107_995, 137_995],
];
for (const [bathrooms, additionalSos, oneYearPrice, threeYearPrice] of shopifyPrices) {
  assert.equal(getEyEagleStoreSelection("oneYear", bathrooms, additionalSos)?.totalInr, oneYearPrice);
  assert.equal(getEyEagleStoreSelection("threeYears", bathrooms, additionalSos)?.totalInr, threeYearPrice);
  assert.equal(getEyEagleStoreSelection("oneYear", bathrooms, additionalSos)?.checkoutUrl, null);
  assert.equal(getEyEagleStoreSelection("threeYears", bathrooms, additionalSos)?.checkoutUrl, null);
}

for (const invalid of [[0, 0], [4, 0], [1, -1], [1, 5], [1.5, 0], [1, 0.5]]) {
  assert.equal(getEyEagleConfiguredPurchase(...invalid), null);
  assert.equal(getEyEagleStoreSelection("oneYear", ...invalid), null);
}
assert.equal(getEyEagleStoreSelection("oneYear", 1, 3), null);
assert.equal(getEyEagleStoreSelection("threeYears", 1, 4), null);

console.log(`Validated ${shopifyPrices.length * 2} EyEagle Shopify plan prices.`);
