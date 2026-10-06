import storeConfig from "../../config/store.json" with { type: "json" };

export const EYEAGLE_SHOPIFY_CONFIG = Object.freeze({
  storeDomain: "shop.eyeagle.ai",
  // Prices exclude GST; Shopify adds GST at checkout.
  basePriceInr: 79_999,
  additionalBathroomPriceInr: 19_999,
  additionalSosPriceInr: 8_999,
  bathroomMin: 1,
  bathroomMax: 3,
  additionalSosMin: 0,
  additionalSosMax: 2,
  // Estimate shown before checkout. Keep in sync with the Shopify tax setup.
  gstRate: 0.18,
});

export const EYEAGLE_BASE_PLANS = Object.freeze({
  oneYear: { priceInr: 49_999, membershipYears: 1 },
  threeYears: { priceInr: EYEAGLE_SHOPIFY_CONFIG.basePriceInr, membershipYears: 3 },
} as const);

export type EyEagleBasePlan = keyof typeof EYEAGLE_BASE_PLANS;

// Master switch for online ordering, set in config/store.json. While false, /store is a browsable
// preview with an availability signup (/api/store-waitlist) in place of checkout, and no Shopify
// links are rendered. Only an explicit `true` opens ordering.
export const EYEAGLE_ORDERING_OPEN = storeConfig.orderingOpen === true;

// Existing three-year variant mapping. Kept for the legacy bundle setup script;
// these IDs have not been verified against the new two-plan Shopify setup.
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

// Parts each configurator variant is bundled from in Shopify (see scripts/shopify-setup-bundles.mjs).
// Parts are never sold on their own, so every order includes the full base system.
export const EYEAGLE_BUNDLE_COMPONENTS = Object.freeze({
  controlUnit: { sku: "EYE-CU", title: "Home Hub with Alarm", stockTracked: true },
  sosUnit: { sku: "EYE-AU", title: "Alert Unit", stockTracked: true },
  protectionKit: { sku: "EYE-KIT", title: "Bathroom protection kit", stockTracked: true },
  supportPlan: { sku: "EYE-SUP3", title: "3-year support plan", stockTracked: false },
} as const);

export type EyEagleBundleComponent = keyof typeof EYEAGLE_BUNDLE_COMPONENTS;

// Base system: 1 CU + 1 AU + 1 kit + support. Each extra bathroom adds an AU and a kit; each extra SOS adds an AU.
export const getEyEagleBundleComponents = (
  bathrooms: number,
  additionalSos: number,
): Record<EyEagleBundleComponent, number> => ({
  controlUnit: 1,
  sosUnit: bathrooms + additionalSos,
  protectionKit: bathrooms,
  supportPlan: 1,
});

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
  // Preserve the old 15-variant bundle setup without exposing its 3- and 4-unit
  // choices in the new store configurator.
  if (
    !Number.isInteger(bathrooms) ||
    !Number.isInteger(additionalSos) ||
    bathrooms < EYEAGLE_SHOPIFY_CONFIG.bathroomMin ||
    bathrooms > EYEAGLE_SHOPIFY_CONFIG.bathroomMax ||
    additionalSos < 0 ||
    additionalSos > 4
  ) return null;

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

// The two-plan setup needs 18 verified variant IDs. The IDs above predate that setup;
// don't route a new selection to one of those legacy checkout URLs.
export const getEyEagleStoreSelection = (
  plan: EyEagleBasePlan,
  bathrooms: number,
  additionalSos: number,
) => {
  if (!isValidEyEagleConfiguration(bathrooms, additionalSos)) return null;

  const base = EYEAGLE_BASE_PLANS[plan];
  if (!base) return null;

  const totalInr =
    base.priceInr +
    (bathrooms - EYEAGLE_SHOPIFY_CONFIG.bathroomMin) * EYEAGLE_SHOPIFY_CONFIG.additionalBathroomPriceInr +
    additionalSos * EYEAGLE_SHOPIFY_CONFIG.additionalSosPriceInr;

  return {
    plan,
    membershipYears: base.membershipYears,
    basePriceInr: base.priceInr,
    totalInr,
    checkoutUrl: null,
  };
};
