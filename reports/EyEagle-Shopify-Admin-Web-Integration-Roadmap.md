# EyEagle Shopify Admin Web Integration Roadmap

Architecture, security, Shopify configuration, and implementation plan for an internal EyEagle administration web application that can view and process Shopify orders, manage fulfillment, and update inventory.

| Field | Value |
| --- | --- |
| Prepared for | EyEagle team |
| Version | 1.0 |
| Date | 20 July 2026 |
| Repository | `eyeagle-www` (planning document only; the admin-web repository was not identified in this workspace) |
| Scope | Internal order operations, fulfillment, refunds/cancellations, inventory, Shopify synchronization, staff access, and auditability |
| Status | Planning document; no Shopify configuration, credentials, production data, or deployment were changed |
| Related documents | `reports/EyEagle-Shopify-Headless-Integration-Roadmap.md` and `reports/EyEagle-AI-LLM-Discoverability-Commerce-Roadmap.md` |

## Executive recommendation

Build the admin web as a private operations application that talks to Shopify through the **GraphQL Admin API from its backend**. Do not use the Storefront API for staff order or inventory operations, and never call the Admin API directly from browser JavaScript.

The term “headless Shopify” covers several APIs with different trust boundaries:

| Shopify interface | Intended use | Appropriate for the admin web? |
| --- | --- | --- |
| Storefront API | Public catalog, variants, availability, carts, and checkout handoff | Only for buyer-facing pages; not for staff order processing or inventory writes |
| Customer Account API | An authenticated customer viewing their own profile, orders, returns, and related account data | No; it is customer-scoped, not an employee operations API |
| GraphQL Admin API | Store operations, orders, fulfillment, inventory, products, customers, refunds, and app configuration | Yes; use server-to-server with minimum scopes |
| Shopify Admin user interface | Shopify's complete merchant administration experience | Keep as the fallback for unusual and high-risk work; deep-link to it where useful |

For EyEagle's current single-package business, Shopify should initially remain the system of record for product, variant, price, order, payment, fulfillment, and available inventory. The admin web should add the EyEagle-specific operational workflow that Shopify does not model well—for example, safety-audit scheduling, installation assignment, technician status, and app activation—without trying to recreate all of Shopify Admin.

Recommended implementation order:

1. Establish staff authentication, authorization, and an audit trail.
2. Add read-only Shopify orders, fulfillment orders, products, locations, and inventory.
3. Add verified webhooks and a local read projection for fast dashboards.
4. Add audited inventory adjustments with concurrency and idempotency protection.
5. Add fulfillment creation and tracking updates.
6. Add cancellations and refunds only after approval rules and recovery procedures are tested.

This sequence reduces the chance that an early integration can accidentally expose customer data, oversell stock, duplicate a fulfillment, or issue an unintended refund.

## Important boundary: public website versus admin web

Do not add employee order-management routes to the public static `eyeagle.ai` application. Host the admin application separately, such as at `admin.eyeagle.ai`, and protect it with both application authentication and an outer access layer such as corporate SSO or Cloudflare Access.

The public website and admin web have materially different requirements:

| Concern | Public `eyeagle.ai` | Private admin web |
| --- | --- | --- |
| Audience | Visitors and customers | Authorized EyEagle staff |
| Caching | Public CDN caching is desirable | Responses containing order/customer data must not be publicly cached |
| Rendering | Static HTML where possible | Authenticated, dynamic application |
| Shopify API | Storefront and Customer Account APIs | GraphQL Admin API |
| Credentials | No Admin credentials | Server-side Admin app credentials only |
| Search indexing | Product and public content should be crawlable | Block indexing and require authentication |
| Data | Public product facts | Protected customer, order, fulfillment, and operational data |

Cloudflare Access is a useful additional control, but it does not replace the admin application's own sessions, role checks, and mutation authorization. Every sensitive backend operation must identify the staff member and verify their permission before calling Shopify.

## Goals

- Give authorized staff a focused view of new and in-progress Shopify orders.
- Allow permitted staff to inspect line items, payment/financial status, fulfillment status, delivery details, and inventory availability.
- Support fulfillment creation and tracking updates through Shopify's supported fulfillment-order model.
- Support safe, reasoned, and audited inventory adjustments.
- Support cancellation and refund workflows with stronger permissions and explicit confirmation.
- Receive Shopify webhooks, tolerate retries and out-of-order delivery, and reconcile missed events.
- Keep Shopify as the authoritative commerce ledger while storing only the local operational data EyEagle genuinely needs.
- Protect customer data through least privilege, encryption, retention rules, access logs, and separated development/production environments.
- Provide an immutable record of who viewed or changed sensitive operational state.
- Avoid duplicating the full Shopify Admin experience.

## Non-goals for the first release

- Replacing Shopify checkout, payment processing, fraud analysis, taxes, discounts, or order accounting.
- Giving the browser a Shopify Admin access token, client secret, or unrestricted API proxy.
- Copying every Shopify customer and order field into a local database.
- Treating fulfillment as proof that an EyEagle audit, installation, or app activation is complete.
- Supporting multiple warehouses, transfers, purchase orders, or complex reservations before the business actually needs them.
- Building a generic multi-merchant Shopify app.
- Publishing admin routes, customer data, order data, or internal inventory data to search engines or LLM crawlers.
- Allowing unaudited bulk inventory changes, refunds, cancellations, or exports.
- Using legacy Shopify Admin REST endpoints for new work. New functionality should use the versioned [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest).

## Repository and architecture assumptions

This workspace contains the public `eyeagle-www` Astro application, but no admin-web repository could be identified. Consequently:

