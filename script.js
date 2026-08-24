const PROSAVIX_CONFIG = {
  storeDomain: "lifemed-prosavix.myshopify.com",
  countryCode: "CO",
  currency: "COP",
  rating: 4.8,
  reviewCount: 1178,
  guaranteeDays: 180,
  packages: {
    1: {
      variantId: "53114445562174",
      price: 99000,
      perBottle: 99000,
      image: "assets/images/prosavix-1-frasco.webp",
      imageAlt: "Frasco individual de Prosavix",
      label: "1 frasco",
      offerText: "30 días de rutina diaria",
    },
    3: {
      variantId: "51142776652094",
      price: 198000,
      perBottle: 66000,
      image: "assets/images/prosavix-3-frascos.webp",
      imageAlt: "Kit de tres frascos de Prosavix",
      label: "3 frascos",
      offerText: "Ahorras $99.000 con el kit de 3 frascos",
    },
  },
};

let selectedPackage = "3";

function emitProsavixEvent(domEventName, analyticsEventName, detail) {
  window.dispatchEvent(new CustomEvent(domEventName, { detail }));
  window.dataLayer?.push({ event: analyticsEventName, ...detail });
}

function formatCop(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: PROSAVIX_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function checkoutUrl(packageKey) {
  const productPackage = PROSAVIX_CONFIG.packages[packageKey];
  const store = PROSAVIX_CONFIG.storeDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!productPackage || !store || !/^\d+$/.test(productPackage.variantId)) return "";

  const countryField = encodeURIComponent("checkout[shipping_address][country]");
  return `https://${store}/cart/${productPackage.variantId}:1?${countryField}=${PROSAVIX_CONFIG.countryCode}`;
}

function renderStaticPrices() {
  Object.entries(PROSAVIX_CONFIG.packages).forEach(([packageKey, productPackage]) => {
    document.querySelectorAll(`[data-price="${packageKey}"]`).forEach((element) => {
      element.textContent = formatCop(productPackage.price);
    });
    document.querySelectorAll(`[data-unit="${packageKey}"]`).forEach((element) => {
      element.textContent = `${formatCop(productPackage.perBottle)} por frasco`;
    });
  });
}

function selectPackage(packageKey) {
  const productPackage = PROSAVIX_CONFIG.packages[packageKey];
  if (!productPackage) return;

  selectedPackage = packageKey;
  const url = checkoutUrl(packageKey);

  document.querySelectorAll("[data-package]").forEach((button) => {
    const selected = button.dataset.package === packageKey;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", String(selected));
  });

  document.querySelectorAll("[data-gallery-package]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.galleryPackage === packageKey);
  });

  document.querySelectorAll("[data-product-image]").forEach((image) => {
    image.src = productPackage.image;
    image.alt = productPackage.imageAlt;
    image.classList.remove("is-gallery-editorial");
    image.closest(".main-product-image")?.querySelector(".product-stamp")?.removeAttribute("hidden");
  });

  document.querySelectorAll(".image-pager").forEach((pager) => {
    pager.querySelectorAll("span").forEach((dot, index) => dot.classList.toggle("is-active", index === (packageKey === "3" ? 0 : 1)));
  });

  document.querySelectorAll("[data-purchase-total]").forEach((element) => {
    element.textContent = `${formatCop(productPackage.price)} COP`;
  });

  document.querySelectorAll("[data-offer-copy]").forEach((element) => {
    element.textContent = productPackage.offerText;
  });

  document.querySelectorAll(".savings-stamp").forEach((element) => {
    element.hidden = packageKey !== "3";
  });

  document.querySelectorAll("[data-checkout-status]").forEach((element) => {
    element.setAttribute("aria-live", "polite");
    element.textContent = `${productPackage.label} listo para continuar al checkout.`;
  });

  document.querySelectorAll("[data-checkout-link]").forEach((link) => {
    link.href = url || "#oferta-final";
    link.setAttribute("aria-label", `Comprar ${productPackage.label} de Prosavix`);
    link.classList.toggle("is-disabled", !url);
  });

  const stickyPackage = document.querySelector("[data-sticky-package]");
  const stickyPrice = document.querySelector("[data-sticky-price]");
  if (stickyPackage) stickyPackage.textContent = productPackage.label;
  if (stickyPrice) stickyPrice.textContent = `${formatCop(productPackage.price)} COP`;
}

