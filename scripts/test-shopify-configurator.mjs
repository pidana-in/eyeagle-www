import assert from "node:assert/strict";
import {
  EYEAGLE_MEMBERSHIP_PLANS,
  EYEAGLE_SHOPIFY_CART_ITEMS,
  getEyEagleConfiguredPurchase,
  getMissingEyEagleCartItems,
} from "../src/data/shopify-configurator.ts";
import { checkEyEagleShopifyCheckout } from "../src/server/store-checkout.ts";

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

assert.deepEqual(getMissingEyEagleCartItems(), []);

for (const [bathrooms, extraSos, threeYears, oneYear, monthly] of prices) {
  for (const [months, expectedPrice] of [[36, threeYears], [12, oneYear], [0, monthly]]) {
    const purchase = getEyEagleConfiguredPurchase(bathrooms, extraSos, months);
    assert.ok(purchase, `Missing purchase for ${bathrooms}:${extraSos}:${months}`);
    assert.equal(purchase.totalInr, expectedPrice);
    assert.deepEqual(
      Object.fromEntries(purchase.cartLines.map(({ item, quantity }) => [item, quantity])),
      {
        base: 1,
        ...(bathrooms > 1 ? { additionalBathroom: bathrooms - 1 } : {}),
        ...(extraSos > 0 ? { additionalSos: extraSos } : {}),
        ...(months === 12 ? { plan1: 1 } : {}),
        ...(months === 36 ? { plan3: 1 } : {}),
      },
    );
    const cartUrl = new URL(purchase.shopifyCartUrl);
    assert.equal(cartUrl.host, "shop.eyeagle.ai");
    assert.equal(cartUrl.pathname, `/cart/${[...purchase.cartLines].reverse().map(({ variantId, quantity }) => `${variantId}:${quantity}`).join(",")}`);
    assert.equal(cartUrl.searchParams.get("attributes[EyEagle plan]"), EYEAGLE_MEMBERSHIP_PLANS[months].title);
    assert.equal(cartUrl.searchParams.get("attributes[EyEagle bathrooms]"), String(bathrooms));
    assert.equal(cartUrl.searchParams.get("attributes[EyEagle additional SOS]"), String(extraSos));
    assert.equal(purchase.checkoutUrl, `/api/store-checkout?bathrooms=${bathrooms}&sos=${extraSos}&membership=${months}`);
  }
}

assert.equal(getEyEagleConfiguredPurchase(1, 0)?.totalInr, 79_999);
assert.equal(getEyEagleConfiguredPurchase(2, 3, 12)?.totalInr, 101_995);
assert.deepEqual(
  getEyEagleConfiguredPurchase(2, 3, 12)?.cartLines.map(({ item, quantity }) => [item, quantity]),
  [["base", 1], ["additionalBathroom", 1], ["additionalSos", 3], ["plan1", 1]],
);

for (const invalid of [[0, 0, 36], [4, 0, 36], [1, -1, 36], [1, 5, 36], [1.5, 0, 36], [1, 0.5, 36], [1, 0, 24], [1, 0, Number.NaN]]) {
  assert.equal(getEyEagleConfiguredPurchase(...invalid), null);
}

const chosen = getEyEagleConfiguredPurchase(2, 2, 12);
assert.ok(chosen);
const productResponse = (handle, overridePrice = null, available = true) => {
  const item = Object.values(EYEAGLE_SHOPIFY_CART_ITEMS).find((entry) => entry.handle === handle);
  assert.ok(item);
  return new Response(JSON.stringify({
    handle,
    title: handle === EYEAGLE_SHOPIFY_CART_ITEMS.base.handle ? "EyEagle Safety System" : handle,
    variants: [{ id: Number(item.variantId), price: (overridePrice ?? item.priceInr) * 100, available }],
  }), { status: 200 });
};
const healthyFetch = async (url) => productResponse(new URL(url).pathname.split("/").at(-1).replace(/\.js$/, ""));
assert.deepEqual(await checkEyEagleShopifyCheckout(chosen, healthyFetch), { ok: true });
const badSosFetch = async (url) => {
  const handle = new URL(url).pathname.split("/").at(-1).replace(/\.js$/, "");
  return productResponse(handle, handle === EYEAGLE_SHOPIFY_CART_ITEMS.additionalSos.handle ? 0 : null);
};
const badSos = await checkEyEagleShopifyCheckout(chosen, badSosFetch);
assert.equal(badSos.ok, false);
assert.match(badSos.message, /Additional Alert Unit.*₹0.*₹8,999/);
const unavailableBaseFetch = async (url) => {
  const handle = new URL(url).pathname.split("/").at(-1).replace(/\.js$/, "");
  return productResponse(handle, null, handle !== EYEAGLE_SHOPIFY_CART_ITEMS.base.handle);
};
const unavailableBase = await checkEyEagleShopifyCheckout(chosen, unavailableBaseFetch);
assert.equal(unavailableBase.ok, false);
assert.match(unavailableBase.message, /EyEagle Safety System is currently unavailable/);

if (process.argv.includes("--live")) {
  const liveCheck = await checkEyEagleShopifyCheckout(chosen);
  console.log(`Live Shopify checkout check: ${liveCheck.ok ? "ready" : liveCheck.message}`);
  if (!liveCheck.ok) process.exitCode = 1;
}

console.log(`Validated all ${prices.length * 3} EyEagle prices and multi-item carts.`);
