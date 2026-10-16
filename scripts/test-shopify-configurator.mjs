import assert from "node:assert/strict";
import {
  EYEAGLE_MEMBERSHIP_PLANS,
  EYEAGLE_SHOPIFY_CONFIG,
  EYEAGLE_VARIANT_IDS,
  getEyEagleBundleComponents,
  getEyEagleConfiguredPurchase,
  getMissingEyEagleVariantKeys,
} from "../src/data/shopify-configurator.ts";

// Independent prices from the agreed 45-combination table, before GST.
const prices = [
  [1, 0, 79_999, 54_999, 39_999],
  [1, 1, 88_998, 63_998, 48_998],
  [1, 2, 97_997, 72_997, 57_997],
  [1, 3, 106_996, 81_996, 66_996],
  [1, 4, 115_995, 90_995, 75_995],
  [2, 0, 99_998, 74_998, 59_998],
  [2, 1, 108_997, 83_997, 68_997],
  [2, 2, 117_996, 92_996, 77_996],
  [2, 3, 126_995, 101_995, 86_995],
  [2, 4, 135_994, 110_994, 95_994],
  [3, 0, 119_997, 94_997, 79_997],
  [3, 1, 128_996, 103_996, 88_996],
  [3, 2, 137_995, 112_995, 97_995],
  [3, 3, 146_994, 121_994, 106_994],
  [3, 4, 155_993, 130_993, 115_993],
];

for (const [bathrooms, additionalSos, threeYears, oneYear, monthly] of prices) {
  for (const [months, expectedPrice] of [[36, threeYears], [12, oneYear], [0, monthly]]) {
    const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, months);
    assert.ok(purchase, `Missing purchase for ${bathrooms}:${additionalSos}:${months}`);
    assert.equal(purchase.totalInr, expectedPrice, `Wrong price for ${bathrooms}:${additionalSos}:${months}`);
    assert.equal(purchase.quantity, 1);
  }
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
      assert.equal(purchase.productUrl, variantId && `https://shop.eyeagle.ai/products/${EYEAGLE_SHOPIFY_CONFIG.productHandle}?variant=${variantId}`);
    }
  }
}

assert.equal(new Set(Object.values(EYEAGLE_VARIANT_IDS)).size, Object.keys(EYEAGLE_VARIANT_IDS).length, "Duplicate Shopify variant IDs");
if (process.argv.includes("--require-all-variants")) {
  assert.deepEqual(getMissingEyEagleVariantKeys(), [], "Checkout must have a variant for every plan and configuration");
}

assert.deepEqual(getEyEagleBundleComponents(1, 0, 36), { controlUnit: 1, sosUnit: 1, protectionKit: 1, supportPlan3: 1, supportPlan1: 0 });
assert.deepEqual(getEyEagleBundleComponents(3, 4, 12), { controlUnit: 1, sosUnit: 7, protectionKit: 3, supportPlan3: 0, supportPlan1: 1 });
assert.deepEqual(getEyEagleBundleComponents(2, 1, 0), { controlUnit: 1, sosUnit: 3, protectionKit: 2, supportPlan3: 0, supportPlan1: 0 });

for (const invalid of [[0, 0, 36], [4, 0, 36], [1, -1, 36], [1, 5, 36], [1.5, 0, 36], [1, 0.5, 36], [1, 0, 24], [1, 0, Number.NaN]]) {
  assert.equal(getEyEagleConfiguredPurchase(...invalid), null);
}

if (process.argv.includes("--live")) {
  const response = await fetch(`https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/products/${EYEAGLE_SHOPIFY_CONFIG.productHandle}.js`);
  assert.equal(response.status, 200, "Shopify product JSON must be accessible");
  const product = await response.json();
  assert.equal(product.handle, EYEAGLE_SHOPIFY_CONFIG.productHandle);
  assert.equal(product.variants.length, prices.length * 3, "Shopify must have exactly 45 variants");
  const seen = new Set();
  for (const variant of product.variants) {
    const bathrooms = Number(variant.option1?.match(/^(\d) Bathrooms?$/)?.[1]);
    const additionalSos = variant.option2 === "None" ? 0 : Number(variant.option2?.match(/^(\d) additional$/)?.[1]);
    const months = { Monthly: 0, "1 Year": 12, "3 Year": 36 }[variant.option3];
    const key = `${bathrooms}:${additionalSos}:${months}`;
    assert.ok(!seen.has(key), `Duplicate Shopify option combination ${key}`);
    seen.add(key);
    const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, months);
    assert.ok(purchase, `Unexpected Shopify option combination ${variant.title}`);
    assert.equal(purchase.variantId, String(variant.id), `Wrong Shopify variant for ${variant.title}`);
    assert.equal(purchase.totalInr * 100, variant.price, `Wrong Shopify price for ${variant.title}`);
  }
  console.log(`Matched all ${seen.size} Shopify variant IDs, options and prices against the live product.`);
}

console.log(`Validated all ${prices.length * 3} EyEagle prices. ${getMissingEyEagleVariantKeys().length} Shopify variant IDs remain unconfigured.`);
