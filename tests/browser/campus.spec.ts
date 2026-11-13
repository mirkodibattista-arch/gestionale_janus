import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
  test(`login, studenti e Audit a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    const external: string[] = [];
    await page.route('**/*', route => {
      if (new URL(route.request().url()).hostname !== '127.0.0.1') {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    await page.goto('/#/login');
    await page.locator('#login-email').fill('admin@janus-demo.test');
    await page.locator('#login-password').fill('CampusDemo!2026');
    await page.locator('.auth-card form').getByRole('button', { name: /Accedi/ }).click();
    await expect(page.locator('.account-context b')).toHaveText('Admin');
    await expect(page.locator('.cp-metrics article')).toHaveCount(4);
    if (viewport.width < 760) {
      await page.locator('.mobile-menu').click();
      await page.locator('.mobile-dash-menu a[href="#/campus/studenti"]').click();
      await expect(page.locator('.mobile-dash-menu')).toHaveCount(0);
    } else await page.locator('.dash-sidebar a[href="#/campus/studenti"]').click();
    await page.getByRole('textbox', { name: 'Cerca studenti' }).fill('Sofia');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await page.locator('.cp-student-link').click();
    await page.getByRole('button', { name: 'Modifica studente', exact: true }).click();
    await page.getByRole('textbox', { name: 'Città', exact: true }).fill('Firenze');
    await page.getByRole('button', { name: 'Salva modifiche demo' }).click();
    await expect(page.getByRole('status')).toContainText('aggiornata');
    await expect(page.locator('.cp-two')).toContainText('Firenze');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.campus-logout').click();
    await page.locator('#login-email').fill('audit@janus-demo.test');
    await page.locator('#login-password').fill('CampusDemo!2026');
    await page.locator('.auth-card form').getByRole('button', { name: /Accedi/ }).click();
    await expect(page.locator('.account-context b')).toHaveText('Audit');
    await page.goto('/#/campus/studenti');
    await expect(page.locator('tbody tr')).toHaveCount(6);
    await expect(page.getByRole('button', { name: 'Nuovo studente' })).toHaveCount(0);
    await page.locator('.cp-student-link').first().click();
    await expect(page.getByRole('button', { name: 'Modifica studente', exact: true })).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}