document.querySelectorAll("[data-package]").forEach((button) => {
  button.addEventListener("click", () => {
    const packageKey = button.dataset.package;
    selectPackage(packageKey);
    emitProsavixEvent("prosavix:package-select", "prosavix_package_select", {
      location: button.closest("#inicio") ? "hero" : "final-offer",
      package: packageKey,
      value: PROSAVIX_CONFIG.packages[packageKey]?.price,
      currency: PROSAVIX_CONFIG.currency,
    });
  });
});

document.querySelectorAll("[data-gallery-package]").forEach((button) => {
  button.addEventListener("click", () => selectPackage(button.dataset.galleryPackage));
});

document.querySelectorAll("[data-gallery-image]").forEach((button) => {
  button.addEventListener("click", () => {
    const gallery = button.closest(".gallery-column");
    const image = gallery?.querySelector("[data-product-image]");
    if (!gallery || !image) return;

    image.src = button.dataset.galleryImage;
    image.alt = button.dataset.galleryAlt || "Imagen informativa de Prosavix";
    image.classList.add("is-gallery-editorial");
    gallery.querySelector(".product-stamp")?.setAttribute("hidden", "");

    const buttons = [...gallery.querySelectorAll(".thumb")];
    buttons.forEach((galleryButton) => galleryButton.classList.toggle("is-active", galleryButton === button));
    gallery.querySelectorAll(".image-pager span").forEach((dot, index) => dot.classList.toggle("is-active", buttons[index] === button));
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-checkout-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!checkoutUrl(selectedPackage)) {
      event.preventDefault();
      document.querySelector("#oferta-final")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    emitProsavixEvent("prosavix:checkout-start", "prosavix_checkout_start", {
      location: link.dataset.ctaLocation,
      package: selectedPackage,
      value: PROSAVIX_CONFIG.packages[selectedPackage]?.price,
      currency: PROSAVIX_CONFIG.currency,
    });
  });
});

document.querySelectorAll("[data-cta-location]").forEach((link) => {
  link.addEventListener("click", () => {
    const detail = {
      location: link.dataset.ctaLocation,
      package: selectedPackage,
      value: PROSAVIX_CONFIG.packages[selectedPackage]?.price,
      currency: PROSAVIX_CONFIG.currency,
    };

    emitProsavixEvent("prosavix:cta-click", "prosavix_cta_click", detail);
  });
});

document.querySelectorAll(".faq-list details").forEach((details, index) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    emitProsavixEvent("prosavix:faq-open", "prosavix_faq_open", {
      index: index + 1,
      question: details.querySelector("summary")?.textContent?.replace(/\s+/g, " ").trim(),
    });
  });
});

const trackedScrollDepths = new Set();
let scrollFramePending = false;

function trackScrollDepth() {
  const availableScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (availableScroll <= 0) return;
  const depth = Math.min(100, Math.round((window.scrollY / availableScroll) * 100));

  [25, 50, 75, 90].forEach((checkpoint) => {
    if (depth < checkpoint || trackedScrollDepths.has(checkpoint)) return;
    trackedScrollDepths.add(checkpoint);
    emitProsavixEvent("prosavix:scroll-depth", "prosavix_scroll_depth", { depth: checkpoint });
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (scrollFramePending) return;
    scrollFramePending = true;
    window.requestAnimationFrame(() => {
      trackScrollDepth();
      scrollFramePending = false;
    });
  },
  { passive: true },
);

const stickyOffer = document.querySelector(".sticky-offer");
const firstCheckout = document.querySelector("[data-checkout-panel]");
const siteHeader = document.querySelector(".site-header");

if (stickyOffer && firstCheckout && "IntersectionObserver" in window) {
  const checkoutObserver = new IntersectionObserver(
    ([entry]) => stickyOffer.classList.toggle("is-visible", !entry.isIntersecting),
    { threshold: 0.06 },
  );
  checkoutObserver.observe(firstCheckout);
}

if (siteHeader) {
  const updateHeaderState = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

if ("IntersectionObserver" in window) {
  const sectionLinks = new Map(
    [...document.querySelectorAll('.site-header nav a[href^="#"]:not(.nav-buy)')].map((link) => [
      link.getAttribute("href")?.slice(1),
      link,
    ]),
  );

  const navigationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link, sectionId) => {
          link.classList.toggle("is-current", sectionId === entry.target.id);
        });
      });
    },
    { rootMargin: "-25% 0px -65%", threshold: 0 },
  );

  sectionLinks.forEach((_link, sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) navigationObserver.observe(section);
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

renderStaticPrices();
selectPackage(selectedPackage);
