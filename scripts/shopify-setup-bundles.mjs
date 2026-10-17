// Shopify setup: turn each /store configurator variant into a fixed bundle of stock-tracked parts, and set
// its pre-GST price. Parts are looked up by SKU (EYEAGLE_BUNDLE_COMPONENTS).
//
// Variants are found on the product by their option values: the bathroom and extra-SOS values are learned
// from the saved IDs in EYEAGLE_VARIANT_IDS, even if their current membership mapping is stale. The actual
// plan comes from Shopify's "Plan" option whose values
// are MEMBERSHIP_OPTION_VALUES below. The run prints the full EYEAGLE_VARIANT_IDS map to paste into
// src/data/shopify-configurator.ts.
//
// Dry run (default) prints the plan and checks the parts; --apply writes to Shopify.
//   Fill in the Shopify values in an untracked .env file, then run:
//     node --env-file=.env scripts/shopify-setup-bundles.mjs [--apply]
import {
  EYEAGLE_BUNDLE_COMPONENTS,
  EYEAGLE_MEMBERSHIP_PLANS,
  EYEAGLE_VARIANT_IDS,
  formatInr,
  getEyEagleBundleComponents,
  getEyEagleConfiguredPurchase,
} from "../src/data/shopify-configurator.ts";

const {
  SHOPIFY_STORE_DOMAIN: domain,
  SHOPIFY_EXPECTED_PRODUCT_HANDLE: expectedProductHandle,
  SHOPIFY_ADMIN_ACCESS_TOKEN: token,
  SHOPIFY_API_VERSION: apiVersion = "2026-07",
} = process.env;
const apply = process.argv.includes("--apply");

// The "Membership" option's value for each plan (months), exactly as entered in Shopify.
const MEMBERSHIP_OPTION = "Plan";
const MEMBERSHIP_OPTION_VALUES = { 36: "3 Year", 12: "1 Year", 0: "Monthly" };

