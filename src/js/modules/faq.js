// Renderiza y controla el acordeón de preguntas frecuentes desde FAQ_CATEGORIES
// (src/js/data/faq.js). El gancho de JS para abrir/cerrar es [data-faq-toggle],
// no una clase de estilo — así un rename de clases CSS no rompe el comportamiento.
// Usa delegación de eventos en el contenedor porque el contenido se re-renderiza
// al cambiar de idioma (los listeners puestos a mano se perderían).

function faqItemHtml(item, d) {
  return '<div class="faq-item">' +
    '<button class="faq-item__question" data-faq-toggle><span>' + d[item.q] + '</span> <i class="fa-solid fa-plus"></i></button>' +
    '<div class="faq-item__answer"><p>' + d[item.a] + '</p></div>' +
  '</div>';
}

function renderFaqFull(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const d = dict();
  container.innerHTML = FAQ_CATEGORIES.map((cat) =>
    '<h3 class="faq-category"><i class="fa-solid ' + cat.icon + '" style="color:var(--' + cat.color + ');margin-right:8px;"></i><span>' + d[cat.labelKey] + '</span></h3>' +
    cat.items.map((item) => faqItemHtml(item, d)).join("")
  ).join("");
}

function renderFaqFeatured(targetId, keys) {
  const container = document.getElementById(targetId);
  if (!container) return;
  const d = dict();
  const allItems = FAQ_CATEGORIES.reduce((acc, cat) => acc.concat(cat.items), []);
  const items = allItems.filter((it) => keys.includes(it.q));
  container.innerHTML = items.map((item) => faqItemHtml(item, d)).join("");
}

function initFaqToggle(container) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-faq-toggle]");
    if (!btn) return;
    const item = btn.closest(".faq-item");
    const wasOpen = item.classList.contains("faq-item--open");
    item.parentElement.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("faq-item--open"));
    if (!wasOpen) item.classList.add("faq-item--open");
  });
}

function initFaq() {
  const full = document.getElementById("faq-list-full");
  const home = document.getElementById("faq-list-home");
  if (!full && !home) return;

  const render = () => {
    renderFaqFull("faq-list-full");
    renderFaqFeatured("faq-list-home", FAQ_FEATURED_KEYS);
  };
  render();
  document.addEventListener("clarita:languagechange", render);

  if (full) initFaqToggle(full);
  if (home) initFaqToggle(home);
}
