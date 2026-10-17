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
export const EYEAGLE_ORDERING_PREVIEW_OPEN = !EYEAGLE_ORDERING_OPEN && import.meta.env?.DEV === true && storeConfig.orderingPreviewOpen === true;

// These are sellable cart lines. Shopify currently expands the base bundle into a Control Unit,
// Alarm Unit and Bathroom Protection item. Each additional-bathroom bundle expands into a Control
// Unit, Alarm Unit and four bathroom-safety parts. Both bundles and extra SOS units must consume
// the same tracked Alarm Unit variant; the base Bathroom Protection item's inner parts still need
// their own inventory reconciliation in Shopify.
export const EYEAGLE_SHOPIFY_CART_ITEMS = Object.freeze({
  base: { handle: "complete-home-safety-response-system", variantId: "50767558181057", priceInr: 39_999 },
  additionalBathroom: { handle: "additional-bathroom", variantId: "50769365663937", priceInr: 19_999 },
  additionalSos: { handle: "eyeagle-alarm-unit-with-sos-button", variantId: "50767489237185", priceInr: 8_999 },
  plan1: { handle: "1-year-plan", variantId: "50768026665153", priceInr: 15_000 },
  plan3: { handle: "3-year-plan", variantId: "50768026239169", priceInr: 40_000 },
} as const);

export type EyEagleCartItem = keyof typeof EYEAGLE_SHOPIFY_CART_ITEMS;
export interface EyEagleCartLine {
  item: EyEagleCartItem;
  variantId: string;
  quantity: number;
  expectedUnitPriceInr: number;
}

export const getMissingEyEagleCartItems = (): EyEagleCartItem[] =>
  (Object.keys(EYEAGLE_SHOPIFY_CART_ITEMS) as EyEagleCartItem[]).filter((item) =>
    !/^\d+$/.test(EYEAGLE_SHOPIFY_CART_ITEMS[item].variantId),
  );

// Legacy 45-variant map retained only for reference while the new cart flow is tested locally.
// The checkout no longer uses these IDs or the old bundle setup script.
export const EYEAGLE_VARIANT_IDS: Readonly<Record<string, string>> = Object.freeze({
  "1:0:0": "50762161488065",
  "1:0:12": "50646822420673",
  "1:0:36": "50694869844161",
  "1:1:0": "50762161520833",
  "1:1:12": "50646822453441",
  "1:1:36": "50694869876929",
  "1:2:0": "50762161553601",
  "1:2:12": "50646822486209",
  "1:2:36": "50694869909697",
  "1:3:0": "50762206511297",
  "1:3:12": "50762206544065",
  "1:3:36": "50762206576833",
  "1:4:0": "50762232430785",
  "1:4:12": "50762232463553",
  "1:4:36": "50762232496321",
  "2:0:0": "50762161586369",
  "2:0:12": "50646822584513",
  "2:0:36": "50694869942465",
  "2:1:0": "50762161619137",
  "2:1:12": "50646822617281",
  "2:1:36": "50694869975233",
  "2:2:0": "50762161651905",
  "2:2:12": "50646822650049",
  "2:2:36": "50694870008001",
  "2:3:0": "50762206609601",
  "2:3:12": "50762206642369",
  "2:3:36": "50762206675137",
  "2:4:0": "50762232529089",
  "2:4:12": "50762232561857",
  "2:4:36": "50762232594625",
  "3:0:0": "50762161684673",
  "3:0:12": "50646822748353",
  "3:0:36": "50694870040769",
  "3:1:0": "50762161717441",
  "3:1:12": "50646822781121",
  "3:1:36": "50694870073537",
  "3:2:0": "50762161750209",
  "3:2:12": "50646822813889",
  "3:2:36": "50694870106305",
  "3:3:0": "50762206707905",
  "3:3:12": "50762206740673",
  "3:3:36": "50762206773441",
  "3:4:0": "50762232627393",
  "3:4:12": "50762232660161",
  "3:4:36": "50762232692929",
});

