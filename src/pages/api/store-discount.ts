import type { APIRoute } from "astro";
import { EYEAGLE_SHOPIFY_CONFIG, EYEAGLE_VARIANT_IDS, normalizeDiscountCode } from "../../data/shopify-configurator";

export const prerender = false;

const variantIds = new Set(Object.values(EYEAGLE_VARIANT_IDS));
const storeUrl = `https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}`;

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
  });

type ShopifyDiscountApplication = { value?: string; value_type?: string };
type ShopifyCart = {
  total_discount?: number;
  discount_codes?: { code: string; applicable: boolean }[];
  cart_level_discount_applications?: ShopifyDiscountApplication[];
  items?: { line_level_discount_allocations?: { discount_application?: ShopifyDiscountApplication }[] }[];
};

const postToCart = (path: string, body: unknown, cookie?: string) =>
  fetch(`${storeUrl}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6_000),
  });

// Prices a discount code for one configuration exactly as Shopify checkout will, with no API token: add the
// variant to a throwaway storefront cart, apply the code, and read back the discount. Codes are never listed;
// a code is only confirmed for someone who already has it.
export const GET: APIRoute = async ({ url }) => {
  const code = normalizeDiscountCode(url.searchParams.get("code"));
  const variantId = url.searchParams.get("variant") ?? "";
  if (!code || !variantIds.has(variantId)) {
    return jsonResponse({ ok: false, message: "Enter a valid discount code." }, 400);
  }

  try {
    const added = await postToCart("/cart/add.js", { items: [{ id: Number(variantId), quantity: 1 }] });
    if (!added.ok) throw new Error(`cart/add.js returned ${added.status}`);
    const cookie = added.headers.getSetCookie().map((header) => header.split(";")[0]).join("; ");

    const updated = await postToCart("/cart/update.js", { discount: code }, cookie);
    if (!updated.ok) throw new Error(`cart/update.js returned ${updated.status}`);
    const cart = (await updated.json()) as ShopifyCart;

    const applicable = cart.discount_codes?.some((entry) => entry.code.toUpperCase() === code && entry.applicable) ?? false;
    const application =
      cart.items?.[0]?.line_level_discount_allocations?.[0]?.discount_application ??
      cart.cart_level_discount_applications?.[0];
    return jsonResponse({
      ok: true,
      code,
      variantId,
      applicable,
      discountInr: applicable ? (cart.total_discount ?? 0) / 100 : 0,
      // "percentage" (value 40 = 40% off) or "fixed_amount" (value in INR).
      valueType: applicable ? application?.value_type ?? null : null,
      value: applicable && application?.value ? Number(application.value) : null,
    }, 200);
  } catch (error) {
    console.error("Discount check failed", error);
    return jsonResponse({ ok: false, message: "We couldn’t check this code right now." }, 502);
  }
};
