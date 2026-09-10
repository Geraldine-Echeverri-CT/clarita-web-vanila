// Punto de entrada — llama el init() de cada módulo una vez cargado el DOM.
// Todos los archivos de data/ y modules/ se cargan antes que este (scripts
// normales, no ES modules: así funciona también abriendo el .html con doble
// clic, sin servidor — los módulos ES fallan por CORS bajo file://).
// Cada init() revisa si los elementos que necesita existen en la página actual
// (patrón "if (!el) return;"), así que es seguro llamarlos todos desde cualquier página.

document.addEventListener("DOMContentLoaded", () => {
  initI18n();
  initNav();
  initLightbox();
  initFaq();
  initListings();
  initBlog();
  initTestimonials();
  initServiceCards();
  initDetalleAlojamiento();
  initDetalleBlog();
  initContactForm();
  initCheckout();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
