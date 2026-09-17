// Listados de blog (grid de la página /blogs.html y el mini-grid del home), renderizados desde POSTS.
//
function renderBlogsListado(targetId, limit) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const d = dict();
  let slugs = Object.keys(POSTS);
  if (limit) slugs = slugs.slice(0, limit);
  grid.innerHTML = slugs.map((slug) => {
    const post = POSTS[slug];
    return '<div class="col"><a href="blog-articulo.html?post=' + slug + '" class="blog-card">' +
      '<div class="blog-card__thumb"><img src="' + post.cover + '" alt="' + t(post.titulo) + '" loading="lazy" decoding="async"></div>' +
      '<div class="blog-card__body">' +
        '<span class="blog-card__date">' + t(post.fecha) + '</span>' +
        '<h3 class="blog-card__title">' + t(post.titulo) + '</h3>' +
        '<p class="blog-card__excerpt">' + t(post.extracto) + '</p>' +
        '<span class="blog-card__read-more">' + d["common.verMas"] + ' <i class="fa-solid fa-arrow-right"></i></span>' +
      '</div>' +
    '</a></div>';
  }).join("");
}

function renderAll() {
  renderBlogsListado("blogs-grid");
  renderBlogsListado("home-blog-grid", 3);
}

function initBlog() {
  if (!document.getElementById("blogs-grid") && !document.getElementById("home-blog-grid")) return;
  renderAll();
  document.addEventListener("clarita:languagechange", renderAll);
}
