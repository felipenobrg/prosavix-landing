const { test, expect } = require("playwright/test");

const pageUrl = process.env.PW_PAGE_URL || "http://127.0.0.1:4195/";

test("desktop: valida o checkout único, a galeria e o FAQ", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(pageUrl, { waitUntil: "networkidle" });

  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator(".site-header .header-brand-logo")).toBeVisible();
  await expect(page.locator('.site-header [data-cta-location="header"]')).toBeVisible();
  await expect(page.locator("[data-checkout-panel]")).toHaveCount(1);
  await expect(page.locator(".package-card.is-selected")).toHaveCount(1);
  await expect(page.locator("[data-purchase-total]")).toHaveText("$ 198.000 COP");
  await expect(page.locator("[data-offer-copy]")).toHaveText("Ahorras $99.000 con el kit de 3 frascos");
  await page.screenshot({ path: "qa/hero-oferta-v3.png", fullPage: false });
  await expect(page.locator(".ingredients-grid article")).toHaveCount(7);
  await expect(page.locator(".ingredients-grid .ingredient-photo img")).toHaveCount(7);
  await page.locator("#ingredientes .ingredients-grid").screenshot({ path: "qa/prosavix-ingredientes-reais-v1.png" });
  await expect(page.locator(".faq-list details")).toHaveCount(6);
  await expect(page.locator(".treatment-detail-grid article")).toHaveCount(3);
  await page.locator(".treatments-analysis").screenshot({ path: "qa/prosavix-tratamientos-v1.png" });
  await expect(page.locator(".discovery-section")).toBeVisible();
  await expect(page.locator(".cycle-story-grid article")).toHaveCount(4);
  await expect(page.locator("#solucion")).toBeVisible();
  await expect(page.locator("#solucion .step-visual img")).toHaveCount(3);
  await page.locator("#solucion .new-step-cards").screenshot({ path: "qa/prosavix-tres-etapas-v2.png" });
  await expect(page.locator(".offer-summary-section")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: "qa/local-desktop-clean-full.png", fullPage: true });

  const heroGallery = page.locator("#inicio .gallery-column");
  await expect(heroGallery.locator(".thumb")).toHaveCount(4);
  await heroGallery.locator('[data-gallery-image="assets/images/hero-opcao-homem-correndo.webp"]').click();
  await expect(heroGallery.locator("[data-product-image]")).toHaveAttribute("src", "assets/images/hero-opcao-homem-correndo.webp");
  await expect(heroGallery.locator(".product-stamp")).toBeHidden();
  await page.screenshot({ path: "qa/hero-galeria-homem.png", fullPage: false });
  await heroGallery.locator('[data-gallery-image="assets/images/hero-opcao-bexiga-prostata-v2.webp"]').click();
  await expect(heroGallery.locator("[data-product-image]")).toHaveAttribute("src", "assets/images/hero-opcao-bexiga-prostata-v2.webp");
  await page.screenshot({ path: "qa/hero-galeria-bexiga.png", fullPage: false });

  await page.locator('[data-checkout-panel] [data-package="1"]').click();
  await expect(page.locator(".package-card.is-selected")).toHaveCount(1);
  await expect(page.locator('.package-card.is-selected[data-package="1"]')).toHaveCount(1);
  await expect(page.locator("[data-purchase-total]")).toHaveText("$ 99.000 COP");
  await expect(page.locator("[data-offer-copy]")).toHaveText("30 días de rutina diaria");

  const links = await page.locator("[data-checkout-link]").evaluateAll((elements) => elements.map((element) => element.href));
  expect(links.every((link) => link.includes("53114445562174:1"))).toBeTruthy();
  expect(links.every((link) => link.includes("checkout%5Bshipping_address%5D%5Bcountry%5D=CO"))).toBeTruthy();

  const productSources = await page.locator("[data-product-image]").evaluateAll((elements) => elements.map((element) => element.getAttribute("src")));
  expect(productSources).toEqual(["assets/images/prosavix-1-frasco.webp"]);

  const faq = page.locator(".faq-list details").first();
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");

  await page.evaluate(() => {
    window.addEventListener("prosavix:cta-click", (event) => {
      window.__lastProsavixCta = event.detail;
    });
  });
  await page.locator('[data-cta-location="after-failures"]').click();
  expect(await page.evaluate(() => window.__lastProsavixCta)).toMatchObject({
    location: "after-failures",
    package: "1",
    value: 99000,
    currency: "COP",
  });

  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  expect(pageErrors).toEqual([]);
});

test("mobile: conteúdo não provoca overflow horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await expect(page.locator('.site-header [data-cta-location="header"]')).toBeVisible();
  await page.locator("#solucion").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.locator("#ingredientes").scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: "qa/local-mobile-clean-full.png", fullPage: true });
  await page.locator('#inicio [data-gallery-image="assets/images/hero-opcao-bexiga-prostata-v2.webp"]').click();
  await expect(page.locator("#inicio [data-product-image]")).toHaveAttribute("src", "assets/images/hero-opcao-bexiga-prostata-v2.webp");
  await page.screenshot({ path: "qa/hero-galeria-mobile-bexiga.png", fullPage: false });
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  await page.locator(".doctor-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".sticky-offer")).toBeVisible();
});

test("mobile 360px: oferta, ingredientes e FAQ permanecem legíveis", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  await expect(page.locator(".ingredients-dark .ingredients-grid article")).toHaveCount(7);
  await page.locator(".faq-list details").last().locator("summary").click();
  await expect(page.locator(".faq-list details").last()).toHaveAttribute("open", "");
});

test("telemetria: pacote, FAQ, rolagem e início de checkout", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__prosavixEvents = [];
    for (const eventName of [
      "prosavix:package-select",
      "prosavix:faq-open",
      "prosavix:scroll-depth",
      "prosavix:checkout-start",
    ]) {
      window.addEventListener(eventName, (event) => window.__prosavixEvents.push({ type: eventName, detail: event.detail }));
    }
    document.querySelector('[data-cta-location="hero"]').addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });

  await page.locator("#inicio").locator('[data-package="1"]').click();
  await page.locator(".faq-list details").first().locator("summary").click();
  await page.locator('[data-cta-location="hero"]').click();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);

  const events = await page.evaluate(() => window.__prosavixEvents);
  expect(events.find((event) => event.type === "prosavix:package-select")?.detail).toMatchObject({ package: "1", value: 99000 });
  expect(events.find((event) => event.type === "prosavix:faq-open")?.detail).toMatchObject({ index: 1 });
  expect(events.find((event) => event.type === "prosavix:checkout-start")?.detail).toMatchObject({ package: "1", value: 99000 });
  expect(events.filter((event) => event.type === "prosavix:scroll-depth").map((event) => event.detail.depth)).toEqual([25, 50, 75, 90]);
});

for (const productPackage of [
  { label: "1 frasco", variantId: 53114445562174, price: 9900000 },
  { label: "3 frascos", variantId: 51142776652094, price: 19800000 },
]) {
  test(`Shopify: carrega a variante de ${productPackage.label}`, async ({ page }) => {
    const countryField = encodeURIComponent("checkout[shipping_address][country]");
    const url = `https://lifemed-prosavix.myshopify.com/cart/${productPackage.variantId}:1?${countryField}=CO`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const cart = await page.evaluate(async () => {
      const response = await fetch("/cart.js", { headers: { Accept: "application/json" } });
      return response.json();
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].variant_id).toBe(productPackage.variantId);
    expect(cart.items[0].final_price).toBe(productPackage.price);
    expect(cart.items[0].quantity).toBe(1);
  });
}
