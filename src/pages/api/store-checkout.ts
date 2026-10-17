import type { APIRoute } from "astro";
import storeConfig from "../../../config/store.json" with { type: "json" };
import { getEyEagleConfiguredPurchase } from "../../data/shopify-configurator";
import { checkEyEagleShopifyCheckout } from "../../server/store-checkout";

export const prerender = false;

const json = (body: Record<string, unknown>, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
});

export const GET: APIRoute = async ({ request }) => {
  const previewOpen = import.meta.env.DEV && storeConfig.orderingPreviewOpen === true;
  if (storeConfig.orderingOpen !== true && !previewOpen) {
    return json({ ok: false, message: "Ordering is not open yet." }, 403);
  }

  const params = new URL(request.url).searchParams;
  const purchase = getEyEagleConfiguredPurchase(
    Number(params.get("bathrooms")),
    Number(params.get("sos")),
    Number(params.get("membership")),
  );
  if (!purchase) return json({ ok: false, message: "Choose a valid EyEagle setup." }, 400);

  const check = await checkEyEagleShopifyCheckout(purchase);
  if (!check.ok) return json(check, 409);

  if (request.headers.get("Accept")?.includes("application/json")) {
    return json({ ok: true, checkoutUrl: purchase.shopifyCartUrl }, 200);
  }
  return new Response(null, {
    status: 302,
    headers: { "Cache-Control": "no-store", Location: purchase.shopifyCartUrl },
  });
};
