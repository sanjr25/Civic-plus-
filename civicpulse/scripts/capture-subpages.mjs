import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/sanjayr/.gemini/antigravity-ide/brain/1270cc0f-dad1-4eb9-8853-0499e99f0ffa/screenshots';
const PUBLIC_DIR = path.resolve(process.cwd(), 'public/screenshots');

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

  // 1. Dashboard
  console.log('Capturing dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const dashPath = path.join(PUBLIC_DIR, '05_citizen_dashboard.png');
  await page.screenshot({ path: dashPath });
  fs.copyFileSync(dashPath, path.join(ARTIFACT_DIR, '05_citizen_dashboard.png'));

  // 2. FAQ
  console.log('Capturing FAQ...');
  await page.goto('http://localhost:3000/faq', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const faqPath = path.join(PUBLIC_DIR, '07_faq_page.png');
  await page.screenshot({ path: faqPath });
  fs.copyFileSync(faqPath, path.join(ARTIFACT_DIR, '07_faq_page.png'));

  await browser.close();
  console.log('Dashboard and FAQ screenshots captured!');
}

run().catch(console.error);
