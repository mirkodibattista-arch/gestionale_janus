import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`anagrafica: campi, validazioni e stato a ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
    const external: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => {
      if (new URL(route.request().url()).hostname !== '127.0.0.1') {
        external.push(route.request().url()); return route.abort();
      }
      return route.continue();
    });
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@janus-demo.test');
    await page.locator('#login-password').fill('CampusDemo!2026');
    await page.locator('.auth-card form button[type=submit]').click();
    await expect(page.locator('.account-context')).toBeVisible();
    await page.goto('/campus/studenti');
    const rowsBefore = await page.locator('tbody').innerText();
    await page.getByRole('button', { name: 'Anteprima nuova anagrafica', exact: true }).click();
    const preview = page.getByRole('region', { name: 'Anteprima anagrafica studente' });
    await expect(preview).toBeVisible();
    await expect(preview.locator('input')).toHaveCount(11);
    await expect(preview.locator('select')).toHaveCount(3);
    await page.screenshot({ path: testInfo.outputPath('anagrafica-vuota.png'), fullPage: true });
    const send = preview.getByRole('button', { name: 'Invia in verifica (demo)', exact: true });
    await send.click();
    expect(await preview.getByLabel('Nome', { exact: true }).evaluate((e: HTMLInputElement) => e.validity.valueMissing)).toBe(true);
    await expect(preview).toContainText('stato: Bozza');
    await preview.getByRole('button', { name: 'Salva bozza (demo)' }).click();
    await expect(preview.getByRole('status')).toContainText('Bozza salvata');
    await preview.getByLabel('Nome', { exact: true }).fill('   ');
    await preview.getByLabel('Cognome', { exact: true }).fill('Sintetico');
    await send.click();
    await expect(preview.getByRole('status')).toContainText('Inserisci nome e cognome');
    await preview.getByLabel('Nome', { exact: true }).fill('Persona Demo');
    await preview.getByLabel('Codice fiscale').fill('ABC');
    await send.click();
    await expect(preview.getByRole('status')).toContainText('16 caratteri');
    await preview.getByLabel('Codice fiscale').fill('');
    await preview.getByLabel('CAP', { exact: true }).fill('12A45');
    await send.click();
    await expect(preview.getByRole('status')).toContainText('5 cifre');
    await preview.getByLabel('CAP', { exact: true }).fill('00100');
    await preview.getByLabel('Email', { exact: true }).fill('non-valida');
    await send.click();
    expect(await preview.getByLabel('Email', { exact: true }).evaluate((e: HTMLInputElement) => e.validity.typeMismatch)).toBe(true);
    await preview.getByLabel('Email', { exact: true }).fill('persona@example.invalid');
    await preview.getByLabel('Data di nascita').fill('2099-01-01');
    await send.click();
    await expect(preview).toContainText('stato: Bozza');
    await preview.getByLabel('Data di nascita').fill('2000-01-01');
    await preview.getByLabel('Luogo di nascita').fill('Località demo');
    await preview.getByLabel('Telefono').fill('0000000000');
    await preview.getByLabel('Indirizzo', { exact: true }).first().fill('Via dimostrativa 1');
    await preview.getByLabel('Comune', { exact: true }).fill('Comune demo');
    await preview.getByLabel('Provincia (sigla)').fill('RM');
    await preview.getByLabel('Percorso', { exact: true }).selectOption('Recupero anni');
    await preview.getByLabel('Indirizzo', { exact: true }).last().selectOption('Informatica');
    await preview.getByLabel('Anno scolastico').selectOption('2026/27');
    await preview.getByRole('button', { name: 'Salva bozza (demo)' }).click();
    await page.screenshot({ path: testInfo.outputPath('anagrafica-bozza.png'), fullPage: true });
    await preview.getByLabel('Nome', { exact: true }).fill('Modifica non salvata');
    await preview.getByRole('button', { name: 'Ripristina bozza' }).click();
    await expect(preview.getByLabel('Nome', { exact: true })).toHaveValue('Persona Demo');
    await send.click();
    await expect(preview).toContainText('stato: In verifica');
    await expect(preview.getByRole('status')).toContainText('Invio in verifica simulato');
    await page.screenshot({ path: testInfo.outputPath('anagrafica-in-verifica.png'), fullPage: true });
    await preview.getByLabel('Nome', { exact: true }).fill('Nuova modifica');
    await expect(preview).toContainText('stato: Bozza');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await preview.getByRole('button', { name: 'Chiudi anteprima' }).click();
    await expect.poll(() => page.locator('tbody').innerText()).toBe(rowsBefore);
    await page.getByRole('button', { name: 'Anteprima nuova anagrafica', exact: true }).click();
    await expect(preview.getByLabel('Nome', { exact: true })).toHaveValue('');
    await preview.getByLabel('Nome', { exact: true }).fill('Temporaneo');
    await page.reload();
    await expect(preview).toHaveCount(0);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('anagrafica: accesso limitato ad Admin e Segreteria', async ({ page }) => {
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  for (const role of ['admin','segreteria','supervisore','didattica','amministrazione','tutor','audit','studente']) {
    await page.goto('/login');
    await page.locator('#login-email').fill(`${role}@janus-demo.test`);
    await page.locator('#login-password').fill('CampusDemo!2026');
    await page.locator('.auth-card form button[type=submit]').click();
    await expect(page.locator('.account-context')).toBeVisible();
    await page.goto('/campus/studenti');
    const button = page.getByRole('button', { name: 'Anteprima nuova anagrafica', exact: true });
    if (['admin','segreteria'].includes(role)) {
      await button.click();
      await expect(page.getByRole('heading', { name: 'Nuova scheda studente' })).toBeVisible();
    } else await expect(button).toHaveCount(0);
    await page.evaluate(() => localStorage.clear());
  }
});
