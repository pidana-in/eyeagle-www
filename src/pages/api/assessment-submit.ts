export const prerender = false;

import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

const ASSESSMENT_API_PATH =
  "/api/v1/crm/opportunities/assessment-interest-form";
const MAX_REQUEST_BYTES = 20_000;
const REQUEST_TIMEOUT_MS = 10_000;

type InquiryPayload = {
  clientSubmissionId?: string;
  name?: string;
  phone?: string;
  location?: string;
  mainConcerns?: string[];
  description?: string;
  preferredTiming?: string;
  contactConsent?: boolean;
  consideringFor?: string[];
  immediateConcern?: string;
  interestedIn?: string;
  preferredDay?: string;
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });

const failureResponse = (code: string, message: string, status: number) =>
  jsonResponse(
    {
      status: "FAILURE",
      result: null,
      error: { code, message },
    },
    status,
  );

const normalizeText = (value: unknown, maxLength: number) =>
  String(value ?? "").trim().slice(0, maxLength);

const normalizeList = (value: unknown, maxItems = 12, maxLength = 120) =>
  (Array.isArray(value) ? value : [])
    .slice(0, maxItems)
    .map((item) => normalizeText(item, maxLength))
    .filter(Boolean);

const validatePayload = (value: unknown): InquiryPayload | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const source = value as Record<string, unknown>;
  const payload: InquiryPayload = {
    clientSubmissionId: normalizeText(source.clientSubmissionId, 80),
    name: normalizeText(source.name, 80),
    phone: normalizeText(source.phone, 24),
    location: normalizeText(source.location, 160),
    mainConcerns: normalizeList(source.mainConcerns),
    description: normalizeText(source.description, 2_000),
    preferredTiming: normalizeText(source.preferredTiming, 80),
    contactConsent: source.contactConsent === true,
    consideringFor: normalizeList(source.consideringFor),
    immediateConcern: normalizeText(source.immediateConcern, 120),
    interestedIn: normalizeText(source.interestedIn, 120),
    preferredDay: normalizeText(source.preferredDay, 80),
  };

  const validName = /^[\p{L}\p{M} .'-]{2,80}$/u.test(payload.name ?? "");
  const validPhone = /^\+\d{1,4}\s\d{6,15}$/.test(payload.phone ?? "");

  if (
    !validName ||
    !validPhone ||
    !payload.mainConcerns?.length ||
    payload.contactConsent !== true
  ) {
    return null;
  }

  return payload;
};

const cleanLine = (value: unknown, fallback = "Not provided") => {
  const text = String(value ?? "").replace(/[\r\n]+/g, " ").trim();
  return text || fallback;
};

const sendInquiryNotification = async (payload: InquiryPayload) => {
  const {
    SMTP_HOST: host,
    SMTP_PORT: port = "587",
    SMTP_USER: user,
    SMTP_PASS: pass,
    SMTP_FROM: defaultFrom,
    SMTP_TO: defaultTo,
    INQUIRY_NOTIFICATION_FROM: inquiryFrom,
    INQUIRY_NOTIFICATION_TO: inquiryTo,
  } = import.meta.env;

  const from = inquiryFrom || defaultFrom;
  const to = inquiryTo || defaultTo;

  if (!host || !user || !pass || !from || !to) {
    console.warn(
      "Inquiry email notification skipped because SMTP configuration is incomplete.",
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  const topics = Array.isArray(payload.mainConcerns)
    ? payload.mainConcerns.map((item) => cleanLine(item)).join(", ")
    : "Not provided";
  const name = cleanLine(payload.name);
  const submittedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  await transporter.sendMail({
    from,
    to,
    subject: `New EyEagle enquiry — ${name}`,
    text: [
      "A new enquiry was submitted on the EyEagle website.",
      "",
      `Name: ${name}`,
      `Phone: ${cleanLine(payload.phone)}`,
      `City or location: ${cleanLine(payload.location)}`,
      `Topics: ${topics}`,
      `Preferred time: ${cleanLine(payload.preferredTiming, "No preference")}`,
      `Consent to contact: ${payload.contactConsent ? "Yes" : "No"}`,
      `Message: ${cleanLine(payload.description)}`,
      `Submission ID: ${cleanLine(payload.clientSubmissionId)}`,
      `Submitted: ${submittedAt} IST`,
    ].join("\n"),
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return failureResponse(
        "UNSUPPORTED_MEDIA_TYPE",
        "This endpoint accepts JSON submissions only.",
        415,
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return failureResponse("PAYLOAD_TOO_LARGE", "The enquiry is too large.", 413);
    }

    const payload = validatePayload(await request.json());
    if (!payload) {
      return failureResponse(
        "VALIDATION_ERROR",
        "Please check your name, phone number, enquiry topic, and consent.",
        400,
      );
    }

    const configuredBaseUrl = String(
      import.meta.env.ASSESSMENT_API_BASE_URL ??
        process.env.ASSESSMENT_API_BASE_URL ??
        "",
    ).trim();

    if (!configuredBaseUrl) {
      console.error("ASSESSMENT_API_BASE_URL is not configured");
      return failureResponse(
        "CONFIG_ERROR",
        "Enquiry submission is temporarily unavailable. Please try again later.",
        503,
      );
    }

    let assessmentApiUrl: URL;
    try {
      assessmentApiUrl = new URL(ASSESSMENT_API_PATH, `${configuredBaseUrl.replace(/\/$/, "")}/`);
    } catch {
      console.error("ASSESSMENT_API_BASE_URL is invalid");
      return failureResponse(
        "CONFIG_ERROR",
        "Enquiry submission is temporarily unavailable. Please try again later.",
        503,
      );
    }

    const crmResponse = await fetch(assessmentApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const responseText = await crmResponse.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        status: crmResponse.ok ? "SUCCESS" : "FAILURE",
        result: responseText || null,
      };
    }

    const crmAccepted =
      crmResponse.ok &&
      (typeof data?.status !== "string" ||
        data.status.toLowerCase() === "success");

    if (crmAccepted) {
      try {
        await sendInquiryNotification(payload);
      } catch (emailError) {
        console.error("Error sending inquiry email notification:", emailError);
      }
    }

    return new Response(JSON.stringify(data), {
      status: crmResponse.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(
      "Error proxying assessment submission to CRM API:",
      error,
    );

    return failureResponse(
      "PROXY_ERROR",
      "Something went wrong while submitting the form. Please try again.",
      502,
    );
  }
};
