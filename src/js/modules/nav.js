// Menú móvil (hamburguesa) del header.
// Ganchos de JS: [data-nav-toggle] / [data-nav-menu] — la clase "nav-links--open"
// solo controla estilos, no la busca ningún selector de comportamiento.
function initNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-menu]");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("nav-links--open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    links.classList.remove("nav-links--open");
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));
}
