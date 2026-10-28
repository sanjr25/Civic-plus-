import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/sanjayr/.gemini/antigravity-ide/brain/1270cc0f-dad1-4eb9-8853-0499e99f0ffa/screenshots';
const PUBLIC_DIR = path.resolve(process.cwd(), 'public/screenshots');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // 1. Hero / above the fold
  const heroPath = path.join(PUBLIC_DIR, '01_prosperum_home_hero.png');
  await page.screenshot({ path: heroPath });
  fs.copyFileSync(heroPath, path.join(ARTIFACT_DIR, '01_prosperum_home_hero.png'));
  console.log('Saved 01_prosperum_home_hero.png');

  // 2. Full home page
  const fullPath = path.join(PUBLIC_DIR, '01_prosperum_home_full.png');
  await page.screenshot({ path: fullPath, fullPage: true });
  fs.copyFileSync(fullPath, path.join(ARTIFACT_DIR, '01_prosperum_home_full.png'));
  console.log('Saved 01_prosperum_home_full.png');

  // 3. Open Stack Options dropdown
  const stackBtn = page.locator('button:has-text("Stack Options")');
  if (await stackBtn.count() > 0) {
    await stackBtn.first().click();
    await page.waitForTimeout(600);
    const stackPath = path.join(PUBLIC_DIR, '02_prosperum_stack_options_open.png');
    await page.screenshot({ path: stackPath });
    fs.copyFileSync(stackPath, path.join(ARTIFACT_DIR, '02_prosperum_stack_options_open.png'));
    console.log('Saved 02_prosperum_stack_options_open.png');
  } else {
    console.warn('Could not locate "Stack Options" button');
  }

  // 4. Footer close-up
  const footerEl = page.locator('footer');
  if (await footerEl.count() > 0) {
    const footerPath = path.join(PUBLIC_DIR, '03_prosperum_footer.png');
    await footerEl.screenshot({ path: footerPath });
    fs.copyFileSync(footerPath, path.join(ARTIFACT_DIR, '03_prosperum_footer.png'));
    console.log('Saved 03_prosperum_footer.png');
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Failed to capture screenshots:', err);
  process.exit(1);
});
