// Builds the /store membership image: the hospital response photo with the app's SOS screen as a
// phone in the bottom-right corner.
//
//   node scripts/compose-store-membership-image.mjs
//
// The phone is redrawn around the screen only. The source shows three overlapping phones, so cutting
// out the centre phone's frame would carry slivers of the other two.
import sharp from "sharp";

const BACKGROUND = "src/assets/MembershipFigma/response-hospital.png";
const PHONES = "src/assets/AppFigma/hero-phones.png";
const OUTPUT = "src/assets/Store/membership-app-hospital-v1.png";

// The centre phone's screen in PHONES ("Laxmi Needs Help!"), in source pixels.
const SCREEN = { left: 917, top: 313, width: 566, height: 1235 };
const SCREEN_RADIUS = 74; // source pixels

// Placement on the 1254 × 1254 background. Kept between 43% and 88% of the height so the 4:3 crop
// on phones (object-position 50% 62%) never cuts it.
const PHONE_WIDTH = 268;
const BEZEL = 10;
const MARGIN_RIGHT = 60;
const TOP = 540;

const background = sharp(BACKGROUND);
const { width: canvas } = await background.metadata();

const scale = (PHONE_WIDTH - 2 * BEZEL) / SCREEN.width;
const screenWidth = Math.round(SCREEN.width * scale);
const screenHeight = Math.round(SCREEN.height * scale);
const screenRadius = Math.round(SCREEN_RADIUS * scale);
const phoneHeight = screenHeight + 2 * BEZEL;
const left = canvas - MARGIN_RIGHT - PHONE_WIDTH;

const roundedRect = (width, height, radius, fill) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="${fill}"/></svg>`);

const screen = await sharp(PHONES)
  .extract(SCREEN)
  .resize(screenWidth, screenHeight)
  .composite([{ input: roundedRect(screenWidth, screenHeight, screenRadius, "#fff"), blend: "dest-in" }])
  .png()
  .toBuffer();

// A soft shadow under the phone so it sits on the photo rather than floating on it.
const shadowPad = 60;
const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PHONE_WIDTH + 2 * shadowPad}" height="${phoneHeight + 2 * shadowPad}">
  <defs><filter id="blur"><feGaussianBlur stdDeviation="22"/></filter></defs>
  <rect x="${shadowPad}" y="${shadowPad + 18}" width="${PHONE_WIDTH}" height="${phoneHeight}" rx="${screenRadius + BEZEL}" fill="rgba(0,0,0,0.45)" filter="url(#blur)"/>
</svg>`);

// The frame: a near-black body with a faint lighter edge, as on the source phones.
const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PHONE_WIDTH}" height="${phoneHeight}">
  <rect width="${PHONE_WIDTH}" height="${phoneHeight}" rx="${screenRadius + BEZEL}" fill="#141414"/>
  <rect x="1" y="1" width="${PHONE_WIDTH - 2}" height="${phoneHeight - 2}" rx="${screenRadius + BEZEL - 1}" fill="none" stroke="#3a3a3a" stroke-width="2"/>
</svg>`);

await background
  .composite([
    { input: shadow, left: left - shadowPad, top: TOP - shadowPad },
    { input: frame, left, top: TOP },
    { input: screen, left: left + BEZEL, top: TOP + BEZEL },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT);

console.log(`Wrote ${OUTPUT}: phone ${PHONE_WIDTH}×${phoneHeight} at (${left}, ${TOP}).`);
