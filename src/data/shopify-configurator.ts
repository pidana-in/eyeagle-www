import storeConfig from "../../config/store.json" with { type: "json" };

export const EYEAGLE_SHOPIFY_CONFIG = Object.freeze({
  storeDomain: "shop.eyeagle.ai",
  // Prices exclude GST; Shopify adds GST at checkout.
  // The system for one bathroom, installed, with no membership paid ahead.
  basePriceInr: 39_999,
  additionalBathroomPriceInr: 19_999,
  additionalSosPriceInr: 8_999,
  bathroomMin: 1,
  bathroomMax: 3,
  additionalSosMin: 0,
  additionalSosMax: 4,
  // Estimate shown before checkout. Keep in sync with the Shopify tax setup.
  gstRate: 0.18,
  // Membership (Nest, readiness checks and EyEagle Response) once any paid-ahead period ends, or
  // from installation when none was bought. Billed outside this checkout.
  membershipMonthlyInr: 2_000,
});

// Membership can be paid ahead at checkout for a discount on the monthly rate. Keyed by months.
export const EYEAGLE_MEMBERSHIP_PLANS = Object.freeze({
  36: { title: "3 years, paid ahead", priceInr: 40_000 },
  12: { title: "1 year, paid ahead", priceInr: 15_000 },
  0: { title: "Pay monthly", priceInr: 0 },
} as const);

export type EyEagleMembershipMonths = keyof typeof EYEAGLE_MEMBERSHIP_PLANS;
export const EYEAGLE_DEFAULT_MEMBERSHIP_MONTHS: EyEagleMembershipMonths = 36;

export const isEyEagleMembershipMonths = (months: number): months is EyEagleMembershipMonths =>
  Object.hasOwn(EYEAGLE_MEMBERSHIP_PLANS, months);

// Master switch for online ordering, set in config/store.json. While false, /store is a browsable
// preview with an availability signup (/api/store-waitlist) in place of checkout, and no Shopify
// links are rendered. Only an explicit `true` opens ordering.
export const EYEAGLE_ORDERING_OPEN = storeConfig.orderingOpen === true;

// Shopify variant per configuration, keyed "bathrooms:extraSos:membershipMonths". A configuration
// without an entry is priced on the page but can't be checked out until its variant exists; the
// setup script (scripts/shopify-setup-bundles.mjs) lists the IDs to add here.
export const EYEAGLE_VARIANT_IDS: Readonly<Record<string, string>> = Object.freeze({
  "1:0:36": "50646822420673",
  "1:1:36": "50646822453441",
  "1:2:36": "50646822486209",
  "1:3:36": "50646822518977",
  "1:4:36": "50646822551745",
  "2:0:36": "50646822584513",
  "2:1:36": "50646822617281",
  "2:2:36": "50646822650049",
  "2:3:36": "50646822682817",
  "2:4:36": "50646822715585",
  "3:0:36": "50646822748353",
  "3:1:36": "50646822781121",
  "3:2:36": "50646822813889",
  "3:3:36": "50646822846657",
  "3:4:36": "50646822879425",
});

// Parts each configurator variant is bundled from in Shopify (see scripts/shopify-setup-bundles.mjs).
// Parts are never sold on their own, so every order includes the full base system.
export const EYEAGLE_BUNDLE_COMPONENTS = Object.freeze({
  controlUnit: { sku: "EYE-CU", title: "Home Hub with Alarm", stockTracked: true },
  sosUnit: { sku: "EYE-AU", title: "Alert Unit", stockTracked: true },
  protectionKit: { sku: "EYE-KIT", title: "Bathroom protection kit", stockTracked: true },
  supportPlan3: { sku: "EYE-SUP3", title: "3-year support plan", stockTracked: false },
  supportPlan1: { sku: "EYE-SUP1", title: "1-year support plan", stockTracked: false },
} as const);

export type EyEagleBundleComponent = keyof typeof EYEAGLE_BUNDLE_COMPONENTS;

// Base system: 1 CU + 1 AU + 1 kit. Each extra bathroom adds an AU and a kit; each extra SOS adds an
// AU. A paid-ahead membership adds its support plan; paying monthly adds none.
export const getEyEagleBundleComponents = (
  bathrooms: number,
  additionalSos: number,
  membershipMonths: EyEagleMembershipMonths,
): Record<EyEagleBundleComponent, number> => ({
  controlUnit: 1,
  sosUnit: bathrooms + additionalSos,
  protectionKit: bathrooms,
  supportPlan3: membershipMonths === 36 ? 1 : 0,
  supportPlan1: membershipMonths === 12 ? 1 : 0,
});

export interface EyEagleConfiguredPurchase {
  bathrooms: number;
  additionalSos: number;
  membershipMonths: EyEagleMembershipMonths;
  totalInr: number;
  // Null until the configuration's Shopify variant exists (see EYEAGLE_VARIANT_IDS).
  variantId: string | null;
  quantity: 1;
  checkoutUrl: string | null;
}

export const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);

export const estimateGstInr = (amountInr: number) => Math.round(amountInr * EYEAGLE_SHOPIFY_CONFIG.gstRate);

export const isValidEyEagleConfiguration = (bathrooms: number, additionalSos: number, membershipMonths: number) =>
  isEyEagleMembershipMonths(membershipMonths) &&
  Number.isInteger(bathrooms) &&
  Number.isInteger(additionalSos) &&
  bathrooms >= EYEAGLE_SHOPIFY_CONFIG.bathroomMin &&
  bathrooms <= EYEAGLE_SHOPIFY_CONFIG.bathroomMax &&
  additionalSos >= EYEAGLE_SHOPIFY_CONFIG.additionalSosMin &&
  additionalSos <= EYEAGLE_SHOPIFY_CONFIG.additionalSosMax;

export const getEyEagleConfiguredPurchase = (
  bathrooms: number,
  additionalSos: number,
  membershipMonths: number = EYEAGLE_DEFAULT_MEMBERSHIP_MONTHS,
): EyEagleConfiguredPurchase | null => {
  if (!isValidEyEagleConfiguration(bathrooms, additionalSos, membershipMonths)) return null;
  const months = membershipMonths as EyEagleMembershipMonths;

  const variantId = EYEAGLE_VARIANT_IDS[`${bathrooms}:${additionalSos}:${months}`] ?? null;

  const totalInr =
    EYEAGLE_SHOPIFY_CONFIG.basePriceInr +
    (bathrooms - 1) * EYEAGLE_SHOPIFY_CONFIG.additionalBathroomPriceInr +
    additionalSos * EYEAGLE_SHOPIFY_CONFIG.additionalSosPriceInr +
    EYEAGLE_MEMBERSHIP_PLANS[months].priceInr;

  return {
    bathrooms,
    additionalSos,
    membershipMonths: months,
    totalInr,
    variantId,
    quantity: 1,
    checkoutUrl: variantId ? `https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/cart/${variantId}:1` : null,
  };
};
