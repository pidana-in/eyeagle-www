import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Comet.app/Contents/MacOS/Comet'});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:4322/previews/how-it-works/index.html');
await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
const images=page.locator('[data-export]');
for(let i=0;i<await images.count();i++){const el=images.nth(i);const name=await el.getAttribute('data-export');await el.screenshot({path:`/Users/rehan/Documents/ChatGPT/EyEagle Brand/eyeagle-www/outputs/how-it-works-annotations/${String(i+1).padStart(2,'0')}-${name}.png`});}
await page.locator('.dot').first().click();
console.log('Desktop panel visible:',await page.locator('.detail').first().isVisible());
await page.locator('.close').first().click();
await page.setViewportSize({width:390,height:844});
await page.locator('.dot').first().click();
console.log('Mobile panel visible:',await page.locator('.detail').first().isVisible());
console.log('Mobile overflow:',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
await page.screenshot({path:'/Users/rehan/Documents/ChatGPT/EyEagle Brand/eyeagle-www/outputs/how-it-works-annotations/mobile-check.png'});
await browser.close();
