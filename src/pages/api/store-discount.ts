import type { APIRoute } from "astro";
import { EYEAGLE_SHOPIFY_CONFIG, EYEAGLE_VARIANT_IDS, normalizeDiscountCode } from "../../data/shopify-configurator";

export const prerender = false;

const storeUrl = `https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}`;
// The base system: 1 bathroom, 3 years paid ahead. Store codes should apply to every EyEagle Home System variant.
const referenceVariantId = Number(EYEAGLE_VARIANT_IDS["1:0:36"]);
const CACHE_SECONDS = 300;

type DiscountRule = { ok: true; code: string; applicable: boolean; valueType: string | null; value: number | null };
// Per function instance, on top of the CDN cache below, so Shopify sees one lookup per code every few minutes.
const ruleCache = new Map<string, { rule: DiscountRule; expires: number }>();

const jsonResponse = (body: Record<string, unknown>, status: number, cacheSeconds = 0) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...(cacheSeconds
        ? { "Cache-Control": "public, max-age=60", "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${cacheSeconds}` }
        : { "Cache-Control": "no-store" }),
    },
  });

type ShopifyDiscountApplication = { value?: string; value_type?: string };
type ShopifyCart = {
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

// Looks up a discount code's rule exactly as Shopify checkout applies it, with no API token: add the base system
// to a throwaway storefront cart, apply the code, and read the discount back. The page applies the rule to the
// chosen setup. Codes are never listed; a code is only confirmed for someone who already has it.
export const GET: APIRoute = async ({ url }) => {
  const code = normalizeDiscountCode(url.searchParams.get("code"));
  if (!code) return jsonResponse({ ok: false, message: "Enter a valid discount code." }, 400);

  const cached = ruleCache.get(code);
  if (cached && cached.expires > Date.now()) return jsonResponse(cached.rule, 200, CACHE_SECONDS);

  try {
    const added = await postToCart("/cart/add.js", { items: [{ id: referenceVariantId, quantity: 1 }] });
    if (!added.ok) throw new Error(`cart/add.js returned ${added.status}`);
    const cookie = added.headers.getSetCookie().map((header) => header.split(";")[0]).join("; ");

    const updated = await postToCart("/cart/update.js", { discount: code }, cookie);
    if (!updated.ok) throw new Error(`cart/update.js returned ${updated.status}`);
    const cart = (await updated.json()) as ShopifyCart;

    const applicable = cart.discount_codes?.some((entry) => entry.code.toUpperCase() === code && entry.applicable) ?? false;
    const application =
      cart.items?.[0]?.line_level_discount_allocations?.[0]?.discount_application ??
      cart.cart_level_discount_applications?.[0];
    const rule: DiscountRule = {
      ok: true,
      code,
      applicable,
      // "percentage" (value 40 = 40% off) or "fixed_amount" (value in INR, once per order).
      valueType: applicable ? application?.value_type ?? null : null,
      value: applicable && application?.value ? Number(application.value) : null,
    };
    ruleCache.set(code, { rule, expires: Date.now() + CACHE_SECONDS * 1000 });
    return jsonResponse(rule, 200, CACHE_SECONDS);
  } catch (error) {
    console.error("Discount check failed", error);
    return jsonResponse({ ok: false, message: "We couldn’t check this code right now.", detail: String(error) }, 503);
  }
};