if (!domain || !expectedProductHandle || !token) {
  console.error("Set SHOPIFY_STORE_DOMAIN (*.myshopify.com), SHOPIFY_EXPECTED_PRODUCT_HANDLE and SHOPIFY_ADMIN_ACCESS_TOKEN.");
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

// 2. Find every configurator variant on the product by its option values.
const variantNumber = (gid) => gid.split("/").pop();
const anchorKey = Object.keys(EYEAGLE_VARIANT_IDS)[0];
const productData = await gql(
  `query ($id: ID!) {
    productVariant(id: $id) {
      product {
        id title handle
        variants(first: 250) { nodes { id title selectedOptions { name value } } }
      }
    }
  }`,
  { id: variantGid(EYEAGLE_VARIANT_IDS[anchorKey]) },
);
const product = productData.productVariant?.product;
if (!product) throw new Error(`Variant ${EYEAGLE_VARIANT_IDS[anchorKey]} (${anchorKey}) not found in ${domain}.`);
if (product.handle !== expectedProductHandle) {
  throw new Error(`The saved variant IDs belong to ${product.handle}, not ${expectedProductHandle}. Check the target Shopify product and update the variant IDs before applying changes.`);
}

const monthsByValue = Object.fromEntries(Object.entries(MEMBERSHIP_OPTION_VALUES).map(([months, value]) => [value, Number(months)]));
const membershipOf = (variant) => variant.selectedOptions.find((option) => option.name === MEMBERSHIP_OPTION)?.value;
// Bathrooms and extra SOS, as one string of the variant's other option values.
const layoutOf = (variant) => JSON.stringify(variant.selectedOptions.filter((option) => option.name !== MEMBERSHIP_OPTION));

const layouts = new Map(); // layout string → "bathrooms:extraSos"
for (const [key, id] of Object.entries(EYEAGLE_VARIANT_IDS)) {
  const variant = product.variants.nodes.find((node) => variantNumber(node.id) === id);
  if (!variant) {
    problems.push(`EYEAGLE_VARIANT_IDS["${key}"] = ${id} is not a variant of ${product.title}.`);
    continue;
  }
  const months = Number(key.split(":")[2]);
  if (membershipOf(variant) !== MEMBERSHIP_OPTION_VALUES[months]) {
    console.warn(`Saved ID ${id} is mapped as ${key}, but Shopify calls it "${membershipOf(variant) ?? "no Membership option"}". The generated map will use Shopify's actual option value.`);
  }
  const layout = layoutOf(variant);
  const layoutKey = key.split(":").slice(0, 2).join(":");
  if (layouts.has(layout) && layouts.get(layout) !== layoutKey) {
    problems.push(`Saved ID ${id} has the same bathroom/Alert Unit options as another layout, but is mapped as ${layoutKey}.`);
  }
  layouts.set(layout, layoutKey);
}

const found = new Map(); // "bathrooms:extraSos:months" → variant
for (const variant of product.variants.nodes) {
  const layout = layouts.get(layoutOf(variant));
  const months = monthsByValue[membershipOf(variant)];
  if (layout === undefined || months === undefined) {
    problems.push(`Can't place ${variant.title}: unknown option values ${JSON.stringify(variant.selectedOptions)}.`);
    continue;
  }
  const key = `${layout}:${months}`;
  if (found.has(key)) problems.push(`Duplicate variant for ${key}: ${found.get(key).title} and ${variant.title}.`);
  found.set(key, variant);
}
for (const layout of new Set(layouts.values())) {
  for (const months of Object.keys(EYEAGLE_MEMBERSHIP_PLANS)) {
    if (!found.has(`${layout}:${months}`)) problems.push(`Missing variant for ${layout} with ${MEMBERSHIP_OPTION} = "${MEMBERSHIP_OPTION_VALUES[months]}".`);
  }
}
if (problems.length) {
  console.error(`\nFix these variants in Shopify first:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

const sortedKeys = [...found.keys()].sort((a, b) => {
  const [x, y] = [a, b].map((key) => key.split(":").map(Number));
  return x[0] - y[0] || x[1] - y[1] || y[2] - x[2];
});
console.log("\nEYEAGLE_VARIANT_IDS for src/data/shopify-configurator.ts:\n");
for (const key of sortedKeys) console.log(`  "${key}": "${variantNumber(found.get(key).id)}",`);

// 3. Plan each configurator variant: price and part quantities.
const plan = [];
for (const key of sortedKeys) {
  const [bathrooms, additionalSos, months] = key.split(":").map(Number);
  const purchase = getEyEagleConfiguredPurchase(bathrooms, additionalSos, months);
  const data = await gql(
    `query ($id: ID!) {
      productVariant(id: $id) {
        id title price
        product { id title }
        productVariantComponents(first: 30) { nodes { productVariant { id } } }
      }
    }`,
    { id: found.get(key).id },
  );
  plan.push({ key, variant: data.productVariant, totalInr: purchase.totalInr, components: getEyEagleBundleComponents(bathrooms, additionalSos, months) });
}

console.log(`\nProduct: ${plan[0].variant.product.title}\n`);
console.log("Variant                                     Price now → new      CU  AU  Kit Sup3 Sup1");
for (const { variant, totalInr, components } of plan) {
  const counts = [components.controlUnit, components.sosUnit, components.protectionKit, components.supportPlan3, components.supportPlan1]
    .map((count) => String(count).padEnd(3))
    .join(" ");
  console.log(`${variant.title.padEnd(43)} ${formatInr(Number(variant.price)).padStart(10)} → ${formatInr(totalInr).padEnd(10)} ${counts}`);
}

const stockOf = (key) => parts[key].inventoryQuantity;
const baseHomes = Math.min(stockOf("controlUnit"), stockOf("sosUnit"), stockOf("protectionKit"));
console.log(`\nCurrent stock covers up to ${baseHomes} single-bathroom homes. Each extra bathroom uses another CU, AU and kit; each extra SOS uses one AU.`);

if (!apply) {
  console.log("\nDry run only. Re-run with --apply to write these bundles and prices to Shopify.");
  process.exit(0);
}

// 4. Replace any existing components, then attach the planned parts.
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
    productVariantRelationshipsToCreate: Object.entries(components)
      .filter(([, quantity]) => quantity > 0)
      .map(([part, quantity]) => ({ id: parts[part].id, quantity })),
  })),
});
assertNoUserErrors("Creating bundle components", created.productVariantRelationshipBulkUpdate.userErrors);

// 5. Set pre-GST prices (GST is added at checkout) after the components, so they aren't recalculated.
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
