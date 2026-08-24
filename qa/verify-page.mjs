import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
const script = await readFile(resolve(root, "script.js"), "utf8");

const requiredSections = [
  "site-header",
  "checkout-panel",
  "doctor-section",
  "discovery-section",
  "cycle-story-section",
  "treatments-analysis",
  "steps-section",
  "testimonials-section",
  "ingredients-section",
  "offer-summary-section",
  "oferta-final",
  "faq-section",
];

for (const section of requiredSections) {
  assert.ok(html.includes(section), `Seção ausente: ${section}`);
}

assert.equal((html.match(/data-checkout-panel/g) || []).length, 1, "Deve existir apenas um checkout completo");
assert.equal((html.match(/class="testimonial-card/g) || []).length, 5, "Devem existir cinco provas sociais principais");
assert.equal((html.match(/class="ingredient-photo/g) || []).length, 7, "Devem existir sete imagens de ingredientes");
assert.equal((html.match(/class="ingredient-pillar/g) || []).length, 7, "Cada ingrediente deve informar seu pilar");
assert.equal((html.match(/class="faq-number/g) || []).length, 6, "Devem existir seis perguntas frequentes");
assert.equal((html.match(/class="page-width treatment-detail-grid/g) || []).length, 1, "Comparação de tratamentos ausente");
assert.equal((html.match(/cycle-story-grid/g) || []).length, 1, "Ciclo do problema ausente");
assert.equal((html.match(/class="hero-proof/g) || []).length, 1, "Prova social integrada ao hero ausente");
assert.ok(html.includes("1.178 opiniones"), "Contagem de avaliações ausente");
assert.ok(html.toLowerCase().includes("garantía de 180 días"), "Garantia de 180 dias ausente");
assert.ok(html.includes("Dr. Juan Rivera"), "Apresentação do médico ausente");
assert.ok(script.includes('variantId: "53114445562174"'), "Variante de 1 frasco ausente");
assert.ok(script.includes('variantId: "51142776652094"'), "Variante de 3 frascos ausente");
assert.ok(script.includes('countryCode: "CO"'), "Mercado colombiano ausente");
assert.ok(css.includes("overflow-x: clip"), "Proteção contra overflow mobile ausente");
assert.ok(script.includes('"prosavix:cta-click"'), "Instrumentação de CTA ausente");
assert.ok(script.includes('"prosavix:package-select"'), "Instrumentação de seleção de pacote ausente");
assert.ok(script.includes('"prosavix:faq-open"'), "Instrumentação de FAQ ausente");
assert.ok(script.includes('"prosavix:scroll-depth"'), "Instrumentação de profundidade ausente");
assert.ok(script.includes('"prosavix:checkout-start"'), "Instrumentação de checkout ausente");
assert.ok(html.includes('data-cta-location="header"'), "CTA do header ausente");
assert.ok(html.includes('assets/images/lifemed-logo-header-v3.webp'), "Logo LifeMed no header ausente");
assert.ok((html.match(/loading="lazy"/g) || []).length >= 10, "Lazy loading abaixo da dobra insuficiente");
assert.equal((html.match(/prosavix-step-(?:botanico|confort|nutricional)-v2\.webp/g) || []).length, 3, "As três imagens comerciais das etapas devem estar presentes");

const localAssets = [...html.matchAll(/(?:src)="(assets\/images\/[^"]+)"/g)].map((match) => match[1]);
for (const asset of new Set(localAssets)) {
  await access(resolve(root, asset));
}

console.log(`QA estrutural concluído: ${new Set(localAssets).size} assets locais verificados.`);
