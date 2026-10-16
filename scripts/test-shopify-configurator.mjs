import assert from "node:assert/strict";
import {
  EYEAGLE_MEMBERSHIP_PLANS,
  EYEAGLE_VARIANT_IDS,
  getEyEagleBundleComponents,
  getEyEagleConfiguredPurchase,
} from "../src/data/shopify-configurator.ts";

// Three years of membership, paid ahead: the configurations that have Shopify variants today.
const cases = [
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

assert.ok(Object.keys(EYEAGLE_VARIANT_IDS).length >= 15);

for (const [bathrooms, additionalSos, variantId, totalInr] of cases) {
  const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, 36);
  assert.ok(purchase, `Missing purchase for ${bathrooms}:${additionalSos}:36`);
  assert.equal(purchase.membershipMonths, 36);
  assert.equal(purchase.variantId, variantId);
  assert.equal(purchase.totalInr, totalInr);
  assert.equal(purchase.quantity, 1);
  assert.equal(
    purchase.checkoutUrl,
    `https://shop.eyeagle.ai/cart/${variantId}:1`,
  );
}

// Three years stays the default.
assert.equal(getEyEagleConfiguredPurchase(1, 0)?.totalInr, 79_999);

// The three system prices: upfront only, with one year, with three years.
assert.deepEqual(
  [0, 12, 36].map((months) => getEyEagleConfiguredPurchase(1, 0, months)?.totalInr),
  [39_999, 54_999, 79_999],
);
assert.equal(getEyEagleConfiguredPurchase(3, 4, 12)?.totalInr, 130_993);
assert.equal(getEyEagleConfiguredPurchase(2, 1, 0)?.totalInr, 68_997);

// Every configuration is priced; one without a Shopify variant yet has no checkout link.
for (const bathrooms of [1, 2, 3]) {
  for (const additionalSos of [0, 1, 2, 3, 4]) {
    for (const months of Object.keys(EYEAGLE_MEMBERSHIP_PLANS).map(Number)) {
      const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, months);
      assert.ok(purchase, `Missing purchase for ${bathrooms}:${additionalSos}:${months}`);
      const variantId = EYEAGLE_VARIANT_IDS[`${bathrooms}:${additionalSos}:${months}`] ?? null;
      assert.equal(purchase.variantId, variantId);
      assert.equal(purchase.checkoutUrl, variantId && `https://shop.eyeagle.ai/cart/${variantId}:1`);
    }
  }
}

assert.deepEqual(getEyEagleBundleComponents(1, 0, 36), { controlUnit: 1, sosUnit: 1, protectionKit: 1, supportPlan3: 1, supportPlan1: 0 });
assert.deepEqual(getEyEagleBundleComponents(3, 4, 12), { controlUnit: 1, sosUnit: 7, protectionKit: 3, supportPlan3: 0, supportPlan1: 1 });
assert.deepEqual(getEyEagleBundleComponents(2, 1, 0), { controlUnit: 1, sosUnit: 3, protectionKit: 2, supportPlan3: 0, supportPlan1: 0 });

for (const invalid of [[0, 0, 36], [4, 0, 36], [1, -1, 36], [1, 5, 36], [1.5, 0, 36], [1, 0.5, 36], [1, 0, 24], [1, 0, Number.NaN]]) {
  assert.equal(getEyEagleConfiguredPurchase(...invalid), null);
}

console.log(`Validated ${cases.length} EyEagle Shopify configurations.`);