- this document does not assume React, Next.js, Astro, Laravel, or another admin framework;
- route names and database tables below are conceptual contracts, not prescribed file paths;
- the admin application should be implemented in its own codebase or an explicitly approved private application package;
- credentials, production URLs, SSO provider, database vendor, and hosting platform must be selected by the team rather than inferred from the public website;
- no admin implementation should be added to the public repository until repository ownership, deployment isolation, and access controls are decided.

The public website currently uses Astro, Node.js 24, pnpm, Netlify, and Cloudflare. Those facts do not require the internal admin application to use the same stack. Choose a maintained server-capable framework that the team can operate securely on Node.js 24 or another supported runtime.

## Recommended system design

```text
Authorized staff browser
        |
        | SSO/MFA + application session
        v
Private admin web
        |
        +--> Admin backend authorization layer
        |        |
        |        +--> GraphQL Admin API
        |        |
        |        +--> Local operational database/read projection
        |        |
        |        +--> Immutable audit log
        |
Shopify webhooks --> HMAC verification --> durable queue --> idempotent worker
                                             |
                                             +--> GraphQL enrichment
                                             +--> local projection update
                                             +--> reconciliation metrics
```

### Why a backend is mandatory

Shopify Admin app credentials are merchant-level secrets. A browser-delivered token would allow anyone who obtains it to act with all scopes granted to the application. The browser should instead call narrowly defined admin-backend operations such as:

- list orders visible to the signed-in staff member;
- get one order and its fulfillment orders;
- submit an inventory adjustment with a reason;
- create a fulfillment for selected line items;
- request a cancellation or refund;
- view an authorized audit trail.

The backend then validates the staff session, role, request shape, current Shopify state, and business rules before issuing a specific Shopify query or mutation. Do not create a generic endpoint that accepts arbitrary GraphQL from the browser.

### Standalone application versus embedded Shopify app

There are two valid user-interface options:

| Option | Advantages | Trade-offs |
| --- | --- | --- |
| Standalone private admin web | Can combine Shopify with EyEagle audit, technician, installation, and app-activation workflows; can use company SSO | EyEagle must operate authentication, authorization, sessions, hosting, and navigation |
| Embedded Shopify app | Staff enter through Shopify Admin; Shopify session and App Bridge integration; familiar context | Less suitable if the workflow spans substantial non-Shopify operational data; still requires an app backend |

Use a standalone private admin web if the primary value is a combined operations console. If staff only need standard order, refund, fulfillment, and inventory features, first evaluate whether Shopify Admin already meets the requirement. Building a second interface has ongoing security and maintenance cost.

## System-of-record decisions

State ownership must be explicit before implementation.

| Data | Recommended authority | Local treatment |
| --- | --- | --- |
| Product title, handle, variant, SKU, price, currency | Shopify | Read-only projection or live query |
| Order and line items | Shopify | Minimal read projection for operations/search |
| Payment and financial status | Shopify | Read-only; never synthesize or override locally |
| Refunds and cancellations | Shopify | Initiated through Admin API and reflected locally after confirmation/webhook |
| Fulfillment orders and fulfillment status | Shopify | Query and mutate through fulfillment-order APIs |
| Available inventory | Shopify initially | Local projection for display; writes go to Shopify |
| Staff identities and roles | EyEagle identity provider/admin application | Store internal user ID and role assignments |
| Safety-audit appointment | EyEagle operations database | Link to Shopify order/line item by stable ID |
| Installation/technician workflow | EyEagle operations database | Do not equate with Shopify fulfillment |
| Internal notes and handoffs | EyEagle operations database, subject to retention policy | Avoid copying unnecessary customer data |
| Audit log | EyEagle append-only audit store | Record every sensitive view and mutation |

Use Shopify global IDs rather than human-readable order names as relational keys. Order names such as `#1001` are useful for display and search but should not be the only identifier.

## Inventory model for the single package

Having one sellable package simplifies the interface but does not remove Shopify's inventory model. A product can have one or more variants; each inventory-tracked variant has an inventory item; quantities exist per Shopify location.

### Recommended initial policy

- Track the package at one designated merchant-managed Shopify location.
- Keep Shopify as the inventory system of record.
- Display the selected location, variant/SKU, current quantity, and the time the data was retrieved.
- Use delta adjustments for normal receipts, damages, corrections, and manual changes.
- Require a predefined reason plus an optional staff note.
- Associate every change with a unique command ID and reference URI.
- Do not allow negative available inventory unless business rules and Shopify selling policy explicitly permit it.
- Re-read the current quantity after a successful mutation and update the projection from Shopify.

Shopify's [`inventoryAdjustQuantities`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities) mutation is intended for delta changes. In API versions where Shopify requires idempotency for this mutation, send a unique key using the documented `@idempotent` directive. Include a reason and `referenceDocumentUri` so staff can trace why a quantity changed.

Example conceptual reasons:

| Reason | Example delta | Required evidence |
| --- | ---: | --- |
| Stock received | `+10` | Receiving document/reference |
| Damaged item | `-1` | Damage note or incident reference |
| Cycle-count correction | `+2` or `-2` | Count record and approver |
| Customer return accepted | Depends on item condition | Return/refund reference |
| Installation consumption | Usually represented by order fulfillment, not an extra manual decrement | Order/fulfillment reference |

Do not decrement stock a second time when Shopify has already handled inventory for an order or fulfillment workflow. Document the exact Shopify inventory behavior in tests before enabling manual operational shortcuts.

### If the admin system later becomes inventory authority

Only use [`inventorySetQuantities`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventorySetQuantities) for absolute quantities if EyEagle deliberately makes the admin system or an external OMS authoritative. Use `compareQuantity` to prevent overwriting a concurrent update, and handle comparison failures as a refresh-and-review event rather than silently retrying with a stale number.

