export const prerender = false;

import type { APIRoute } from "astro";
import { URLS } from "../../utils/urls";

const ASSESSMENT_API_PATH =
  "/api/v1/crm/opportunities/assessment-interest-form";

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();

    if (!URLS.ASSESSMENT_API_BASE_URL) {
      return new Response(
        JSON.stringify({
          status: "FAILURE",
          result: null,
          error: {
            code: "CONFIG_ERROR",
            message: "Assessment API is not configured.",
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const crmResponse = await fetch(
      `${URLS.ASSESSMENT_API_BASE_URL}${ASSESSMENT_API_PATH}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

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

    return new Response(JSON.stringify(data), {
      status: crmResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(
      "Error proxying assessment submission to CRM API:",
      error,
    );

    return new Response(
      JSON.stringify({
        status: "FAILURE",
        result: null,
        error: {
          code: "PROXY_ERROR",
          message:
            "Something went wrong while submitting the form. Please try again.",
        },
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};