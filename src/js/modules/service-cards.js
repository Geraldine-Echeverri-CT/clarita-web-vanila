// Renderiza tarjetas .audience-card desde SERVICE_CARDS_FULL / SERVICE_CARDS_HOME
// (src/js/data/service-cards.js).

function serviceCardHtml(card, d) {
  const cls = "audience-card" + (card.modifier ? " " + card.modifier : "");
  const items = card.items
    .map((it) => '<li><i class="fa-solid ' + it.icon + '"></i><span>' + d[it.textKey] + '</span></li>')
    .join("");
  return '<div class="' + cls + '">' +
    '<div class="icon-circle"><i class="fa-solid ' + card.icon + '"></i></div>' +
    '<span class="eyebrow">' + d[card.eyebrowKey] + '</span>' +
    '<h3>' + d[card.titleKey] + '</h3>' +
    '<ul>' + items + '</ul>' +
    '<a href="' + card.ctaHref + '" class="btn btn-primary btn-block">' + d[card.ctaKey] + '</a>' +
  '</div>';
}

function renderServiceCards(targetId, cards) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const d = dict();
  grid.innerHTML = cards.map((c) => serviceCardHtml(c, d)).join("");
}

function initServiceCards() {
  const full = document.getElementById("audience-grid-full");
  const home = document.getElementById("audience-grid-home");
  if (!full && !home) return;
  const render = () => {
    renderServiceCards("audience-grid-full", SERVICE_CARDS_FULL);
    renderServiceCards("audience-grid-home", SERVICE_CARDS_HOME);
  };
  render();
  document.addEventListener("clarita:languagechange", render);
}
