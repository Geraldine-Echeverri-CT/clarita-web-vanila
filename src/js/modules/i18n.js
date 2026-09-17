// Selector de idioma (ES/EN/FR) y motor de traducción simple:
// - Elementos con data-i18n="clave" reciben textContent.
// - Elementos con data-i18n-html="clave" reciben innerHTML (conserva un <i> inicial si ya existe).
// - Elementos con data-i18n-placeholder="clave" reciben el atributo placeholder.
// Al cambiar de idioma dispara "clarita:languagechange" en document — los módulos que
// renderizan contenido dependiente del idioma (listados, detalle, checkout) escuchan ese
// evento en vez de que este módulo los conozca (evita dependencias circulares).

const I18N = { es: I18N_ES, en: I18N_EN, fr: I18N_FR };

const PAGE_META = {
  "index.html": "home", "quienes-somos.html": "quienes", "servicios.html": "servicios",
  "alojamientos.html": "alojamientos", "alianza-propietarios.html": "alianza", "blogs.html": "blogs",
  "testimoniales.html": "testimoniales", "faq.html": "faq", "contacto.html": "contacto",
  "alojamiento-detalle.html": "alojamientoDetalle", "blog-articulo.html": "blogArticulo", "checkout.html": "checkout",
};

let currentLang = "es";

function getLang() {
  return currentLang;
}

function dict() {
  return I18N[currentLang] || I18N.es;
}

// Resuelve un valor { es, en, fr } al idioma activo; si no es un objeto de idiomas, lo devuelve tal cual.
function t(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[currentLang] || value.es;
  }
  return value;
}

function initI18n() {
  let lang = "es";
  try { lang = localStorage.getItem("clarita-lang") || "es"; } catch (e) {}
  if (!I18N[lang]) lang = "es";
  currentLang = lang;

  // Abrir/cerrar el menú lo maneja el dropdown de Bootstrap (data-bs-toggle="dropdown"
  // en header.html); acá solo se escucha la elección de idioma.
  document.querySelectorAll(".lang-dropdown__menu-button").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  applyTranslations();
  updateLangDropdownUI();
}

function updateLangDropdownUI() {
  document.querySelectorAll(".lang-dropdown").forEach((dropdown) => {
    const label = dropdown.querySelector(".lang-current");
    if (label) label.textContent = currentLang.toUpperCase();
    dropdown.querySelectorAll(".lang-dropdown__menu-button").forEach((btn) => {
      btn.classList.toggle("lang-dropdown__menu-button--active", btn.dataset.lang === currentLang);
    });
  });
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  try { localStorage.setItem("clarita-lang", lang); } catch (e) {}
  updateLangDropdownUI();
  applyTranslations();
  document.dispatchEvent(new CustomEvent("clarita:languagechange", { detail: { lang } }));
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  const d = dict();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (d[key] !== undefined) el.textContent = d[key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (d[key] !== undefined) {
      const icon = el.querySelector("i");
      el.innerHTML = (icon ? icon.outerHTML + " " : "") + d[key];
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (d[key] !== undefined) el.setAttribute("placeholder", d[key]);
  });

  const pageKey = PAGE_META[location.pathname.split("/").pop()];
  if (pageKey && d["meta." + pageKey + ".title"]) {
    document.title = d["meta." + pageKey + ".title"];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", d["meta." + pageKey + ".desc"]);
  }
}