Changing authority requires a migration plan, location mapping, reconciliation jobs, conflict ownership, alerting, and an operational runbook. It should not happen simply because the API offers an absolute-set mutation.

## Order and fulfillment model

An order has several independent dimensions:

- financial state, such as paid, partially refunded, or refunded;
- cancellation state;
- fulfillment state;
- one or more fulfillment orders assigned to locations;
- delivery/tracking state;
- EyEagle's separate audit, appointment, installation, or activation state.

Do not compress these into one local `status` field. A paid order can be unfulfilled, partially fulfilled, cancelled in part, or awaiting an EyEagle service appointment.

Shopify's [`Order`](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order) queries should be the source for commerce state. Shopify normally limits order access to the recent window unless the app receives the additional `read_all_orders` access. Do not request older-order access until the business need and protected-data handling are approved.

### Fulfillment workflow

New integrations should use Shopify's `FulfillmentOrder` model, following Shopify's [order-management app guidance](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps) and [fulfillment solution workflow](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/build-fulfillment-solutions).

A safe fulfillment workflow is:

1. Read the current order and its fulfillment orders from Shopify.
2. Show location assignment, supported actions, remaining quantities, delivery method, and holds.
3. Let an authorized staff member choose fulfillable line items and quantities.
4. Re-query or validate freshness immediately before mutation.
5. Create the fulfillment only for compatible fulfillment orders and locations.
6. Add carrier/tracking information when known.
7. Inspect GraphQL errors and mutation `userErrors` even when HTTP status is `200`.
8. Record the staff member, request, Shopify response identifiers, and outcome in the audit log.
9. Confirm final state from Shopify or a subsequent webhook before marking the command complete.

