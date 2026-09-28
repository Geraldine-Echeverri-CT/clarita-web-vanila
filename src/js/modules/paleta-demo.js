// DEMO PALETAS (temporal) — selector para ver el sitio con las tres paletas
// propuestas en el PPT. Los colores viven en src/css/97-paletas-demo.css; acá
// solo se guarda la elección y se cambia el logo del header, que es un PNG por
// color. Para sacar la demo, ver las instrucciones en ese archivo CSS.

const PALETAS = {
  "1": { logo: "src/assets/logo-paleta1.png" },
  "2": { logo: "src/assets/logo-petroleo.png" },
  "3": { logo: "src/assets/logo-paleta3.png" },
};
const PALETA_KEY = "clarita-paleta";

function aplicarPaleta(id) {
  if (!PALETAS[id]) id = "2";
  // La paleta 2 es la de 00-tokens.css: sin atributo, sin overrides.
  if (id === "2") document.documentElement.removeAttribute("data-paleta");
  else document.documentElement.setAttribute("data-paleta", id);

  document.querySelectorAll(".site-header .logo-img").forEach((img) => {
    img.src = PALETAS[id].logo;
  });
  document.querySelectorAll("[data-paleta-actual]").forEach((el) => {
    el.textContent = "P" + id;
  });
  document.querySelectorAll("[data-paleta-opcion]").forEach((btn) => {
    btn.classList.toggle("paleta-demo__menu-button--active", btn.dataset.paletaOpcion === id);
  });

  // El header es sticky con backdrop-filter: queda en una capa aparte que
  // Chrome no repinta cuando cambian las variables de color. Se lo obliga a
  // recalcular ocultándolo un instante (no se llega a ver).
  const header = document.querySelector(".site-header");
  if (header) {
    header.style.display = "none";
    void header.offsetHeight;
    header.style.display = "";
  }
}

function initPaletaDemo() {
  const botones = document.querySelectorAll("[data-paleta-opcion]");
  if (!botones.length) return;

  let guardada = "2";
  try { guardada = localStorage.getItem(PALETA_KEY) || "2"; } catch (e) {}
  aplicarPaleta(guardada);

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.paletaOpcion;
      try { localStorage.setItem(PALETA_KEY, id); } catch (e) {}
      aplicarPaleta(id);
    });
  });
}
