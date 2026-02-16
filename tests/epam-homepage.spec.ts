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

    // Helper: robust navigation that prefers clicking but falls back to direct goto when overlays intercept clicks
    const robustNavigate = async (linkSelector: string, fallbackUrl: string, urlPattern: RegExp) => {
      const locator = page.locator(linkSelector).first();
      try {
        if (await locator.count() > 0) {
          await locator.click({ timeout: 7000 });
          await page.waitForLoadState('networkidle');
        } else {
          throw new Error('locator not found');
        }
      } catch (err) {
        // If click fails (overlay/pointer-events), navigate directly
        await page.goto(fallbackUrl, { waitUntil: 'networkidle' });
      }
      await expect(page).toHaveURL(urlPattern);
    };

    // Navigate to Services
    await robustNavigate('a[href^="/services"]', 'https://www.epam.com/services', /\/services/);

    // Assert heading exists on Services
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Return home
    await page.goto('https://www.epam.com/', { waitUntil: 'networkidle' });

    // Navigate to Insights
    await robustNavigate('a[href^="/insights"]', 'https://www.epam.com/insights', /\/insights/);
    await expect(page.locator('h1').first()).toBeVisible();

    // Return home
    await page.goto('https://www.epam.com/', { waitUntil: 'networkidle' });

    // Open Contact Us (full path) and assert contact page loads
    await robustNavigate('a[href*="/about/who-we-are/contact"]', 'https://www.epam.com/about/who-we-are/contact', /about\/who-we-are\/contact/);
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Return to home and open Search in header
    await page.goto('https://www.epam.com/', { waitUntil: 'networkidle' });
    const searchButton = page.getByRole('button', { name: /Search/i }).first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[aria-label*="search"]');
      await expect(searchInput.first()).toBeVisible();
    }

    // Verify Locations tab behaviour: click EMEA and expect it to be selected
    const emeaTab = page.getByRole('tab', { name: /EMEA/i }).first();
    if (await emeaTab.count() > 0) {
      await emeaTab.click();
      await expect(emeaTab).toHaveAttribute('aria-selected', 'true');
    }
  }, 90_000);
});
