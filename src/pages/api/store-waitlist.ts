import type { APIRoute } from "astro";

export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const waitlistApiUrl = String(
  import.meta.env.STORE_WAITLIST_API_URL ??
  process.env.STORE_WAITLIST_API_URL ??
  "",
).trim();

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!emailPattern.test(email)) {
      return jsonResponse({ ok: false, message: "Enter a valid email address." }, 400);
    }

    if (!waitlistApiUrl) {
      console.error("STORE_WAITLIST_API_URL is not configured");
      return jsonResponse(
        { ok: false, message: "Availability signup is temporarily unavailable. Please try again later or contact us." },
        503,
      );
    }

    const response = await fetch(waitlistApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({
        name: "",
        countryCode: "",
        mobileNumber: "",
        email,
        city: "",
        interests: ["product_availability", "source:store-page"],
        isNewsletterSubscribed: false,
      }),
    });

    if (!response.ok) {
      return jsonResponse({ ok: false, message: "We couldn’t add you to the list. Please try again." }, 502);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    console.error("Store waitlist submission failed", error);
    return jsonResponse({ ok: false, message: "We couldn’t add you to the list. Please try again." }, 500);
  }
};
