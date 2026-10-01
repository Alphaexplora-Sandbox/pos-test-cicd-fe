import { expect, test } from '@playwright/test';

test.describe('pos-test-cicd-frontend deployment', () => {
  test('serves its entry page', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });
});
