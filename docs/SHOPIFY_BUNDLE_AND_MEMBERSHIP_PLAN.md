# EyEagle Shopify cart and inventory setup

Integration status, 17 October 2026. Ordering remains closed on the published site. No Shopify Admin changes were made by this code change.

## Cart composition

The site now uses five existing Shopify listings instead of the old 45-combination product. It sends one multi-item Shopify cart permalink with the selected quantities:

| Selection | Shopify listing | Quantity | Price before GST |
| --- | --- | ---: | ---: |
| Every order | [EyEagle Safety System](https://shop.eyeagle.ai/products/complete-home-safety-response-system) | 1 | ₹39,999 |
| Each bathroom after the first | [Additional Bathroom](https://shop.eyeagle.ai/products/additional-bathroom) | Bathrooms − 1 | ₹19,999 each |
| Extra SOS | [Alarm Unit with SOS](https://shop.eyeagle.ai/products/eyeagle-alarm-unit-with-sos-button) | Number selected | ₹8,999 each |
| 1 year paid ahead | [1 Year Plan](https://shop.eyeagle.ai/products/1-year-plan) | 1, if chosen | ₹15,000 |
| 3 years paid ahead | [3 Year Plan](https://shop.eyeagle.ai/products/3-year-plan) | 1, if chosen | ₹40,000 |
| Pay monthly | No additional Shopify product | 0 | ₹2,000/month + GST, billed separately |

Example: 2 bathrooms, 3 extra SOS units, and 1 year paid ahead sends four cart lines: EyEagle Safety System ×1, Additional Bathroom ×1, Alarm Unit ×3, and 1 Year Plan ×1. The upfront total is ₹101,995 before GST. Shopify supports multiple variant IDs and quantities in one cart permalink: https://help.shopify.com/en/manual/checkout-settings/cart-permalink

The site checks each selected product's public Shopify price, variant ID, and basic availability immediately before redirecting. The 45 old variant IDs remain in code solely for reference; checkout no longer uses them. The old bundle-writing script rejects `--apply` so it cannot overwrite this setup.

## Required Shopify Admin setup

1. In **Products**, review both fixed bundles. The live checkout shows **EyEagle Safety System** as 1 Control Unit + 1 Alarm Unit + 1 Bathroom Protection item. **Additional Bathroom** shows 1 Control Unit + 1 Alarm Unit + 1 each of Anti Slip Mat, Anti Slip Tape, Grab Bar, and Hand Rails. These are not the same bathroom-protection component structure. The additional bathroom still consumes a full second device set, but the base Bathroom Protection item's internal parts are not individually visible in the bundle checkout. Shopify Bundles does not support a bundle inside another bundle; reconcile the base Bathroom Protection item's underlying parts through a separate assembly/inventory process or redesign that bundle as direct parts.
2. Open the standalone Alarm Unit product. Confirm it is the **same tracked variant** used in both bundles, has real inventory at the selling/fulfilling location, and **Continue selling when out of stock** is off. The site adds this one product for each extra SOS selection. Do not create separate stock for “extra SOS” unless it represents a different physical device.
3. Confirm Control Unit, the base Bathroom Protection item, and the four direct bathroom parts track actual quantities with overselling disabled. Shopify derives fixed-bundle availability from tracked component inventory, but the public product endpoint does not reveal exact stock or prove that the base protection item's inner parts are deducted. Verify the relationships in each bundle's **Bundled products** block in Admin and with a controlled stock test. Shopify's bundle inventory rules: https://help.shopify.com/en/manual/products/bundles/eligibility-and-considerations
4. For bathroom parts that vary after assessment, decide whether to stock an **assembled standard kit** and reconcile substitutions manually, or to change the bundle when the exact parts are known. A bundle cannot contain another bundle. The current website cannot reserve an unknown combination of grab bars, hand rails, anti-slip mats, and anti-skid tape before that assessment. Maintain a manual pick list or a separate inventory workflow for those parts until a custom-kit flow is built.
5. Review the two paid-ahead plan products as services: make sure they should not require physical shipping, set their tax treatment correctly, and define how fulfillment/activation is recorded. They currently return `requires_shipping: true` in Shopify's public product data. A paid-ahead plan in this cart is a separate product, not a subscription contract. The monthly option adds no plan product and needs a separate, tested recurring-payment process before launch.
6. Check Shopify's final GST and shipping amounts against the site's 18% GST estimate. Shopify is the authority at checkout. Keep `config/store.json` `orderingOpen: false` until the bundle contents, inventory behavior, plan fulfillment, tax, and monthly billing have been checked.

## Inventory and availability test

Use a test location or controlled stock numbers in Shopify Admin, then check these three carts without completing a payment:

- 1 bathroom, 0 extra SOS: consumes 1 Control Unit, 1 Alarm Unit, and 1 Bathroom Protection item.
- 2 bathrooms, 1 extra SOS: consumes 2 Control Units, 3 Alarm Units, 1 Bathroom Protection item, and 1 set of four direct bathroom parts.
- 3 bathrooms, 4 extra SOS: consumes 3 Control Units, 7 Alarm Units, 1 Bathroom Protection item, and 2 sets of four direct bathroom parts.

Set Alarm Unit stock below the total needed for a selected cart and confirm Shopify prevents that checkout. The site's public precheck sees only the `available` flag, not exact inventory quantities, so it cannot currently disable a selection such as 4 extra SOS when only 2 are left. Shopify must enforce the aggregate quantity at cart/checkout, or the site needs a separate stock-aware API before claiming that unavailable choices are disabled.

The membership plan chosen, bathroom count, and extra SOS count are also put in Shopify order attributes. The monthly plan attribute is only a record of intent; it does not collect ₹2,000/month.

Shopify displays cart-permalink lines in reverse of the URL order in the tested checkout. The site therefore sends the plan first and the base bundle last in the URL so **EyEagle Safety System appears first** in checkout. Shopify controls the bundle-component disclosure in checkout; the website cannot style or remove that native control.

## Local verification completed

The site-side calculation and a live Shopify cart audit passed all 45 supported combinations: variant IDs, quantities, order, subtotal, and order attributes matched. The basic, middle, and largest configurations were also inspected in Shopify checkout; line items and settled 18% estimated GST matched the site. These checks did not complete payment or prove that the Bathroom Protection item's inner parts deduct shared inventory correctly.
