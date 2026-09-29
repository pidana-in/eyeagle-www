// One-time Shopify setup: turn each /store configurator variant into a fixed bundle of stock-tracked parts,
// and set its pre-GST price. Parts are looked up by SKU (EYEAGLE_BUNDLE_COMPONENTS).
//
// Dry run (default) prints the plan and checks the parts; --apply writes to Shopify.
//   SHOPIFY_STORE_DOMAIN=<store>.myshopify.com SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_... \
//     node scripts/shopify-setup-bundles.mjs [--apply]
import {
  EYEAGLE_BUNDLE_COMPONENTS,
  EYEAGLE_VARIANT_IDS,
  formatInr,
  getEyEagleBundleComponents,
  getEyEagleConfiguredPurchase,
} from "../src/data/shopify-configurator.ts";

const {
  SHOPIFY_STORE_DOMAIN: domain,
  SHOPIFY_ADMIN_ACCESS_TOKEN: token,
  SHOPIFY_API_VERSION: apiVersion = "2026-07",
} = process.env;
const apply = process.argv.includes("--apply");

if (!domain || !token) {
  console.error("Set SHOPIFY_STORE_DOMAIN (*.myshopify.com) and SHOPIFY_ADMIN_ACCESS_TOKEN.");
  process.exit(1);
}

const gql = async (query, variables = {}) => {
  const response = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.errors) {
    throw new Error(`Shopify API ${response.status}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.data;
};

const assertNoUserErrors = (label, userErrors) => {
  if (userErrors?.length) throw new Error(`${label}: ${JSON.stringify(userErrors, null, 2)}`);
};

const variantGid = (id) => `gid://shopify/ProductVariant/${id}`;

// 1. Resolve the parts and make sure the stock-tracked ones can't oversell.
const parts = {};
const problems = [];
for (const [key, part] of Object.entries(EYEAGLE_BUNDLE_COMPONENTS)) {
  const data = await gql(
    `query ($query: String!) {
      productVariants(first: 5, query: $query) {
        nodes { id sku inventoryPolicy inventoryQuantity inventoryItem { tracked } product { title status } }
      }
    }`,
    { query: `sku:${part.sku}` },
  );
  const matches = data.productVariants.nodes.filter((node) => node.sku === part.sku);
  if (matches.length !== 1) {
    problems.push(`${part.title}: expected exactly one variant with SKU ${part.sku}, found ${matches.length}.`);
    continue;
  }
  const [variant] = matches;
  if (part.stockTracked && (!variant.inventoryItem.tracked || variant.inventoryPolicy !== "DENY")) {
    problems.push(`${part.title} (${part.sku}): turn on "Track quantity" and turn off "Continue selling when out of stock".`);
  }
  parts[key] = variant;
  const stock = part.stockTracked ? `${variant.inventoryQuantity} in stock` : "not stock-tracked";
  console.log(`Part  ${part.sku.padEnd(9)} ${variant.product.title} [${variant.product.status}] – ${stock}`);
}
if (problems.length) {
  console.error(`\nFix these parts in Shopify first:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

// 2. Plan each configurator variant: price and part quantities.
const plan = [];
for (const [key, id] of Object.entries(EYEAGLE_VARIANT_IDS)) {
  const [bathrooms, additionalSos] = key.split(":").map(Number);
  const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos);
  const data = await gql(
    `query ($id: ID!) {
      productVariant(id: $id) {
        id title price
        product { id title }
        productVariantComponents(first: 30) { nodes { productVariant { id } } }
      }
    }`,
    { id: variantGid(id) },
  );
  const variant = data.productVariant;
  if (!variant) throw new Error(`Variant ${id} (${key}) not found in ${domain}.`);
  plan.push({ key, variant, totalInr: purchase.totalInr, components: getEyEagleBundleComponents(bathrooms, additionalSos) });
}

console.log(`\nProduct: ${plan[0].variant.product.title}\n`);
console.log("Variant                          Price now → new     CU  AU  Kit Support");
for (const { variant, totalInr, components } of plan) {
  const counts = [components.controlUnit, components.sosUnit, components.protectionKit, components.supportPlan]
    .map((count) => String(count).padEnd(3))
    .join(" ");
  console.log(`${variant.title.padEnd(32)} ${formatInr(Number(variant.price)).padStart(9)} → ${formatInr(totalInr).padEnd(9)} ${counts}`);
}

const stockOf = (key) => parts[key].inventoryQuantity;
const baseHomes = Math.min(stockOf("controlUnit"), stockOf("sosUnit"), stockOf("protectionKit"));
console.log(`\nCurrent stock covers up to ${baseHomes} single-bathroom homes; each extra bathroom or SOS button uses more AUs (and kits).`);

if (!apply) {
  console.log("\nDry run only. Re-run with --apply to write these bundles and prices to Shopify.");
  process.exit(0);
}

// 3. Replace any existing components, then attach the planned parts.
const withComponents = plan.filter(({ variant }) => variant.productVariantComponents.nodes.length > 0);
const relationshipMutation = `mutation ($input: [ProductVariantRelationshipUpdateInput!]!) {
  productVariantRelationshipBulkUpdate(input: $input) { userErrors { code field message } }
}`;
if (withComponents.length) {
  const cleared = await gql(relationshipMutation, {
    input: withComponents.map(({ variant }) => ({ parentProductVariantId: variant.id, removeAllProductVariantRelationships: true })),
  });
  assertNoUserErrors("Clearing existing components", cleared.productVariantRelationshipBulkUpdate.userErrors);
}
const created = await gql(relationshipMutation, {
  input: plan.map(({ variant, components }) => ({
    parentProductVariantId: variant.id,
    productVariantRelationshipsToCreate: Object.entries(components).map(([part, quantity]) => ({
      id: parts[part].id,
      quantity,
    })),
  })),
});
assertNoUserErrors("Creating bundle components", created.productVariantRelationshipBulkUpdate.userErrors);

// 4. Set pre-GST prices (GST is added at checkout) after the components, so they aren't recalculated.
const byProduct = Map.groupBy(plan, ({ variant }) => variant.product.id);
for (const [productId, variants] of byProduct) {
  const priced = await gql(
    `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } }
    }`,
    { productId, variants: variants.map(({ variant, totalInr }) => ({ id: variant.id, price: totalInr.toFixed(2), taxable: true })) },
  );
  assertNoUserErrors("Updating prices", priced.productVariantsBulkUpdate.userErrors);
}

console.log(`\nDone: ${plan.length} variants are now bundles with pre-GST prices. Place a test order to confirm stock and tax.`);
