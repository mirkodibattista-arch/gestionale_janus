import { test, expect } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 960 },
  { width: 390, height: 844 },
]) {
  test(`login, studenti e Audit a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const external: string[] = [];
    await page.route("**/*", (route) => {
      if (new URL(route.request().url()).hostname !== "127.0.0.1") {
        external.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    await page.goto("/#/login");
    await page.locator("#login-email").fill("admin@janus-demo.test");
    await page.locator("#login-password").fill("CampusDemo!2026");
    await page
      .locator(".auth-card form")
      .getByRole("button", { name: /Accedi/ })
      .click();
    await expect(page.locator(".account-context b")).toHaveText("Admin");
    await expect(page.locator(".cp-metrics article")).toHaveCount(4);
    if (viewport.width < 760) {
      await page.locator(".mobile-menu").click();
      await page
        .locator('.mobile-dash-menu a[href="#/azienda/studenti"]')
        .click();
      await expect(page.locator(".mobile-dash-menu")).toHaveCount(0);
    } else
      await page.locator('.dash-sidebar a[href="#/azienda/studenti"]').click();
    await page.getByRole("textbox", { name: "Cerca studenti" }).fill("Sofia");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page.locator(".cp-student-link").click();
    await page
      .getByRole("button", { name: "Modifica studente", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Città", exact: true })
      .fill("Firenze");
    await page.getByRole("button", { name: "Salva modifiche demo" }).click();
    await expect(page.getByRole("status")).toContainText("aggiornata");
    await expect(page.locator(".cp-two")).toContainText("Firenze");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".campus-logout").click();
    await page.locator("#login-email").fill("audit@janus-demo.test");
    await page.locator("#login-password").fill("CampusDemo!2026");
    await page
      .locator(".auth-card form")
      .getByRole("button", { name: /Accedi/ })
      .click();
    await expect(page.locator(".account-context b")).toHaveText("Audit");
    await page.goto("/#/azienda/studenti");
    await expect(page.locator("tbody tr")).toHaveCount(6);
    await expect(
      page.getByRole("button", { name: "Nuovo studente" }),
    ).toHaveCount(0);
    await page.locator(".cp-student-link").first().click();
    await expect(
      page.getByRole("button", { name: "Modifica studente", exact: true }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

for (const viewport of [
  { width: 1440, height: 960 },
  { width: 390, height: 844 },
]) {
  test(`portale personale studente a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/#/login");
    await page.locator("#login-email").fill("studente@janus-demo.test");
    await page.locator("#login-password").fill("CampusDemo!2026");
    await page
      .locator(".auth-card form")
      .getByRole("button", { name: /Accedi/ })
      .click();
    await expect(page).toHaveURL(/#\/studente\/dashboard$/);
    await expect(page.locator('[data-portal="studente"]')).toBeVisible();
    await expect(page.locator(".dash-sidebar")).toHaveCount(0);
    if (viewport.width < 760) {
      await page.getByRole("button", { name: "Apri menu" }).click();
      await page
        .locator('.mobile-dash-menu a[href="#/studente/profilo"]')
        .click();
    } else
      await page
        .locator('.student-navigation a[href="#/studente/profilo"]')
        .click();
    await expect(page.locator(".student-content")).toContainText("Andrea Alba");
    await expect(page.locator(".student-content")).not.toContainText(
      "Sofia Brina",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/#/studente/comunicazioni");
    await expect(page.locator(".cp-list > div")).toHaveCount(2);
    await expect(page.locator(".student-content")).not.toContainText(
      "Nota interna",
    );
    await page
      .getByRole("button", { name: "Segna come letta" })
      .first()
      .click();
    await expect(page.getByText("Letta", { exact: true })).toBeVisible();
    await page.goto("/#/azienda/dashboard");
    await expect(
      page.getByRole("heading", { name: "Accesso negato" }),
    ).toBeVisible();
  });
}
