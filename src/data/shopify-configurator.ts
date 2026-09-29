export const EYEAGLE_SHOPIFY_CONFIG = Object.freeze({
  storeDomain: "shop.eyeagle.ai",
  // Prices exclude GST; Shopify adds GST at checkout.
  basePriceInr: 79_999,
  additionalBathroomPriceInr: 19_999,
  additionalSosPriceInr: 8_999,
  bathroomMin: 1,
  bathroomMax: 3,
  additionalSosMin: 0,
  additionalSosMax: 4,
  // Estimate shown before checkout. Keep in sync with the Shopify tax setup.
  gstRate: 0.18,
});

export const EYEAGLE_VARIANT_IDS = Object.freeze({
  "1:0": "50646822420673",
  "1:1": "50646822453441",
  "1:2": "50646822486209",
  "1:3": "50646822518977",
  "1:4": "50646822551745",
  "2:0": "50646822584513",
  "2:1": "50646822617281",
  "2:2": "50646822650049",
  "2:3": "50646822682817",
  "2:4": "50646822715585",
  "3:0": "50646822748353",
  "3:1": "50646822781121",
  "3:2": "50646822813889",
  "3:3": "50646822846657",
  "3:4": "50646822879425",
} as const);

export type EyEagleVariantKey = keyof typeof EYEAGLE_VARIANT_IDS;

export interface EyEagleConfiguredPurchase {
  bathrooms: number;
  additionalSos: number;
  totalInr: number;
  variantId: string;
  quantity: 1;
  checkoutUrl: string;
}

export const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);

export const estimateGstInr = (amountInr: number) => Math.round(amountInr * EYEAGLE_SHOPIFY_CONFIG.gstRate);

export const isValidEyEagleConfiguration = (bathrooms: number, additionalSos: number) =>
  Number.isInteger(bathrooms) &&
  Number.isInteger(additionalSos) &&
  bathrooms >= EYEAGLE_SHOPIFY_CONFIG.bathroomMin &&
  bathrooms <= EYEAGLE_SHOPIFY_CONFIG.bathroomMax &&
  additionalSos >= EYEAGLE_SHOPIFY_CONFIG.additionalSosMin &&
  additionalSos <= EYEAGLE_SHOPIFY_CONFIG.additionalSosMax;

export const getEyEagleConfiguredPurchase = (
  bathrooms: number,
  additionalSos: number,
): EyEagleConfiguredPurchase | null => {
  if (!isValidEyEagleConfiguration(bathrooms, additionalSos)) return null;

  const key = `${bathrooms}:${additionalSos}` as EyEagleVariantKey;
  const variantId = EYEAGLE_VARIANT_IDS[key];
  if (!variantId) return null;

  const totalInr =
    EYEAGLE_SHOPIFY_CONFIG.basePriceInr +
    (bathrooms - 1) * EYEAGLE_SHOPIFY_CONFIG.additionalBathroomPriceInr +
    additionalSos * EYEAGLE_SHOPIFY_CONFIG.additionalSosPriceInr;

  return {
    bathrooms,
    additionalSos,
    totalInr,
    variantId,
    quantity: 1,
    checkoutUrl: `https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/cart/${variantId}:1`,
  };
};