Do not assume one order has one fulfillment order. Split shipping, multiple locations, holds, and partial fulfillment can create multiple units of work. Shopify documents that fulfillment line items grouped into a fulfillment must belong to the same order and compatible assigned location; verify the current mutation contract in the [Fulfillment API reference](https://shopify.dev/docs/api/admin-graphql/latest/objects/Fulfillment) during implementation.

### Cancellation and refund workflow

Cancellation and refund are high-risk financial actions and should be introduced last.

- `orderCancel` is irreversible and can combine refund, restock, and customer notification behavior. Shopify returns an asynchronous job for relevant cancellation work; the UI must not declare success before the job and resulting order state are confirmed. See [`orderCancel`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderCancel).
- Refunds can be full or partial and may affect line items, shipping, duties, fees, and restocking. Build from the current [`refundCreate`](https://shopify.dev/docs/api/admin-graphql/latest/mutations/refundCreate) contract.
- Always show a server-calculated preview of amount, currency, items, shipping, restock behavior, and notification choice.
- Require reauthentication or step-up authentication for high-value actions.
- Consider a request/approve pattern so the operator who prepares a refund is not the approver.
- Store a business reason and immutable before/after snapshot identifiers.
- Use idempotent local command records so a browser retry cannot create a duplicate financial action.
- If the result is ambiguous because of a timeout, query Shopify before retrying.

Rare, complex refunds can initially deep-link to the relevant Shopify Admin order rather than being rebuilt in the first admin-web release.

## Staff security and role model

### Authentication requirements

- Use individual staff identities; prohibit shared admin accounts.
- Require MFA through the selected identity provider.
- Prefer corporate SSO with short-lived application sessions.
- Use secure, HTTP-only, same-site cookies and CSRF protection for cookie-authenticated mutations.
- Set a short inactivity timeout and a reasonable absolute session lifetime.
- Revoke sessions promptly when employment or role changes.
- Separate development, staging, and production identities and data.
- Do not use Shopify app credentials as employee authentication. They authenticate the application to Shopify, not the staff member to EyEagle.

### Initial roles

| Role | Read access | Write access |
| --- | --- | --- |
| Support viewer | Orders and permitted customer fields | None |
| Order operator | Orders, fulfillment orders, inventory | Prepare/create permitted fulfillment and tracking updates |
| Inventory manager | Products, variants, locations, inventory, relevant orders | Reasoned inventory adjustments |
| Refund approver | Orders, payments, fulfillment, refund history | Approve cancellation/refund within policy |
| Operations administrator | Configuration, users, audit log | Manage roles and operational settings; not automatically exempt from financial approval |
| Auditor | Read-only audit events and approved operational views | None |

Enforce authorization on the backend for every request. Hiding a button is not authorization. A staff member should receive only the minimum protected customer fields required for their role and current task.

### Sensitive operations matrix

| Operation | Suggested control |
| --- | --- |
| View address, phone, or email | Authorized support/order role; log access where feasible |
| Export order/customer data | Disabled initially; explicit administrator approval and limited fields if later required |
| Adjust inventory | Inventory role, reason, reference, idempotency key, before/after values |
| Fulfill order | Order role, current fulfillment-order validation, confirmation |
| Change tracking | Order role, audit event |
| Cancel order | Refund/cancellation role, explicit preview, step-up confirmation |
| Issue refund | Approver role, amount preview, policy limit, optional two-person approval |
| Bulk action | Disabled initially; separate design and approval before introduction |

## Shopify configuration runbook

Shopify menus and API requirements change over time. Verify every production step against the current official documentation and pin explicit Admin API and webhook API versions.

### Step 1 — Confirm ownership and deployment model

Before creating an app, confirm:

- the Shopify store and the new app are owned by the same organization;
- the integration is for EyEagle's own store rather than public distribution;
- the production store's permanent `*.myshopify.com` domain;
- who owns Shopify app credentials, admin hosting, SSO, database, monitoring, and incident response;
- whether the admin interface is standalone or embedded;
- which Shopify location owns package inventory;
- whether orders older than Shopify's default access window are genuinely required.

For an own-store integration owned by the same organization, Shopify's [client credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant) is the preferred server-to-server pattern. If the app and store are not under the same organization, or the app will be distributed to other merchants, use Shopify's appropriate OAuth/distribution model instead.

### Step 2 — Create the app in Shopify Dev Dashboard

New custom applications should be created through Shopify's Dev Dashboard or Shopify CLI rather than relying on an obsolete custom-app flow in Shopify Admin. Follow Shopify's current [Dev Dashboard app creation guide](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard).

Suggested sequence:

1. Sign in to the Shopify Dev Dashboard using an individually assigned authorized account.
2. Open **Apps** and choose **Create app**.
3. Start from the Dev Dashboard and name the app clearly, for example `EyEagle Admin Web Integration`.
4. Record the app owner and business purpose in the internal credential register.
5. Create an initial app version with an explicit API version, application URL if required, webhook API version, and minimum scopes.
6. Review the configuration and release that app version.
7. Install the app on the correct EyEagle store.
8. From the app's settings, copy the Client ID and Client Secret directly into the approved secret manager.

Never paste the secret into source code, a Markdown report, a ticket, chat, browser-side configuration, or a public deployment variable.

### Step 3 — Grant scopes in phases

Shopify Admin API scopes should match implemented features, not future aspirations. Scope names and access requirements must be confirmed in the current [Shopify access scopes reference](https://shopify.dev/docs/api/usage/access-scopes).

#### Phase A: read-only operations

Request only what is needed to build and test the read-only console:

```text
read_orders
read_products
read_inventory
read_locations
read_merchant_managed_fulfillment_orders
```

Do not request `read_customers` merely to display fields already available through permitted order access. If standalone customer search is genuinely required later, document why, request the appropriate protected-customer-data access, and minimize returned fields.

`read_all_orders` is additional access for orders outside Shopify's normal recent-order window. Treat it as an exception requiring a written retention and access justification.

#### Phase B: inventory adjustments

Add only when the audited adjustment workflow is ready:

```text
write_inventory
```

Keep `read_inventory` and `read_locations`. Confirm the staff permissions associated with the installed application and the exact inventory mutation requirements.

#### Phase C: merchant-managed fulfillment

Add only when fulfillment creation and tracking have passed staging tests:

```text
write_merchant_managed_fulfillment_orders
```

The precise combination of order and fulfillment scopes depends on the mutations and locations used. Confirm it from the current API schema rather than granting every fulfillment scope. Do not request third-party or assigned-fulfillment-service scopes unless EyEagle actually performs that role.

#### Phase D: cancellation and refund

Add or retain the required write scope only when the protected workflow is approved:

```text
write_orders
```

Refund and cancellation capabilities should be controlled more narrowly inside EyEagle than the Shopify app-level scope permits. An app token with `write_orders` can perform actions beyond what every signed-in operator should be allowed to do.

#### Optional product administration

Avoid `write_products` in the first release. Product title, copy, media, price, and variant changes can remain in Shopify Admin. If a future admin workflow requires product mutation, create a separate design, validation policy, and role before adding the scope.

### Step 4 — Store credentials securely

Use an approved secret manager or encrypted hosting configuration, with separate values per environment.

Conceptual server-side configuration:

```text
SHOPIFY_STORE_DOMAIN=store-name.myshopify.com
SHOPIFY_ADMIN_API_VERSION=<explicit-supported-version>
SHOPIFY_WEBHOOK_API_VERSION=<explicit-supported-version>
SHOPIFY_ADMIN_CLIENT_ID=<secret-manager-reference>
SHOPIFY_ADMIN_CLIENT_SECRET=<secret-manager-reference>
ADMIN_DATABASE_URL=<secret-manager-reference>
ADMIN_SESSION_SECRET=<secret-manager-reference>
ADMIN_SSO_ISSUER=<approved-identity-provider>
ADMIN_SSO_CLIENT_ID=<secret-manager-reference>
ADMIN_SSO_CLIENT_SECRET=<secret-manager-reference>
```

Do not configure a permanent browser-visible `SHOPIFY_ADMIN_ACCESS_TOKEN`. With the eligible client-credentials flow, the backend exchanges the Client ID and Client Secret for a short-lived Admin API token using Shopify's token endpoint. Shopify currently documents an approximately 24-hour token lifetime; cache the token server-side until shortly before expiration and request a new one as needed.

Token acquisition must:

- happen only on the backend;
- use the permanent `myshopify.com` store domain;
- redact the client secret and access token from logs and traces;
- tolerate a token expiring between requests by refreshing once and safely retrying a read;
- avoid uncontrolled mutation retries;
- alert on repeated authorization failures, revoked installation, or changed scopes.

### Step 5 — Configure versioned webhooks

Use app-specific webhook subscriptions in the app configuration/version where practical, following Shopify's [webhook subscription guidance](https://shopify.dev/docs/apps/build/webhooks/subscribe). Start with topics required to keep the local operational projection current, subject to verifying exact topic names in the selected webhook API version:

- order created;
- order updated;
- order cancelled;
- order fulfilled or fulfillment updated;
- refund created;
- inventory level updated;
- product/variant updated if shown in the admin console;
- fulfillment-order events relevant to merchant-managed fulfillment.

Do not subscribe to every available topic. Each subscription adds protected-data processing, operational noise, and failure modes.

Configure separate HTTPS webhook endpoints and secrets per environment. Production Shopify webhooks must never send customer data into a development system.

## Webhook receiver design

Webhook processing is a synchronization signal, not the only source of truth.

### Receiver requirements

1. Accept the raw request body without JSON reserialization.
2. Verify `X-Shopify-Hmac-SHA256` using the installed app's client secret and Shopify's current [verification procedure](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries).
3. Reject invalid signatures before parsing or storing protected content.
4. Capture the Shopify webhook ID, topic, shop domain, API version, and receive time.
5. Deduplicate using `X-Shopify-Webhook-Id` or the current documented delivery identifier.
6. Enqueue durable work and respond quickly; do not perform a long Shopify query or business workflow before acknowledging delivery.
7. Process idempotently because Shopify can retry.
8. Assume deliveries can be delayed or arrive out of order.
9. Fetch the current entity from the GraphQL Admin API when a complete, authoritative view is required.
10. Update the local projection in a transaction and record processing outcome.

Do not log the full raw payload by default. If short-lived encrypted capture is needed for debugging, restrict it by environment, access role, and retention period.

### Reconciliation

Webhooks alone are not sufficient for correctness. Add a scheduled reconciliation process that:

- queries orders updated since a recorded cursor/time with an overlap window;
- compares Shopify state with local projection state;
- repairs missing or stale projection rows;
- checks inventory for the designated product/variant/location;
- alerts on repeated webhook failures, cursor gaps, or unexplained inventory differences;
- never rewrites Shopify from a stale projection unless the admin system has explicitly become the system of record.

Shopify's [enterprise order-management integration guidance](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/enterprise-oms-integration) similarly treats webhooks as inbound signals and API queries as enrichment/reconciliation mechanisms.

## Backend API design

Expose business operations rather than Shopify's raw GraphQL surface.

Conceptual endpoints or server actions:

| Operation | Purpose | Minimum local role |
| --- | --- | --- |
| `GET /orders` | Paginated, filtered order projection | Viewer |
| `GET /orders/{local-id}` | Current Shopify order plus EyEagle operational state | Viewer |
| `POST /orders/{id}/fulfillments` | Create permitted fulfillment | Order operator |
| `POST /fulfillments/{id}/tracking` | Update tracking | Order operator |
| `POST /orders/{id}/cancellation-requests` | Prepare/request cancellation | Order operator or approver, per policy |
| `POST /orders/{id}/refund-requests` | Prepare/request refund | Order operator or approver, per policy |
| `POST /refund-requests/{id}/approve` | Execute approved refund | Refund approver |
| `GET /inventory` | Inventory for allowed product/location | Viewer or inventory role |
| `POST /inventory/adjustments` | Submit reasoned delta adjustment | Inventory manager |
| `GET /audit-events` | Review immutable activity | Auditor/admin |

Every mutation request should include a unique client command ID. The backend stores a command record before calling Shopify, then returns the existing outcome when the same command is repeated.

### Shopify GraphQL client rules

- Use one reviewed server-only client module.
- Pin an explicit supported Admin API version; do not silently use `latest` in production.
- Allowlist the permanent store domain rather than accepting a request-supplied shop host.
- Use persisted query documents or server-owned query strings; do not accept arbitrary GraphQL from the client.
- Set request timeouts and bounded retries.
- Inspect HTTP status, GraphQL top-level `errors`, mutation `userErrors`, returned object IDs, and `extensions.cost`/throttle state.
- Log operation name, duration, request ID, cost, staff ID, and outcome—but not tokens or unnecessary PII.
- Use pagination and bounded page sizes.
- Prefer a local read projection for dashboards; query Shopify live for sensitive confirmation before writes.
- Follow Shopify's current [API limits guidance](https://shopify.dev/docs/api/usage/limits) and use throttle feedback rather than fixed aggressive polling.

## Mutation safety pattern

All writes should use the same command lifecycle:

1. **Authenticate** the staff session and enforce MFA/step-up requirements.
2. **Authorize** the exact business action and data scope.
3. **Validate** payload type, amount, quantity, reason, location, and identifiers.
4. **Load fresh state** from Shopify for the affected order/inventory level.
5. **Check preconditions** such as fulfillment support, remaining quantity, comparison quantity, financial status, and approval state.
6. **Create an idempotent local command** with a unique key and pending status.
7. **Execute one reviewed Shopify mutation** with the minimum fields.
8. **Inspect all errors**, including mutation `userErrors` returned with HTTP `200`.
9. **Confirm resulting state** from returned objects, async job status, a follow-up read, or webhook.
10. **Write an immutable audit event** containing actor, action, target IDs, reason, safe before/after summary, and result.
11. **Return a precise outcome** to the operator; never report success merely because the request was sent.

For timeouts or ambiguous network failures, query Shopify using the command's known references before attempting another mutation.

## Local data model

Store the minimum data required for performance, workflow, and accountability. A conceptual model is:

### `shops`

- internal ID;
- permanent Shopify domain;
- Shopify shop global ID when available;
- installed app/configuration state;
- selected API and webhook versions;
- environment;
- last successful sync timestamps.

Do not store the app client secret or active Shopify token in ordinary database columns if an approved secret/token store is available.

### `shopify_order_projection`

- Shopify order global ID;
- display name/order number;
- created/updated timestamps;
- financial, cancellation, and fulfillment summaries;
- currency and safe totals required for the list view;
- selected line-item summary;
- fulfillment-order summary;
- local projection version/source timestamp.

Store customer name, address, phone, or email only if required for the actual staff workflow. Prefer loading sensitive details on demand for the order-detail view and avoid indexing them in broad application search unless approved.

### `shopify_inventory_projection`

- inventory item global ID;
- product/variant global IDs;
- SKU/display title;
- location global ID;
- relevant quantity names and values;
- Shopify updated/read time;
- reconciliation status.

### `operations_order`

- internal ID;
- Shopify order global ID;
- EyEagle workflow status;
- assigned team/owner;
- appointment or installation references;
- timestamps and safe internal flags.

### `installation_job` or `service_job`

- internal ID;
- related operations order and Shopify line item;
- appointment window;
- assigned technician/provider;
- service status;
- proof/checklist references under an approved retention policy.

### `webhook_receipts`

- Shopify webhook/delivery ID;
- topic, shop, API version;
- received/processed timestamps;
- deduplication and processing status;
- encrypted or redacted failure information.

### `mutation_commands`

- unique command ID/idempotency key;
- actor and role;
- operation type;
- Shopify target IDs;
- reason and approval reference;
- safe request fingerprint;
- pending/succeeded/failed/ambiguous status;
- returned Shopify object/job IDs;
- timestamps.

### `audit_events`

- immutable event ID;
- timestamp;
- actor, authenticated session, and source;
- action and target;
- authorization decision;
- safe before/after summary;
- reason/approval reference;
- command and Shopify request IDs;
- result.

Audit records must be tamper-evident, access-controlled, and retained according to an approved policy. Do not put secrets or full payment/customer payloads into audit text.

## Protected customer data and privacy

Orders, customers, fulfillment information, names, addresses, phone numbers, and email addresses can fall under Shopify's protected customer data requirements. Review and implement the current [protected customer data guidance](https://shopify.dev/docs/apps/launch/protected-customer-data) before production access.

Minimum controls:

- document why each protected field is needed;
- request only required Shopify scopes and query fields;
- mask sensitive values in list views;
- restrict detail views by role;
- encrypt data in transit, at rest, and in backups;
- separate production and non-production systems;
- never copy production customer data to local developer machines or test fixtures;
- define retention and deletion schedules for local projections, logs, webhooks, exports, and backups;
- record and review administrative access;
- redact PII and secrets from error trackers, analytics, session replay, logs, and traces;
- create an incident-response and credential-rotation procedure;
- review any third-party monitoring, support, or analytics processor before it receives admin data;
- disable public indexing and public caching.

The admin web should send headers equivalent to:

```text
Cache-Control: private, no-store
X-Robots-Tag: noindex, nofollow, noarchive
```

Cloudflare must bypass cache for the admin host and authenticated APIs. Netlify image/CDN settings from the public site are not relevant to order data and must not be copied into this architecture.

## Operational user interface

### Dashboard

Show only actionable aggregates:

- new paid orders awaiting review;
- fulfillable orders;
- fulfillment exceptions/holds;
- low-stock threshold for the package at the designated location;
- failed Shopify commands or webhook processing;
- appointments/installations requiring attention.

Do not display customer PII on the dashboard.

### Order list

Support Shopify-aligned filters such as created date, financial status, fulfillment status, cancellation state, and order name. Use cursor pagination. Clearly show whether data is current, projected, or temporarily stale.

Replace vague actions such as “Process” with explicit text such as “View order”, “Create fulfillment”, or “Review refund request”.

### Order detail

Separate sections for:

- order summary and Shopify identifiers;
- payment/financial status;
- line items and quantities;
- fulfillment orders, locations, holds, and tracking;
- shipping/delivery details visible only to permitted roles;
- Shopify refund/cancellation history;
- EyEagle audit/installation workflow;
- immutable staff activity;
- a deep link to the corresponding Shopify Admin order for unsupported work.

Show a freshness timestamp and refresh from Shopify before presenting a destructive action.

### Inventory screen

For the initial one-package scope, show:

- product, variant, and SKU;
- designated location;
- available/on-hand quantities relevant to the workflow;
- last Shopify read time;
- recent adjustments and reasons;
- reconciliation status;
- an “Adjust inventory” action restricted to the inventory role.

The adjustment form should ask for a delta, reason, reference, and optional note. Display the calculated expected result, but confirm the actual result from Shopify.

### High-risk actions

Cancellation and refund screens must avoid one-click execution. Present:

- current order and payment state;
- exact amount and currency;
- line items and quantities;
- shipping/tax/duty/fee treatment where relevant;
- restock choice and location;
- customer notification choice;
- business reason;
- requester and approver;
- final explicit confirmation.

## Error handling and operator feedback

Classify failures so staff know what to do:

| Failure | UI behavior | System behavior |
| --- | --- | --- |
| Authentication/session expired | Ask staff to sign in again | Do not call Shopify |
| Local role denied | Explain permission requirement | Audit denial where appropriate |
| Validation failure | Highlight exact field | Do not create command |
| Shopify stale-state/user error | Refresh current state and show safe message | Mark command failed without blind retry |
| Shopify throttling | Show short retry state | Respect throttle status/backoff |
| Network timeout on read | Offer retry | Safe bounded retry |
| Network timeout on mutation | Show “outcome being verified” | Query Shopify/reference before retrying |
| Webhook lag | Show freshness warning | Reconcile in background |
| Credential/revocation failure | Disable writes and alert operations | Rotate/reinstall only through runbook |

Never surface raw GraphQL, stack traces, secrets, access tokens, or full protected payloads to the browser.

## Testing strategy

### Environment preparation

- Use a Shopify development store or an approved non-production store.
- Create synthetic customers, addresses, orders, variants, and tracking data.
- Use a separate test location and known starting inventory.
- Use separate app credentials, webhook endpoints, database, SSO configuration, and logs.
- Never reuse production customer data in staging.

### Required test scenarios

#### Authentication and authorization

- unauthenticated access is denied;
- expired sessions are denied;
- every role can access only its allowed reads and mutations;
- direct requests to hidden endpoints are denied;
- removed staff access is revoked promptly;
- high-risk actions require the expected reauthentication/approval.

#### Orders and pagination

- new, paid, unfulfilled, partially fulfilled, cancelled, and refunded orders;
- multiple line items and quantities;
- more than one fulfillment order;
- cursor pagination and filters;
- orders outside the permitted date window;
- missing/optional customer fields;
- live Shopify changes while an order page is open.

#### Inventory

- positive and negative delta adjustments;
- invalid reason or location;
- concurrent adjustment by Shopify Admin;
- duplicate submission using the same idempotency key;
- ambiguous timeout followed by result verification;
- comparison failure for any absolute-set workflow;
- low-stock and zero-stock display;
- reconciliation after a missed webhook.

#### Fulfillment

- full and partial fulfillment;
- unsupported action or held fulfillment order;
- incompatible locations;
- tracking creation/update;
- duplicate button submission;
- Shopify user errors returned with HTTP `200`;
- webhook confirmation and stale projection repair.

#### Cancellation and refunds

- cancellation with and without refund/restock/notification choices;
- partial and full refund preview;
- role and approval failures;
- asynchronous cancellation job success/failure;
- duplicate and ambiguous requests;
- currency and rounding behavior;
- attempts against an incompatible final state.

#### Webhooks

- correct and incorrect HMAC;
- duplicate webhook ID;
- out-of-order delivery;
- delayed delivery;
- queue/worker failure and recovery;
- version mismatch;
- redaction in logs;
- replay/reconciliation repairs.

#### Security

- CSRF, session fixation, and authorization bypass tests;
- secret scanning and dependency audit;
- attempts to inject arbitrary shop domains or GraphQL documents;
- cache header verification at application, host, and Cloudflare layers;
- search-engine access is blocked;
- protected values are absent from analytics, error messages, traces, and browser storage;
- rate limiting for login, search, export, and mutations.

## Rollout roadmap

### Phase 0 — Decisions and ownership

Deliverables:

- identify the admin-web codebase and technical owner;
- choose standalone versus embedded interface;
- name the SSO provider and staff groups;
- identify the Shopify store, app owner, product variant, and inventory location;
- approve Shopify as the initial inventory authority;
- approve data fields, retention, and role matrix;
- decide whether older-than-default orders are required;
- define monitoring and incident owners.

Exit criteria: the open-decision register is signed off and no credentials have been placed in source control.

### Phase 1 — Security foundation and Shopify app

Deliverables:

- SSO/MFA and application session handling;
- backend-only GraphQL client;
- app created in Dev Dashboard with read-only scopes;
- short-lived token acquisition and secret management;
- audit-event foundation;
- cache bypass, no-index, security headers, logging redaction;
- development/staging isolation.

Exit criteria: security review passes and a browser cannot retrieve Shopify credentials or arbitrary Admin API access.

### Phase 2 — Read-only orders and inventory

Deliverables:

- paginated orders list and order detail;
- current financial, cancellation, fulfillment-order, and tracking state;
- single-package inventory screen for the designated location;
- deep links to Shopify Admin;
- freshness indicators and explicit errors;
- role-restricted protected data.

Exit criteria: operations verifies that displayed state matches Shopify across the required test scenarios.

### Phase 3 — Webhook projection and reconciliation

Deliverables:

- HMAC-verified webhook receiver;
- durable idempotent processing;
- local minimal order/inventory projections;
- reconciliation schedule and repair logic;
- webhook failure and data-staleness alerts;
- retention/redaction controls.

Exit criteria: duplicate, missing, delayed, and out-of-order delivery tests pass without corrupting state.

### Phase 4 — Inventory adjustments

Deliverables:

- `write_inventory` enabled only after app version review;
- reasoned delta-adjustment workflow;
- idempotency and reference URI;
- concurrency handling;
- immutable audit and reconciliation;
- operational runbook for corrections.

Exit criteria: repeated/concurrent tests cannot silently overwrite stock or duplicate adjustments.

### Phase 5 — Fulfillment and tracking

Deliverables:

- fulfillment-order aware workflow;
- partial/full fulfillment support for actual business cases;
- tracking updates;
- validation of holds, supported actions, location assignment, and remaining quantity;
- command idempotency and audit records.

Exit criteria: fulfillment state and customer-facing Shopify status remain correct through success, retry, and failure cases.

### Phase 6 — Cancellation and refunds

Deliverables:

- approved financial policy and role limits;
- preview, reauthentication, and request/approval flow;
- async cancellation verification;
- partial/full refund test coverage;
- recovery and incident runbook.

Exit criteria: finance/operations approval, security review, and staging evidence show no duplicate or unauthorized action path.

### Phase 7 — EyEagle operations workflow

Deliverables:

- audit/installation/service status model;
- technician assignment and appointment workflow if required;
- explicit mapping between Shopify line items and local service jobs;
- customer communication ownership;
- operational analytics based on minimized data.

Exit criteria: commerce state and service state remain separate, explainable, and reconcilable.

## Monitoring and runbooks

Monitor:

- Shopify GraphQL errors and mutation `userErrors` by operation;
- access-token acquisition failures;
- API throttle/cost pressure;
- webhook invalid signatures, retry rate, age, queue depth, and dead letters;
- projection reconciliation differences;
- inventory adjustment volume and anomalies;
- failed/ambiguous fulfillment, refund, and cancellation commands;
- unauthorized access attempts and role denials;
- protected-data access and export activity;
- app-version/API-version deprecation dates.

Create runbooks for:

- rotating the Shopify client secret and admin session secrets;
- revoking/reinstalling the Shopify app;
- disabling all writes while preserving read-only access;
- investigating an ambiguous mutation;
- repairing missed webhooks;
- reconciling inventory differences;
- responding to suspected customer-data exposure;
- restoring from backups without restoring expired credentials;
- upgrading Shopify Admin and webhook API versions.

The fastest emergency control should disable mutation routes centrally. Do not rely on deploying a code change during an incident.

## Rollback and credential revocation

If a rollout fails:

1. Disable write features with a server-side feature flag.
2. Keep staff on read-only mode or direct them to Shopify Admin.
3. Stop affected workers without deleting queued evidence.
4. Reconcile Shopify state before retrying commands.
5. Revoke/rotate credentials if exposure is suspected.
6. Preserve audit and command records for investigation.
7. Correct local projection data from Shopify; do not reverse valid Shopify transactions by overwriting the database.
8. Re-enable one operation at a time after staging verification.

Uninstalling the Shopify app is a strong last-resort revocation action and will interrupt all integration functions. Document who has authority to do it.

## Definition of done

The admin integration is ready for production only when:

- the selected architecture, store, location, and source-of-truth decisions are documented;
- all Shopify calls are backend-only and use the GraphQL Admin API with an explicit supported version;
- the app has only the scopes needed for released features;
- staff use individual SSO/MFA accounts and backend-enforced roles;
- protected customer data is minimized, encrypted, excluded from public caches/analytics, and covered by retention policy;
- orders, fulfillment orders, and inventory match Shopify in representative test cases;
- webhook verification, deduplication, durable processing, and reconciliation pass failure tests;
- inventory writes are idempotent, reasoned, referenceable, concurrency-safe, and audited;
- fulfillment writes validate current fulfillment-order state and location;
- refunds/cancellations use explicit preview, restricted approval, and result verification;
- Shopify HTTP, GraphQL, mutation, timeout, and throttle failures are handled safely;
- logs and audit records contain no access tokens, secrets, or unnecessary PII;
- Cloudflare/host verification shows `private, no-store` and no public caching for admin data;
- automated tests and a security review pass;
- monitoring, incident, rotation, rollback, and API-version upgrade runbooks are owned;
- operations staff complete a staged acceptance exercise before write access is enabled in production.

## Open decisions for the EyEagle team

1. Which repository and framework will host the admin web?
2. Should the interface be standalone at a private domain or embedded in Shopify Admin?
3. Which identity provider will provide SSO and MFA?
4. Is Shopify confirmed as the inventory system of record?
5. Which Shopify location holds the Protection Kit inventory?
6. Will the product remain one variant, and how should SKU/package changes be handled?
7. Do staff need orders older than Shopify's default recent-order window?
8. Which staff roles can see address, phone, and email?
9. Who can adjust inventory, and which reasons/references are mandatory?
10. Who can request and approve cancellation or refund, and what amount limits apply?
11. Which standard operations will remain exclusively in Shopify Admin?
12. Where should safety-audit, appointment, technician, installation, and app-activation state live?
13. How long should local order projections, webhook receipts, audit events, and backups be retained?
14. Who owns credential rotation, reconciliation, security review, and production incident response?

## Recommended first implementation ticket set

1. **Architecture decision record:** standalone/embedded, repository, hosting, SSO, database, Shopify authority, selected location.
2. **Data protection review:** required Shopify fields, roles, retention, logging redaction, protected-customer-data requirements.
3. **Shopify app setup:** Dev Dashboard app, read-only scopes, version pinning, installation, secret storage.
4. **Server GraphQL client:** client-credentials token lifecycle, domain allowlist, errors, cost/throttle handling, safe logging.
5. **Staff access foundation:** SSO/MFA, sessions, RBAC, CSRF, audit events, no-store/no-index headers.
6. **Read-only order console:** queries, pagination, filters, detail, fulfillment orders, Shopify Admin deep link.
7. **Read-only inventory:** designated product/variant/location, quantity display, freshness and reconciliation.
8. **Webhook ingestion:** HMAC, deduplication, queue, projection updates, metrics, reconciliation.
9. **Inventory adjustment design:** reason codes, idempotency, concurrency, audit, approval, staging tests.
10. **Fulfillment design:** supported actions, location/quantity validation, tracking, partial fulfillment, retries.
11. **Refund/cancellation policy:** roles, two-person approval, previews, limits, async verification, runbooks.

## Official implementation references

Recheck these sources when implementation begins and whenever the pinned Shopify API version changes:

- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest)
- [Create apps using the Dev Dashboard](https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard)
- [Client credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/client-credentials-grant)
- [Shopify access scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Order object and queries](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order)
- [Order-management apps](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps)
- [Build fulfillment solutions](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/build-fulfillment-solutions)
- [Fulfillment API](https://shopify.dev/docs/api/admin-graphql/latest/objects/Fulfillment)
- [Order cancellation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderCancel)
- [Refund creation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/refundCreate)
- [Inventory adjustment](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventoryAdjustQuantities)
- [Inventory absolute-set mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventorySetQuantities)
- [Inventory-management apps](https://shopify.dev/docs/apps/build/orders-fulfillment/inventory-management-apps)
- [Webhook subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe)
- [Verify webhook deliveries](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries)
- [Enterprise order-management integration](https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps/enterprise-oms-integration)
- [Shopify API limits](https://shopify.dev/docs/api/usage/limits)

## Final recommendation

Proceed with a private, backend-mediated GraphQL Admin API integration, beginning in read-only mode. Keep Shopify authoritative for commerce and inventory, and store only EyEagle-specific operational state locally. Add inventory adjustment and fulfillment writes only after webhooks, reconciliation, staff authorization, idempotency, and auditability are proven. Keep cancellation and refund actions in Shopify Admin until the admin web's approval and recovery controls are demonstrably safer and faster for EyEagle's daily workflow.
