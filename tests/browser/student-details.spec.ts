import { test, expect } from '@playwright/test';

async function login(page: import('@playwright/test').Page, role: string) {
  await page.goto('/login');
  await page.locator('#login-email').fill(`${role}@janus-demo.test`);
  await page.locator('#login-password').fill('CampusDemo!2026');
  await page.locator('.auth-card form button[type=submit]').click();
  await expect(page.locator('.account-context')).toBeVisible();
  await page.goto('/campus/studenti');
}

for (const width of [1440, 390]) {
  test(`scheda fase 2: sezioni e referenti a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
    const external: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      if (new URL(route.request().url()).hostname !== '127.0.0.1') {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    await login(page, 'admin');
    await page.locator('.cp-student-link').first().click();
    const nav = page.getByRole('navigation', { name: 'Sezioni scheda studente' });
    await expect(nav.getByRole('button', { name: 'Riepilogo', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'Iscrizione e percorso', exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'Anagrafica', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Anagrafica e contatti', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Modifica studente', exact: true })).toBeVisible();
    await nav.getByRole('button', { name: 'Referenti', exact: true }).click();
    const refs = page.getByRole('region', { name: 'Referenti dello studente' });
    await refs.getByRole('button', { name: 'Aggiungi referente demo' }).click();
    expect(await refs.getByLabel('Nome e cognome').evaluate((e: HTMLInputElement) => e.validity.valueMissing)).toBe(true);
    await refs.getByLabel('Nome e cognome').fill('Referente Sintetico');
    await refs.getByRole('button', { name: 'Aggiungi referente demo' }).click();
    await expect(refs.getByRole('status')).toContainText('almeno un recapito');
    await refs.getByLabel('Email demo').fill('non-valida');
    await refs.getByRole('button', { name: 'Aggiungi referente demo' }).click();
    expect(await refs.getByLabel('Email demo').evaluate((e: HTMLInputElement) => e.validity.typeMismatch)).toBe(true);
    await refs.getByLabel('Email demo').fill('referente@example.invalid');
    await refs.getByLabel('Relazione').selectOption('Contatto di emergenza');
    const localBefore = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
    await refs.getByRole('button', { name: 'Aggiungi referente demo' }).click();
    await expect(refs.locator('.cp-list')).toContainText('Referente Sintetico');
    await nav.getByRole('button', { name: 'Riepilogo', exact: true }).click();
    await nav.getByRole('button', { name: 'Referenti', exact: true }).click();
    await expect(refs.locator('.cp-list')).toContainText('Referente Sintetico');
    await refs.getByLabel('Nome e cognome').fill('Secondo Sintetico');
    await refs.getByLabel('Telefono demo').fill('0000000000');
    await refs.getByRole('button', { name: 'Aggiungi referente demo' }).click();
    await expect(refs.locator('.cp-list > div')).toHaveCount(2);
    await refs.getByRole('button', { name: 'Rimuovi', exact: true }).first().click();
    await expect(refs.locator('.cp-list > div')).toHaveCount(1);
    await expect(refs.locator('.cp-list')).not.toContainText('Referente Sintetico');
    expect(await page.evaluate(() => JSON.stringify(Object.entries(localStorage)))).toBe(localBefore);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await page.locator('.cp-student-link').first().click();
    await nav.getByRole('button', { name: 'Referenti', exact: true }).click();
    await expect(refs.locator('.cp-list')).toHaveCount(0);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('scheda fase 2: modifica riservata ad Admin e Segreteria', async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  for (const role of ['admin', 'segreteria', 'supervisore', 'didattica', 'amministrazione', 'tutor', 'audit', 'studente']) {
    await login(page, role);
    if (['studente', 'amministrazione'].includes(role)) {
      await expect(page.getByRole('heading', { name: /Accesso negato/ })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Sezioni scheda studente' })).toHaveCount(0);
    } else {
      await page.locator('.cp-student-link').first().click();
      const nav = page.getByRole('navigation', { name: 'Sezioni scheda studente' });
      await nav.getByRole('button', { name: 'Anagrafica', exact: true }).click();
      const editable = ['admin', 'segreteria'].includes(role);
      await expect(page.getByRole('button', { name: 'Modifica studente', exact: true })).toHaveCount(editable ? 1 : 0);
      await nav.getByRole('button', { name: 'Referenti', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Aggiungi referente demo' })).toHaveCount(editable ? 1 : 0);
    }
    await page.evaluate(() => localStorage.clear());
  }
});
