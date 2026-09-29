// Generates the per-page social preview (Open Graph) images in public/og/ at 1200 x 630.
// Each card is an HTML page with the site's fonts and logo, captured with headless Chrome.
//   node scripts/generate-og-images.mjs            (all cards)
//   node scripts/generate-og-images.mjs store app  (only these)
// Set CHROME_PATH if Chrome isn't at the default macOS location. Re-run after changing a page's
// headline or hero image, and commit the JPEGs.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const fileUrl = (path) => pathToFileURL(join(root, path)).href;

// `position` is the CSS object-position for the photo in the right-hand panel.
const cards = {
  default: {
    eyebrow: "Home safety system",
    headline: "You can’t always be there. EyEagle can.",
    text: "A connected safety and response system for parents living independently.",
    image: "public/figma-home/hero-home-opt.webp",
    position: "72% 50%",
  },
  store: {
    eyebrow: "Buy EyEagle",
    headline: "Complete home safety system.",
    text: "Alert Unit, Home Hub with Alarm, bathroom protection and three years of response. Installed in India.",
    image: "src/assets/Store/guardian-kit-v2.png",
    position: "68% 50%",
  },
  membership: {
    eyebrow: "Membership",
    headline: "You may be far away. Help doesn’t have to be.",
    text: "A 24/7 response system around your parents, connecting the people they trust.",
    image: "src/assets/MembershipFigma/hero.png",
    position: "40% 50%",
  },
  app: {
    eyebrow: "Nest app",
    headline: "Your family, connected when it matters.",
    text: "SOS alerts, who is responding and essential information, shared with the people they trust.",
    image: "src/assets/AppFigma/hero-phones.png",
    position: "50% 50%",
  },
  "our-story": {
    eyebrow: "Our Story",
    headline: "Built from something personal.",
    text: "The story, beliefs and people behind EyEagle.",
    image: "src/assets/OurStory/about-hero-independence-v1-4k.png",
    position: "56% 50%",
  },
  protection: {
    eyebrow: "Bathroom protection",
    headline: "Safer support in the bathroom, every day.",
    text: "Grab bars, anti-slip mats and floor grip, planned and installed for older adults.",
    image: "src/assets/Protection/MainImage.png",
    position: "62% 50%",
  },
  blog: {
    eyebrow: "EyEagle Journal",
    headline: "Safer living and family care.",
    text: "Practical guidance for safer homes, healthy ageing and caring for parents from afar.",
    image: "public/figma-home/response-awareness-distance-opt.webp",
    position: "60% 50%",
  },
  contact: {
    eyebrow: "Contact",
    headline: "Need help protecting someone at home?",
    text: "Talk to our team about the home, your questions and the safest next steps.",
    image: "src/assets/Contactus/contact1.png",
    position: "45% 50%",
  },
};

const html = ({ eyebrow, headline, text, image, position }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: "Faculty Glyphic"; src: url("${fileUrl("public/fonts/faculty-glyphic-latin.woff2")}") format("woff2"); }
@font-face { font-family: "Geist"; src: url("${fileUrl("public/fonts/geist-latin.woff2")}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { display: grid; grid-template-columns: 560px 640px; background: #f6f4f0; color: #151515; font-family: "Geist", sans-serif; }
.panel { display: flex; flex-direction: column; padding: 56px 56px 52px 64px; border-right: 6px solid #dc1f2e; }
.logo { display: flex; align-items: center; gap: 12px; }
.logo .shield { height: 44px; }
.logo .name { height: 26px; }
.copy { margin: auto 0; }
.eyebrow { color: #dc1f2e; font-size: 22px; font-weight: 500; letter-spacing: .01em; }
h1 { margin-top: 16px; font-family: "Faculty Glyphic", serif; font-size: 56px; font-weight: 400; line-height: 1.06; letter-spacing: -.02em; text-wrap: balance; }
p { margin-top: 20px; color: #5f5c57; font-size: 23px; line-height: 1.4; text-wrap: pretty; }
.domain { color: #8b8882; font-size: 20px; font-weight: 500; }
.photo { width: 640px; height: 630px; object-fit: cover; object-position: ${position}; }
</style></head><body>
<div class="panel">
  <div class="logo"><img class="shield" src="${fileUrl("public/brand/eyeagle-shield-dark.svg")}"><img class="name" src="${fileUrl("public/brand/eyeagle-wordmark-dark.svg")}"></div>
  <div class="copy"><div class="eyebrow">${eyebrow}</div><h1>${headline}</h1><p>${text}</p></div>
  <div class="domain">eyeagle.ai</div>
</div>
<img class="photo" src="${fileUrl(image)}">
</body></html>`;

const only = process.argv.slice(2);
const work = mkdtempSync(join(tmpdir(), "eyeagle-og-"));
try {
  for (const [name, card] of Object.entries(cards)) {
    if (only.length && !only.includes(name)) continue;
    const page = join(work, `${name}.html`);
    const shot = join(work, `${name}.png`);
    writeFileSync(page, html(card));
    execFileSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--allow-file-access-from-files",
      "--virtual-time-budget=3000",
      "--window-size=1200,630",
      `--screenshot=${shot}`,
      pathToFileURL(page).href,
    ], { stdio: "ignore" });
    const out = join(root, "public/og", `${name}.jpg`);
    await sharp(shot).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
    console.log(`public/og/${name}.jpg`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
