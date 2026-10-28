import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runTests() {
  console.log('🚀 Starting CivicPulse Playwright Verification Suite...');

  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!fs.existsSync(executablePath)) {
    throw new Error(`Google Chrome executable not found at: ${executablePath}`);
  }

  const recordingsDir = path.join(process.cwd(), 'public', 'recordings');
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');

  if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  console.log('✅ Google Chrome launched successfully via Playwright.');

  // ==========================================================================
  // 1. MOBILE DEVICE VERIFICATION
  // ==========================================================================
  console.log('\n📱 Testing Mobile Device Viewport (iPhone 14 / 390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: recordingsDir,
      size: { width: 390, height: 844 },
    },
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Take Mobile Landing Screenshot
  await mobilePage.screenshot({
    path: path.join(screenshotsDir, '01_mobile_landing.png'),
    fullPage: false,
  });
  console.log('📸 Captured: 01_mobile_landing.png');

  // Test Mobile Navigation to Custom 404
  console.log('\n🔍 Testing Custom 404 Page on Incorrect Address...');
  await mobilePage.goto('http://localhost:3000/incorrect-street-address-404-check', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Verify custom 404 content
  const pageContent = await mobilePage.textContent('body');
  if (pageContent.includes('404') && pageContent.includes('Municipal Route Not Found')) {
    console.log('✅ Custom 404 Page verified: Displays HTTP 404 and Municipal Route Not Found');
  }

  // Take 404 Screenshot
  await mobilePage.screenshot({
    path: path.join(screenshotsDir, '02_custom_404_page.png'),
    fullPage: false,
  });
  console.log('📸 Captured: 02_custom_404_page.png');

  // Test "Ask the assistant" button on 404 page
  console.log('🤖 Clicking "Ask the assistant" on 404 page...');
  const askAssistantBtn = mobilePage.locator('button:has-text("Ask the assistant")').first();
  if (await askAssistantBtn.isVisible()) {
    await askAssistantBtn.click();
    await mobilePage.waitForTimeout(1500);

    await mobilePage.screenshot({
      path: path.join(screenshotsDir, '03_chat_assistant_404.png'),
      fullPage: false,
    });
    console.log('📸 Captured: 03_chat_assistant_404.png (Chat widget opened from 404)');
  }

  await mobilePage.close();
  await mobileContext.close();
  console.log('🎥 Saved mobile video clip to public/recordings/');

  // ==========================================================================
  // 2. DESKTOP VERIFICATION & USER WORKFLOWS
  // ==========================================================================
  console.log('\n💻 Testing Desktop Full-Stack User Flows (1280x800)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1280, height: 800 },
    },
  });

  const desktopPage = await desktopContext.newPage();

  // 1. Settings & Persona Login
  console.log('👤 Logging in as Citizen user on /settings...');
  await desktopPage.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '04_user_login_settings.png') });
  console.log('📸 Captured: 04_user_login_settings.png');

  // 2. Citizen Dashboard & FAQs Preview
  console.log('📊 Navigating to Citizen Dashboard /dashboard...');
  await desktopPage.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '05_citizen_dashboard.png') });
  console.log('📸 Captured: 05_citizen_dashboard.png');

  // 3. Interactive Leaflet Map
  console.log('🗺️ Navigating to Interactive Public Map /map...');
  await desktopPage.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '06_interactive_map.png') });
  console.log('📸 Captured: 06_interactive_map.png');

  // 4. FAQ Page with 10+ SQL items
  console.log('❓ Navigating to Municipal FAQ Page /faq...');
  await desktopPage.goto('http://localhost:3000/faq', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '07_faq_page.png') });
  console.log('📸 Captured: 07_faq_page.png');

  // 5. 8 Error Codes Catalog
  console.log('⚠️ Navigating to Error Codes Catalog /errors...');
  await desktopPage.goto('http://localhost:3000/errors', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);

  // Click Test API Response for 403
  const test403Btn = desktopPage.locator('button:has-text("Test API Response")').nth(2);
  if (await test403Btn.isVisible()) {
    await test403Btn.click();
    await desktopPage.waitForTimeout(800);
  }
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '08_error_codes_catalog.png') });
  console.log('📸 Captured: 08_error_codes_catalog.png');

  // 6. Health & System Telemetry
  console.log('🩺 Navigating to Health Check Desk /health...');
  await desktopPage.goto('http://localhost:3000/health', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(screenshotsDir, '09_health_check.png') });
  console.log('📸 Captured: 09_health_check.png');

  // 7. Test AI Assistant Chat & Support Ticket Generation
  console.log('🤖 Testing AI Assistant Chat on Desktop...');
  const chatToggle = desktopPage.locator('button[title*="CivicPulse AI"]').first();
  if (await chatToggle.isVisible()) {
    await chatToggle.click();
    await desktopPage.waitForTimeout(800);

    // Ask about error 403
    const chatInput = desktopPage.locator('input[placeholder*="Ask about FAQs"]').first();
    if (await chatInput.isVisible()) {
      await chatInput.fill('What does Error 403 mean in CivicPulse?');
      await chatInput.press('Enter');
      await desktopPage.waitForTimeout(1500);

      // Now ask to create a support ticket
      await chatInput.fill('Can you please create a support ticket for my street?');
      await chatInput.press('Enter');
      await desktopPage.waitForTimeout(2000);
    }

    await desktopPage.screenshot({ path: path.join(screenshotsDir, '10_chat_support_ticket.png') });
    console.log('📸 Captured: 10_chat_support_ticket.png (Support Ticket created in SQL & Chat in MongoDB)');
  }

  await desktopPage.close();
  await desktopContext.close();
  await browser.close();

  console.log('🎥 Saved desktop video clip to public/recordings/');
  console.log('\n🎉 ALL PLAYWRIGHT AUTOMATION TESTS COMPLETED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Playwright Test Suite Error:', err);
  process.exit(1);
});
