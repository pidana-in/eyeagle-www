import {
  EYEAGLE_SHOPIFY_CART_ITEMS,
  EYEAGLE_SHOPIFY_CONFIG,
  formatInr,
  type EyEagleConfiguredPurchase,
} from "../data/shopify-configurator.ts";

type PublicVariant = {
  id: number;
  price: number;
  available: boolean;
};

type PublicProduct = {
  handle: string;
  title?: string;
  variants: PublicVariant[];
};

export type StoreCheckoutCheck = { ok: true } | { ok: false; message: string };

// Product JSON is public and needs no Admin API token. Recheck at the moment of checkout so a
// stale local price cannot send a buyer to Shopify with a missing or underpriced cart line.
export const checkEyEagleShopifyCheckout = async (
  purchase: EyEagleConfiguredPurchase,
  fetchProduct: typeof fetch = fetch,
): Promise<StoreCheckoutCheck> => {
  try {
    const products = await Promise.all(purchase.cartLines.map(async (line) => {
      const item = EYEAGLE_SHOPIFY_CART_ITEMS[line.item];
      const response = await fetchProduct(`https://${EYEAGLE_SHOPIFY_CONFIG.storeDomain}/products/${item.handle}.js`, {
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Shopify returned ${response.status} for ${item.handle}`);
      return response.json() as Promise<PublicProduct>;
    }));

    for (let index = 0; index < purchase.cartLines.length; index++) {
      const line = purchase.cartLines[index];
      const product = products[index];
      const item = EYEAGLE_SHOPIFY_CART_ITEMS[line.item];
      if (product.handle !== item.handle) {
        return { ok: false, message: "A Shopify product has changed. Please contact our team before checking out." };
      }
      const variant = product.variants?.find((candidate) => String(candidate.id) === line.variantId);
      if (!variant) {
        return { ok: false, message: "A Shopify item is unavailable for this setup. Please contact our team." };
      }
      if (variant.price !== line.expectedUnitPriceInr * 100) {
        const name = line.item === "additionalSos" ? "Additional Alert Unit" : product.handle.replaceAll("-", " ");
        return {
          ok: false,
          message: `${name} is ${formatInr(variant.price / 100)} in Shopify but ${formatInr(line.expectedUnitPriceInr)} in this setup. Checkout is paused until the prices match.`,
        };
      }
      if (!variant.available) {
        const name = product.title || item.handle.replaceAll("-", " ");
        return { ok: false, message: `${name} is currently unavailable in Shopify. Please contact us.` };
      }
    }
    return { ok: true };
  } catch (error) {
    console.error("EyEagle Shopify checkout validation failed", error);
    return { ok: false, message: "We couldn’t verify this setup with Shopify right now. Please try again shortly." };
  }
};
