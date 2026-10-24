import assert from "node:assert/strict";
import {
  EYEAGLE_MEMBERSHIP_PLANS,
  EYEAGLE_VARIANT_IDS,
  getEyEagleConfiguredPurchase,
  getEyEagleDevicePurchase,
  normalizeDiscountCode,
  withDiscountCode,
} from "../src/data/shopify-configurator.ts";

// Spot checks against shop.eyeagle.ai/products/eyeagle-home-system: bathrooms, extra Alert Units, months,
// variant, price before GST.
const cases = [
  [1, 0, 36, "50777552093377", 79_999],
  [1, 0, 12, "50777552126145", 54_999],
  [1, 0, 0, "50777552158913", 39_999],
  [1, 1, 36, "50777552388289", 88_998],
  [2, 0, 36, "50777552486593", 99_998],
  [2, 1, 0, "50777552847041", 68_997],
  [3, 4, 36, "50777554059457", 155_993],
  [3, 4, 12, "50777554092225", 130_993],
  [3, 4, 0, "50777554124993", 115_993],
];

// Every configuration the page offers can be checked out.
assert.equal(Object.keys(EYEAGLE_VARIANT_IDS).length, 45);

for (const [bathrooms, additionalSos, months, variantId, totalInr] of cases) {
  const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, months);
  assert.ok(purchase, `Missing purchase for ${bathrooms}:${additionalSos}:${months}`);
  assert.equal(purchase.membershipMonths, months);
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

// Every configuration is priced and links to its Shopify variant.
for (const bathrooms of [1, 2, 3]) {
  for (const additionalSos of [0, 1, 2, 3, 4]) {
    for (const months of Object.keys(EYEAGLE_MEMBERSHIP_PLANS).map(Number)) {
      const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, months);
      assert.ok(purchase, `Missing purchase for ${bathrooms}:${additionalSos}:${months}`);
      const variantId = EYEAGLE_VARIANT_IDS[`${bathrooms}:${additionalSos}:${months}`];
      assert.ok(variantId, `Missing variant for ${bathrooms}:${additionalSos}:${months}`);
      assert.equal(purchase.variantId, variantId);
      assert.equal(purchase.checkoutUrl, variantId && `https://shop.eyeagle.ai/cart/${variantId}:1`);
    }
  }
}


for (const invalid of [[0, 0, 36], [4, 0, 36], [1, -1, 36], [1, 5, 36], [1.5, 0, 36], [1, 0.5, 36], [1, 0, 24], [1, 0, Number.NaN]]) {
  assert.equal(getEyEagleConfiguredPurchase(...invalid), null);
}

// Device only: Home Hub + Alert Unit, installed, with one year of membership.
assert.equal(getEyEagleDevicePurchase().totalInr, 43_999);
assert.equal(getEyEagleDevicePurchase().membershipMonths, 12);

// Event discount codes from /store?code=… are carried to checkout.
assert.equal(normalizeDiscountCode(" diwali-2026 "), "DIWALI-2026");
for (const invalid of [null, undefined, "", "   ", "SAVE 10", "A,B", "10%OFF", "X".repeat(51)]) {
  assert.equal(normalizeDiscountCode(invalid), null);
}
assert.equal(withDiscountCode("https://shop.eyeagle.ai/cart/1:1", "DIWALI"), "https://shop.eyeagle.ai/cart/1:1?discount=DIWALI");
assert.equal(withDiscountCode("https://shop.eyeagle.ai/cart/1:1", null), "https://shop.eyeagle.ai/cart/1:1");

console.log(`Validated ${cases.length} EyEagle Shopify configurations.`);
