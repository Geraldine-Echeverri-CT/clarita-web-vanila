// Lightbox para la galería / recorrido del sitio (elementos .tour-item).
// Si el .tour-item clickeado vive dentro de un contenedor con
// data-gallery="[...]" (JSON con todas las fotos, no solo las que se ven
// como miniatura — ver detalle-alojamiento.js), el lightbox navega esa
// lista completa con flechas/teclado en vez de mostrar una sola imagen suelta.
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;
  const img = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-nav--prev");
  const nextBtn = lightbox.querySelector(".lightbox-nav--next");
  const counter = lightbox.querySelector(".lightbox-counter");

  let photos = [];
  let index = 0;

  function show(i) {
    if (!photos.length) return;
    index = (i + photos.length) % photos.length;
    img.src = photos[index].src;
    img.alt = photos[index].alt;
    const multi = photos.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
    counter.hidden = !multi;
    if (multi) counter.textContent = (index + 1) + " / " + photos.length;
  }

  // Delegado en document: funciona también para galerías creadas/actualizadas dinámicamente.
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".tour-item");
    if (!item) return;
    const itemImg = item.querySelector("img");
    if (!itemImg || !itemImg.src) return;

    const galleryEl = item.closest("[data-gallery]");
    if (galleryEl) {
      try { photos = JSON.parse(galleryEl.dataset.gallery); } catch (err) { photos = [{ src: itemImg.src, alt: itemImg.alt }]; }
    } else {
      photos = [{ src: itemImg.src, alt: itemImg.alt }];
    }
    const startIndex = item.dataset.index !== undefined ? parseInt(item.dataset.index, 10) : 0;
    show(startIndex);
    lightbox.classList.add("lightbox--open");
  });

  const close = () => lightbox.classList.remove("lightbox--open");
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () => show(index + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("lightbox--open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });
}
