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
    await page.goto("/login");
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
        .locator('.mobile-dash-menu a[href="/campus/studenti"]')
        .click();
      await expect(page.locator(".mobile-dash-menu")).toHaveCount(0);
    } else
      await page.locator('.dash-sidebar a[href="/campus/studenti"]').click();
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
    await page.goto("/campus/studenti");
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
    await page.goto("/login");
    await page.locator("#login-email").fill("studente@janus-demo.test");
    await page.locator("#login-password").fill("CampusDemo!2026");
    await page
      .locator(".auth-card form")
      .getByRole("button", { name: /Accedi/ })
      .click();
    await expect(page).toHaveURL(/\/campus\/studente$/);
    await expect(page.locator('[data-portal="studente"]')).toBeVisible();
    await expect(page.locator(".dash-sidebar")).toHaveCount(0);
    if (viewport.width < 760) {
      await page.getByRole("button", { name: "Apri menu" }).click();
      await page
        .locator('.mobile-dash-menu a[href="/campus/studente/profilo"]')
        .click();
    } else
      await page
        .locator('.student-navigation a[href="/campus/studente/profilo"]')
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
    await page.goto("/campus/studente/comunicazioni");
    await expect(page.locator(".cp-list > div")).toHaveCount(2);
    await expect(page.locator(".student-content")).not.toContainText(
      "Nota interna",
    );
    await page
      .getByRole("button", { name: "Segna come letta" })
      .first()
      .click();
    await expect(page.getByText("Letta", { exact: true })).toBeVisible();
    await page.goto("/campus/dashboard");
    await expect(
      page.getByRole("heading", { name: "Accesso negato" }),
    ).toBeVisible();
  });
}

