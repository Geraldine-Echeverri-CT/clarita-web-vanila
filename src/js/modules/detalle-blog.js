// Página de artículo de blog (blog-articulo.html?post=<slug>).

let currentPostSlug = null;

function renderBlogArticulo() {
  const slug = currentPostSlug;
  const post = POSTS[slug];

  document.title = t(post.titulo) + " | Clarita Property Care";
  document.getElementById("articulo-titulo").textContent = t(post.titulo);
  document.getElementById("articulo-fecha").textContent = t(post.fecha);
  const coverImg = document.getElementById("articulo-cover");
  coverImg.src = post.cover;
  coverImg.alt = t(post.titulo);

  const bodyEl = document.getElementById("articulo-cuerpo");
  bodyEl.innerHTML = "";
  t(post.contenido).forEach((parrafo) => {
    const p = document.createElement("p");
    p.textContent = parrafo;
    bodyEl.appendChild(p);
  });

  const relacionadosEl = document.getElementById("articulos-relacionados");
  if (relacionadosEl) {
    relacionadosEl.innerHTML = "";
    Object.keys(POSTS).filter((k) => k !== slug).slice(0, 3).forEach((k) => {
      const rp = POSTS[k];
      const card = document.createElement("a");
      card.href = "blog-articulo.html?post=" + k;
      card.className = "blog-card";
      card.innerHTML =
        '<div class="blog-card__thumb"><img src="' + rp.cover + '" alt="' + t(rp.titulo) + '" loading="lazy" decoding="async"></div>' +
        '<div class="blog-card__body"><span class="blog-card__date">' + t(rp.fecha) + '</span><h3 class="blog-card__title">' + t(rp.titulo) + '</h3><p class="blog-card__excerpt">' + t(rp.extracto) + '</p></div>';
      const col = document.createElement("div");
      col.className = "col";
      col.appendChild(card);
      relacionadosEl.appendChild(col);
    });
  }
}

function initDetalleBlog() {
  const root = document.getElementById("articulo-blog");
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  let slug = params.get("post");
  if (!POSTS[slug]) slug = Object.keys(POSTS)[0];
  currentPostSlug = slug;
  renderBlogArticulo();
  document.addEventListener("clarita:languagechange", () => { if (currentPostSlug) renderBlogArticulo(); });
}
