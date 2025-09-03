/**
 * Shopify Admin API helper for customer upsert + marketing subscription.
 */

type UpsertParams = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  tags?: string[];
};

type UpsertResult = {
  ok: boolean;
  created?: boolean;
  updated?: boolean;
  customerId?: number;
  error?: string;
};

const SHOPIFY_API_VERSION = (import.meta.env.SHOPIFY_API_VERSION as string) || process.env.SHOPIFY_API_VERSION;
const SHOPIFY_ADMIN_ACCESS_TOKEN = (import.meta.env.SHOPIFY_ADMIN_ACCESS_TOKEN as string) || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = (import.meta.env.SHOPIFY_STORE_DOMAIN as string) || process.env.SHOPIFY_STORE_DOMAIN;

const API_VERSION = SHOPIFY_API_VERSION || "2024-07";

function sanitizeStoreDomain(input: string | undefined): string {
  if (!input) return "";
  const trimmed = input.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// Name is provided as separate fields from the form; no split required.

function toTagString(tags: string[] | undefined, existing?: string | null): string | undefined {
  const set = new Set<string>();
  (existing || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => set.add(t));
  (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .forEach((t) => set.add(t));
  if (set.size === 0) return undefined;
  return Array.from(set).join(", ");
}

async function shopifyFetch(path: string, init?: RequestInit) {
  const domain = sanitizeStoreDomain(SHOPIFY_STORE_DOMAIN);
  const token = SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN env");
  }
  const url = `${domain}/admin/api/${API_VERSION}/${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token,
  };
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers as any) } });
  return res;
}

async function findCustomerByEmail(email: string): Promise<any | null> {
  const query = encodeURIComponent(`email:${email}`);
  const res = await shopifyFetch(`customers/search.json?query=${query}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify search failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { customers: any[] };
  return data.customers?.[0] || null;
}

function hasPhoneAlreadyTaken(errBody: any): boolean {
  try {
    const json = typeof errBody === "string" ? JSON.parse(errBody) : errBody;
    const errs = json?.errors;
    const phoneErr = Array.isArray(errs?.phone) ? errs.phone.join(" ") : String(errs?.phone || "");
    return /already been taken/i.test(phoneErr);
  } catch {
    return false;
  }
}

function buildCustomerPayload(options: { id?: number; base: Record<string, unknown>; emailConsent: any; smsConsent?: any; tags: string[]; existingTags?: string | null; omitPhone?: boolean }) {
  const { id, base, emailConsent, smsConsent, tags, existingTags, omitPhone } = options;
  const payload: any = {
    customer: {
      ...(id ? { id } : {}),
      ...(omitPhone ? { ...base, phone: undefined } : base),
      email_marketing_consent: emailConsent,
      ...(smsConsent && !omitPhone ? { sms_marketing_consent: smsConsent } : {}),
      tags: toTagString(tags, existingTags),
    },
  };
  return payload;
}

async function updateCustomer(options: { id: number; base: Record<string, unknown>; emailConsent: any; smsConsent?: any; tags: string[]; existingTags?: string | null }): Promise<UpsertResult> {
  const { id, base, emailConsent, smsConsent, tags, existingTags } = options;
  const doUpdate = async (omitPhone: boolean) => {
    const payload = buildCustomerPayload({ id, base, emailConsent, smsConsent, tags, existingTags, omitPhone });
    return shopifyFetch(`customers/${id}.json`, { method: "PUT", body: JSON.stringify(payload) });
  };

  let res = await doUpdate(false);
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 422 && hasPhoneAlreadyTaken(text)) {
      res = await doUpdate(true);
      if (!res.ok) {
        const retryText = await res.text();
        return { ok: false, updated: false, error: `Update failed (retry): ${res.status} ${retryText}` };
      }
    } else {
      return { ok: false, updated: false, error: `Update failed: ${res.status} ${text}` };
    }
  }
  const data = await res.json();
  return { ok: true, updated: true, customerId: data.customer?.id };
}

async function createCustomer(options: { base: Record<string, unknown>; emailConsent: any; smsConsent?: any; tags: string[] }): Promise<UpsertResult> {
  const { base, emailConsent, smsConsent, tags } = options;
  const doCreate = async (omitPhone: boolean) => {
    const payload = buildCustomerPayload({ base, emailConsent, smsConsent, tags, omitPhone });
    return shopifyFetch("customers.json", { method: "POST", body: JSON.stringify(payload) });
  };

  let res = await doCreate(false);
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 422 && hasPhoneAlreadyTaken(text)) {
      res = await doCreate(true);
      if (!res.ok) {
        const retryText = await res.text();
        console.error("Create retry failed:", res.status, retryText);
        return { ok: false, created: false, error: `Create failed (retry): ${res.status} ${retryText}` };
      }
    } else {
      console.error("Create failed:", res.status, text);
      return { ok: false, created: false, error: `Create failed: ${res.status} ${text}` };
    }
  }
  const data = await res.json();
  console.log("Created customer:", data.customer?.id);
  return { ok: true, created: true, customerId: data.customer?.id };
}

export async function upsertShopifySubscriber(params: UpsertParams): Promise<UpsertResult> {
  const { email, firstName, lastName, phone, tags = [] } = params;
  if (!email) return { ok: false, error: "Email is required" };

  const consent = {
    state: "subscribed",
    opt_in_level: "confirmed_opt_in",
    consent_updated_at: new Date().toISOString(),
  } as const;

  // For SMS, Shopify requires a phone number on the customer and a consent object.
  // We'll default to single opt-in for SMS to avoid validation issues across regions.
  const smsConsent = phone
    ? {
        state: "subscribed",
        opt_in_level: "single_opt_in",
        consent_updated_at: new Date().toISOString(),
        consent_collected_from: "OTHER",
      }
    : undefined;

  try {
    const existing = await findCustomerByEmail(email);
    const base = {
      email,
      phone: phone || undefined,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
    } as Record<string, unknown>;

    if (existing?.id) {
      return updateCustomer({
        id: existing.id,
        base,
        emailConsent: consent,
        smsConsent,
        tags,
        existingTags: existing.tags,
      });
    }

    return createCustomer({ base, emailConsent: consent, smsConsent, tags });
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}
