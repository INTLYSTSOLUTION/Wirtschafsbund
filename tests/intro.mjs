import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { startProtectedServer } from './helpers/protected-server.mjs';

const server = process.env.TEST_BASE ? null : await startProtectedServer();
const base = process.env.TEST_BASE || server.base;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}),
});
const errors = [];
const checks = [];
async function create(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true, ...options });
  if (server) await server.signIn(context);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return { context, page };
}
async function released(page) {
  await expect(page.locator('.brand-intro')).toHaveCount(0, { timeout: 7000 });
  assert.equal(await page.locator('[inert]').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('intro-active')), false);
  await expect(page.locator('.hero h1')).toBeVisible();
}
try {
  for (const width of [390, 1440]) {
    const viewport = { width, height: 900 };
    const baseline = await create({ viewport, reducedMotion: 'reduce' });
    await baseline.page.goto(base);
    await baseline.page.evaluate(() => document.fonts.ready);
    const original = await baseline.page.screenshot({ fullPage: true });
    await baseline.context.close();
    const { context, page } = await create({ viewport });
    await page.goto(base);
    await expect(page.locator('.brand-intro')).toHaveClass(/is-playing/);
    assert.equal(await page.locator('[inert]').count(), 3);
    await released(page);
    assert.ok(original.equals(await page.screenshot({ fullPage: true })), `Layout changed at ${width}px`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.getByRole('link', { name: 'Den Bund kennenlernen', exact: true }).click();
    await page.getByRole('link', { name: 'Der Wirtschaftsbund – Startseite', exact: true }).click();
    await released(page);
    await page.reload();
    await expect(page.locator('.brand-intro')).toBeVisible();
    await page.getByRole('button', { name: 'Intro überspringen', exact: true }).click();
    await released(page);
    await expect(page.locator('main')).toBeFocused();
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.deepEqual(await page.evaluate(() => ({ ...sessionStorage })), { 'wirtschaftsbund:intro-seen': '1' });
    assert.deepEqual((await context.cookies()).map(cookie => cookie.name), server ? ['__Host-wb_session'] : []);
    checks.push(`Intro, unchanged layout, navigation, reload and skip: ${width}px`);
    await context.close();
  }
  for (const key of ['Tab', 'Escape']) {
    const { context, page } = await create();
    await page.goto(base);
    await expect(page.locator('.brand-intro')).toBeVisible();
    await page.keyboard.press(key);
    await released(page);
    if (key === 'Tab') await expect(page.locator('.skip-link')).toBeFocused();
    checks.push(`Keyboard: ${key}`);
    await context.close();
  }
  for (const variant of ['reduced', 'no-js', 'anchor', 'missing-logo', 'missing-css', 'missing-script', 'blocked-storage', 'resize', 'motion-change', 'no-canvas']) {
    const { context, page } = await create({
      ...(variant === 'reduced' ? { reducedMotion: 'reduce' } : {}),
      ...(variant === 'no-js' ? { javaScriptEnabled: false } : {}),
    });
    const blocked = { 'missing-logo': 'pferd-original.jpg', 'missing-css': 'intro.css', 'missing-script': 'intro.js' }[variant];
    if (blocked) await page.route(`**/${blocked}`, route => route.abort());
    if (variant === 'blocked-storage') await page.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage unavailable'); } });
    });
    if (variant === 'no-canvas') await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await page.goto(base + (variant === 'anchor' ? '#inhalt' : ''));
    if (['no-js', 'missing-script'].includes(variant)) {
      await expect(page.locator('.brand-intro')).toBeHidden();
      await expect(page.locator('.hero h1')).toBeVisible();
      assert.equal(await page.locator('[inert]').count(), 0);
    } else {
      if (['blocked-storage', 'resize', 'motion-change'].includes(variant)) {
        await expect(page.locator('.brand-intro')).toHaveClass(/is-playing/);
        if (variant === 'resize') await page.setViewportSize({ width: 800, height: 600 });
        else if (variant === 'motion-change') await page.emulateMedia({ reducedMotion: 'reduce' });
        else await page.keyboard.press('Escape');
      }
      await released(page);
    }
    checks.push(`Fallback: ${variant}`);
    await context.close();
  }
  // The transparent overlay must never block the now-visible site.
  {
    const { context, page } = await create();
    await page.goto(base);
    await expect(page.locator('.brand-intro')).toHaveClass(/is-playing/);
    await page.waitForFunction(() => {
      const scene = document.querySelector('.intro-scene');
      return !scene || Number(getComputedStyle(scene).opacity) === 0;
    });
    assert.equal(await page.locator('[inert]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('intro-active')), false);
    assert.equal(await page.evaluate(() => {
      const overlay = document.querySelector('.brand-intro');
      return overlay ? getComputedStyle(overlay).pointerEvents : 'none';
    }), 'none');
    await page.getByRole('link', { name: 'Den Bund kennenlernen', exact: true }).click();
    await expect(page.locator('h1')).toContainText('Ein eigener Kopf.');
    checks.push('Page interactive immediately when the transition clears');
    await context.close();
  }
  if (server) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await expect(page).toHaveURL(/\/zugang$/);
    await expect(page.locator('.brand-intro')).toHaveCount(0);
    await page.locator('#access-password').fill(server.values.ACCESS_PASSWORD);
    await page.getByRole('button', { name: 'Bestätigen', exact: true }).click();
    await expect(page).toHaveURL(/\/index.html$/);
    await expect(page.locator('.brand-intro')).toHaveClass(/is-playing/);
    await released(page);
    await page.getByRole('button', { name: 'Abmelden', exact: true }).click();
    await expect(page).toHaveURL(/\/zugang$/);
    assert.deepEqual(await context.cookies(), []);
    checks.push('Intro after actual login; logout and access protection remain functional');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: checks, errors }, null, 2));
} finally {
  await browser.close();
  await server?.close();
}
