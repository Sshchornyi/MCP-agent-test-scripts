import { test, expect } from '@playwright/test';

test.describe('EPAM homepage - basic flows', () => {
  test('homepage navigation and key elements', async ({ page }) => {
    // Navigate to homepage
    await page.goto('https://www.epam.com/', { waitUntil: 'networkidle' });

    // Accept cookie banner when present
    const acceptCookies = page.getByRole('button', { name: /Accept All/i });
    if (await acceptCookies.count() > 0) {
      await acceptCookies.first().click();
    }

    // Verify main hero heading is visible
    await expect(page.getByRole('heading', { name: /Engineering the\s*Future/i })).toBeVisible({ timeout: 10000 });

    // Navigate to Services using a stable href-based locator
    await page.locator('a[href^="/services"]').first().click();
    await expect(page).toHaveURL(/\/services/);
    // Basic assertion that the target page has a visible heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Go back to homepage
    await page.goBack();

    // Navigate to Insights and assert URL
    await page.locator('a[href^="/insights"]').first().click();
    await expect(page).toHaveURL(/\/insights/);
    await expect(page.locator('h1').first()).toBeVisible();

    // Return home
    await page.goBack();

    // Open Contact Us (full path) and assert contact page loads
    const contact = page.locator('a[href*="/about/who-we-are/contact"]');
    await contact.first().click();
    await expect(page).toHaveURL(/about\/who-we-are\/contact/);
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Return to home and open Search in header
    await page.goto('https://www.epam.com/');
    await page.getByRole('button', { name: /Search/i }).click();
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[aria-label*="search"]');
    await expect(searchInput.first()).toBeVisible();

    // Verify Locations tab behaviour: click EMEA and expect it to be selected
    const emeaTab = page.getByRole('tab', { name: /EMEA/i });
    await emeaTab.click();
    await expect(emeaTab).toHaveAttribute('aria-selected', 'true');
  }, 60_000);
});