for (const viewport of [
  { width: 1440, height: 960 },
  { width: 390, height: 844 },
]) {
  test(`home pubblica e accesso campus a ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    let submissions = 0;
    await page.route("**/functions/v1/richiesta-contatto", (route) => {
      submissions++;
      return route.abort();
    });
    await page.goto("/");
    await expect(page.locator(".hero-section")).toBeVisible();
    await expect(page.locator("#nome")).toBeVisible();
    await page.locator("#nome").fill("Persona");
    await page
      .getByRole("link", { name: "SEI GIÀ ISCRITTO? ACCEDI AL DIGITAL CAMPUS" })
      .click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("#login-email")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#nome")).toHaveValue("Persona");
    await expect(page.locator(".hero-section")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/orientamento");
    await page.reload();
    await expect(page.locator(".form-section")).toHaveCount(1);
    await expect(page.locator("#nome")).toBeVisible();
    await page.goto("/campus/dashboard");
    await page.reload();
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator(".dashboard-shell")).toHaveCount(0);
    expect(submissions).toBe(0);
  });
}


// Matrice visuale completa: ogni screenshot è una cattura reale del browser
// Chromium, salvata tra gli output del test e conservata come artifact CI.
const visualAccounts = [
  { role: "Admin", email: "admin@janus-demo.test", portal: "azienda" },
  { role: "Supervisore", email: "supervisore@janus-demo.test", portal: "azienda" },
  { role: "Segreteria", email: "segreteria@janus-demo.test", portal: "azienda" },
  { role: "Didattica", email: "didattica@janus-demo.test", portal: "azienda" },
  { role: "Amministrazione", email: "amministrazione@janus-demo.test", portal: "azienda" },
  { role: "Tutor", email: "tutor@janus-demo.test", portal: "azienda" },
  { role: "Studente", email: "studente@janus-demo.test", portal: "studente" },
  { role: "Audit", email: "audit@janus-demo.test", portal: "azienda" },
] as const;

for (const viewport of [
  { width: 1440, height: 960 },
  { width: 390, height: 844 },
]) {
  test(`home, form e login con screenshot a ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const externalRequests: string[] = [];
    const failedRequests: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      if (new URL(request.url()).hostname === "127.0.0.1")
        failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? "errore"}`);
    });
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname !== "127.0.0.1") {
        externalRequests.push(route.request().url());
        await route.abort();
        return;
      }
      await route.continue();
    });

    await page.goto("/");
    await expect(page.locator(".hero-section")).toBeVisible();
    await expect(page.locator("#nome")).toBeVisible();
    await expect(page.getByRole("link", { name: "SEI GIÀ ISCRITTO? ACCEDI AL DIGITAL CAMPUS" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });

    await page.goto("/orientamento");
    await expect(page.locator(".form-section")).toHaveCount(1);
    await expect(page.locator("#nome")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("form-orientamento.png"), fullPage: true });

    await page.goto("/login");
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator(".auth-card form button[type=submit]")).toBeEnabled();
    await expect(page.locator(".auth-card")).toHaveCSS("opacity", "1");
    await page.screenshot({
      path: testInfo.outputPath("login.png"),
      fullPage: true,
      animations: "disabled",
    });

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(externalRequests).toEqual([]);
  });

  for (const account of visualAccounts) {
    test(`dashboard ${account.role} e logout a ${viewport.width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const externalRequests: string[] = [];
      const failedRequests: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("requestfailed", (request) => {
        if (new URL(request.url()).hostname === "127.0.0.1")
          failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? "errore"}`);
      });
      await page.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.hostname !== "127.0.0.1") {
          externalRequests.push(route.request().url());
          await route.abort();
          return;
        }
        await route.continue();
      });

      await page.goto("/login");
      await page.locator("#login-email").fill(account.email);
      await page.locator("#login-password").fill("CampusDemo!2026");
      await page.locator(".auth-card form").getByRole("button", { name: /Accedi/ }).click();
      await expect(page.locator(".account-context b")).toHaveText(account.role);
      await expect(page.locator(`[data-portal="${account.portal}"]`)).toBeVisible();
      await expect(page.locator(".dashboard-shell")).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`${account.role.toLowerCase()}-dashboard.png`),
        fullPage: true,
      });

      if (account.portal !== "studente") {
        const table = page.getByRole("region", { name: "Percorsi in evidenza" });
        const headers = ["Studente", "Indirizzo", "Tutor", "Progresso", "Stato"];
        await expect(table.getByRole("columnheader")).toHaveText(headers);
        await expect(table).toHaveAttribute("tabindex", "0");

        const tableSize = await table.evaluate((element) => ({
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
        }));
        if (viewport.width < 760) {
          expect(tableSize.scrollWidth).toBeGreaterThan(tableSize.clientWidth);
          await expect(page.locator("#cp-paths-scroll-hint")).toBeVisible();
          await table.evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
          await expect.poll(() => table.evaluate((element) => element.scrollLeft))
            .toBeGreaterThan(0);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await table.screenshot({
            path: testInfo.outputPath(`${account.role.toLowerCase()}-dashboard-table-scroll.png`),
            animations: "disabled",
          });
        } else {
          expect(tableSize.scrollWidth).toBeLessThanOrEqual(tableSize.clientWidth);
        }
      }

      if (viewport.width < 760) {
        const menuButton = page.getByRole("button", { name: "Apri menu" });
        await expect(menuButton).toBeVisible();
        await menuButton.click();
        const menu = page.locator(".mobile-dash-menu");
        await expect(menu).toBeVisible();
        await expect(menu.locator("a").first()).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath(`${account.role.toLowerCase()}-menu-mobile.png`), fullPage: true });
        await menu.locator("a").first().click();
        await expect(page.locator(".mobile-dash-menu")).toHaveCount(0);
      } else if (account.portal === "studente") {
        await expect(page.locator(".student-navigation")).toBeVisible();
        await expect(page.locator(".student-navigation a").first()).toBeVisible();
      } else {
        await expect(page.locator(".dash-sidebar")).toBeVisible();
        await expect(page.locator(".dash-nav-item").first()).toBeVisible();
      }

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const logout = page.locator(".campus-logout");
      await expect(logout).toBeVisible();
      await logout.click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.locator("#login-email")).toBeVisible();
      await expect(page.locator(".auth-card")).toHaveCSS("opacity", "1");
      await page.screenshot({
        path: testInfo.outputPath(`${account.role.toLowerCase()}-logout.png`),
        fullPage: true,
        animations: "disabled",
      });

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
}