export const getMissingEyEagleVariantKeys = (): string[] => {
  const missing: string[] = [];
  for (let bathrooms = EYEAGLE_SHOPIFY_CONFIG.bathroomMin; bathrooms <= EYEAGLE_SHOPIFY_CONFIG.bathroomMax; bathrooms++) {
    for (let additionalSos = EYEAGLE_SHOPIFY_CONFIG.additionalSosMin; additionalSos <= EYEAGLE_SHOPIFY_CONFIG.additionalSosMax; additionalSos++) {
      for (const months of Object.keys(EYEAGLE_MEMBERSHIP_PLANS)) {
        const key = `${bathrooms}:${additionalSos}:${months}`;
        if (!EYEAGLE_VARIANT_IDS[key]) missing.push(key);
      }
    }
  }
  return missing;
};

// Parts each configurator variant is bundled from in Shopify (see scripts/shopify-setup-bundles.mjs).
// Parts are never sold on their own, so every order includes the full base system.
export const EYEAGLE_BUNDLE_COMPONENTS = Object.freeze({
  controlUnit: { sku: "EYE-CU", title: "EyEagle Control Unit", stockTracked: true },
  sosUnit: { sku: "EYE-AU", title: "Alert Unit", stockTracked: true },
  protectionKit: { sku: "EYE-KIT", title: "Bathroom protection kit", stockTracked: true },
  supportPlan3: { sku: "EYE-SUP3", title: "3-year support plan", stockTracked: false },
  supportPlan1: { sku: "EYE-SUP1", title: "1-year support plan", stockTracked: false },
} as const);

export type EyEagleBundleComponent = keyof typeof EYEAGLE_BUNDLE_COMPONENTS;

// Base system: 1 CU + 1 AU + 1 kit. Each extra bathroom adds another complete CU + AU + kit set;
// each extra SOS adds only an AU. A paid-ahead membership adds its support plan; monthly adds none.
export const getEyEagleBundleComponents = (
  bathrooms: number,
  additionalSos: number,
  membershipMonths: EyEagleMembershipMonths,
): Record<EyEagleBundleComponent, number> => ({
  controlUnit: bathrooms,
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
  cartLines: EyEagleCartLine[];
  shopifyCartUrl: string;
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

  const totalInr =
    EYEAGLE_SHOPIFY_CONFIG.basePriceInr +
    (bathrooms - 1) * EYEAGLE_SHOPIFY_CONFIG.additionalBathroomPriceInr +
    additionalSos * EYEAGLE_SHOPIFY_CONFIG.additionalSosPriceInr +
    EYEAGLE_MEMBERSHIP_PLANS[months].priceInr;

  const quantities: Partial<Record<EyEagleCartItem, number>> = {
    base: 1,
    additionalBathroom: bathrooms - 1,
    additionalSos,
    plan1: months === 12 ? 1 : 0,
    plan3: months === 36 ? 1 : 0,
  };
  const cartLines = (Object.entries(quantities) as [EyEagleCartItem, number][])
    .filter(([, quantity]) => quantity > 0)
    .map(([item, quantity]) => ({
      item,
      variantId: EYEAGLE_SHOPIFY_CART_ITEMS[item].variantId,
      quantity,
      expectedUnitPriceInr: EYEAGLE_SHOPIFY_CART_ITEMS[item].priceInr,
    }));
  const cartTotalInr = cartLines.reduce((sum, line) => sum + line.quantity * line.expectedUnitPriceInr, 0);
  if (cartTotalInr !== totalInr) throw new Error("EyEagle cart item prices do not match the store configurator.");

  // Shopify displays cart-permalink lines in reverse order. Send the plan first so the
  // EyEagle Safety System appears first in the checkout summary.
  const cartUrl = new URL(`https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/cart/${[...cartLines].reverse().map((line) => `${line.variantId}:${line.quantity}`).join(",")}`);
  cartUrl.searchParams.set("attributes[EyEagle plan]", EYEAGLE_MEMBERSHIP_PLANS[months].title);
  cartUrl.searchParams.set("attributes[EyEagle bathrooms]", String(bathrooms));
  cartUrl.searchParams.set("attributes[EyEagle additional SOS]", String(additionalSos));

  const checkoutUrl = new URLSearchParams({ bathrooms: String(bathrooms), sos: String(additionalSos), membership: String(months) });

  return {
    bathrooms,
    additionalSos,
    membershipMonths: months,
    totalInr,
    cartLines,
    shopifyCartUrl: cartUrl.toString(),
    checkoutUrl: `/api/store-checkout?${checkoutUrl}`,
  };
};
