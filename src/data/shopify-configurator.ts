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

// Shopify variant per configuration, keyed "bathrooms:extraSos:membershipMonths". The EyEagle Home System
// product (shop.eyeagle.ai/products/eyeagle-home-system) is a Shopify Bundles bundle set up by hand: 1 Home
// Hub, an "Alert Units" quantity option (bathrooms + extra units), a "Bathroom Protection Kits" quantity
// option (one per bathroom) and the membership plan. Each variant's price is the sum of its parts. A
// configuration without an entry is priced on the page but can't be checked out.
export const EYEAGLE_VARIANT_IDS: Readonly<Record<string, string>> = Object.freeze({
  "1:0:36": "50777552093377",
  "1:0:12": "50777552126145",
  "1:0:0": "50777552158913",
  "1:1:36": "50777552388289",
  "1:1:12": "50777552421057",
  "1:1:0": "50777552453825",
  "1:2:36": "50777552683201",
  "1:2:12": "50777552715969",
  "1:2:0": "50777552748737",
  "1:3:36": "50777552978113",
  "1:3:12": "50777553010881",
  "1:3:0": "50777553043649",
  "1:4:36": "50777553273025",
  "1:4:12": "50777553305793",
  "1:4:0": "50777553338561",
  "2:0:36": "50777552486593",
  "2:0:12": "50777552519361",
  "2:0:0": "50777552552129",
  "2:1:36": "50777552781505",
  "2:1:12": "50777552814273",
  "2:1:0": "50777552847041",
  "2:2:36": "50777553076417",
  "2:2:12": "50777553109185",
  "2:2:0": "50777553141953",
  "2:3:36": "50777553371329",
  "2:3:12": "50777553404097",
  "2:3:0": "50777553436865",
  "2:4:36": "50777553666241",
  "2:4:12": "50777553699009",
  "2:4:0": "50777553731777",
  "3:0:36": "50777552879809",
  "3:0:12": "50777552912577",
  "3:0:0": "50777552945345",
  "3:1:36": "50777553174721",
  "3:1:12": "50777553207489",
  "3:1:0": "50777553240257",
  "3:2:36": "50777553469633",
  "3:2:12": "50777553502401",
  "3:2:0": "50777553535169",
  "3:3:36": "50777553764545",
  "3:3:12": "50777553797313",
  "3:3:0": "50777553830081",
  "3:4:36": "50777554059457",
  "3:4:12": "50777554092225",
  "3:4:0": "50777554124993",
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

// Shopify discount codes passed in from links like /store?code=DIWALI (event QR codes). Codes are
// case-insensitive in Shopify; only letters, digits, "-" and "_" are carried through.
export const normalizeDiscountCode = (raw: string | null | undefined): string | null => {
  const code = raw?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9_-]{1,50}$/.test(code) ? code : null;
};

// Cart permalinks apply a code at checkout with ?discount=. Shopify ignores a code that isn't valid.
export const withDiscountCode = (checkoutUrl: string, code: string | null) =>
  code ? `${checkoutUrl}?discount=${encodeURIComponent(code)}` : checkoutUrl;

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

// Device only: the Home Hub with Alarm and one Alert Unit, installed, with one year of membership paid ahead, and
// no bathroom protection kit. In Shopify it's its own Shopify Bundles product
// (shop.eyeagle.ai/products/eyeagle-device-with-1-yr-subscription: Home Hub + Alert Unit + the membership's
// "1 year paid ahead" variant), priced as the sum of its parts. /store offers it only while a variant ID is set.
export const EYEAGLE_DEVICE_ONLY = Object.freeze({
  title: "Device only",
  // Home Hub with Alarm (₹20,000) and Alert Unit (₹8,999), installed.
  devicePriceInr: 28_999,
  membershipMonths: 12 as const,
  variantId: "50815924895937" as string | null,
});

export const getEyEagleDevicePurchase = () => {
  const { devicePriceInr, membershipMonths, variantId } = EYEAGLE_DEVICE_ONLY;
  return {
    membershipMonths,
    totalInr: devicePriceInr + EYEAGLE_MEMBERSHIP_PLANS[membershipMonths].priceInr,
    variantId,
    quantity: 1 as const,
    checkoutUrl: variantId ? `https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/cart/${variantId}:1` : null,
  };
};
