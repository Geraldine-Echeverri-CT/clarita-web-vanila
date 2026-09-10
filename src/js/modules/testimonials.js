// Renderiza tarjetas de testimonios desde TESTIMONIALS (src/js/data/testimonials.js).

function starsHtml(stars) {
  const full = Math.floor(stars);
  const half = stars % 1 !== 0;
  let html = "";
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  return html;
}

function testiCardHtml(item, d) {
  return '<div class="testi-card">' +
    '<div class="testi-card__stars">' + starsHtml(item.stars) + '</div>' +
    '<p class="testi-card__comment">' + d[item.commentKey] + '</p>' +
    '<div class="testi-card__person">' +
      '<div class="testi-card__avatar">' + item.avatar + '</div>' +
      '<div><strong>' + item.name + '</strong><span>' + d[item.roleKey] + '</span></div>' +
    '</div>' +
  '</div>';
}

function renderTestimonials(targetId, commentKeys) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const d = dict();
  const items = commentKeys ? TESTIMONIALS.filter((it) => commentKeys.includes(it.commentKey)) : TESTIMONIALS;
  grid.innerHTML = items.map((it) => testiCardHtml(it, d)).join("");
}

function initTestimonials() {
  const full = document.getElementById("testi-grid-full");
  const home = document.getElementById("testi-grid-home");
  if (!full && !home) return;
  const render = () => {
    renderTestimonials("testi-grid-full");
    renderTestimonials("testi-grid-home", ["testi.t1", "testi.t2", "testi.t4"]);
  };
  render();
  document.addEventListener("clarita:languagechange", render);
}
