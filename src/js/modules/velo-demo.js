// DEMO VELO (temporal) — barra para ajustar en vivo el contraste entre la foto
// principal y el texto de al lado, en cada página.
//
// Mueve dos variables CSS que usa 04-hero.css:
//   --velo-fuerza / --velo-ancho  → el velo del banner con foto de fondo
//                                   (Alojamientos, Alianza con propietarios)
//   --fundido                     → el desvanecido del borde de la foto hacia
//                                   el texto (Inicio, Quiénes somos, Servicios,
//                                   Contacto)
// Además mide el contraste real del título y la bajada sobre los píxeles de la
// foto, para que al mover la barra se vea si sigue cumpliendo el mínimo legible
// (4.5 para texto chico, 3 para títulos grandes).
//
// Para sacar la demo, ver src/css/96-velo-demo.css.

const VELO_KEY = "clarita-velo";
const VELO_DEFECTO = { fuerza: 0.92, ancho: 92, fundido: 12 };

function veloLeer() {
  try {
    return Object.assign({}, VELO_DEFECTO, JSON.parse(localStorage.getItem(VELO_KEY) || "{}"));
  } catch (e) {
    return Object.assign({}, VELO_DEFECTO);
  }
}

function veloGuardar(valores) {
  try { localStorage.setItem(VELO_KEY, JSON.stringify(valores)); } catch (e) {}
}

function veloAplicar(valores) {
  const raiz = document.documentElement.style;
  raiz.setProperty("--velo-fuerza", String(valores.fuerza));
  raiz.setProperty("--velo-ancho", String(valores.ancho));
  raiz.setProperty("--fundido", String(valores.fundido));
}

// --- contraste real: dibuja la foto como la recorta el navegador, le aplica el
// velo con los valores actuales y mide el peor píxel bajo cada texto ---
function veloLuminancia(r, g, b) {
  const c = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
}

function veloRatio(l1, l2) {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function veloMedirContraste(valores) {
  const img = document.querySelector(".hero-banner-media img");
  if (!img || !img.naturalWidth) return null;
  const caja = img.closest(".hero-banner-media").getBoundingClientRect();
  const ancho = Math.round(caja.width), alto = Math.round(caja.height);
  if (!ancho || !alto) return null;

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho; lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  const escala = Math.max(ancho / img.naturalWidth, alto / img.naturalHeight);
  const dw = img.naturalWidth * escala, dh = img.naturalHeight * escala;
  try {
    ctx.drawImage(img, (ancho - dw) / 2, (alto - dh) * 0.4, dw, dh);
  } catch (e) {
    return null;
  }

  // mismo degradado que 04-hero.css
  const f = valores.fuerza, a = valores.ancho / 100;
  const grad = ctx.createLinearGradient(0, 0, ancho, 0);
  [[0, f], [0.476 * a, f * 0.957], [0.69 * a, f * 0.63], [0.857 * a, f * 0.174], [a, 0]].forEach(([pos, alfa]) => {
    grad.addColorStop(Math.min(1, Math.max(0, pos)), "rgba(37, 89, 87, " + alfa + ")");
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ancho, alto);

  let peor = null;
  let algunoSobreLaFoto = false;
  [".hero-banner-copy h1", ".hero-banner-copy p.lead", ".hero-banner-copy .eyebrow"].forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top > caja.bottom || r.bottom < caja.top) return; // texto fuera de la foto (apilado)
    algunoSobreLaFoto = true;
    const cs = getComputedStyle(el);
    const col = cs.color.match(/[\d.]+/g).map(Number);
    const lumTexto = veloLuminancia(col[0], col[1], col[2]);
    const x = Math.max(0, Math.round(r.left - caja.left));
    const y = Math.max(0, Math.round(r.top - caja.top));
    const w = Math.max(1, Math.min(ancho - x, Math.round(r.width)));
    const h = Math.max(1, Math.min(alto - y, Math.round(r.height)));
    let datos;
    try { datos = ctx.getImageData(x, y, w, h).data; } catch (e) { return; }
    let minimo = 99;
    for (let i = 0; i < datos.length; i += 4 * 5) {
      minimo = Math.min(minimo, veloRatio(lumTexto, veloLuminancia(datos[i], datos[i + 1], datos[i + 2])));
    }
    const tam = parseFloat(cs.fontSize);
    const exigido = (tam >= 24 || (tam >= 18.66 && +cs.fontWeight >= 700)) ? 3 : 4.5;
    const holgura = minimo / exigido;
    if (!peor || holgura < peor.holgura) peor = { valor: minimo, exigido: exigido, holgura: holgura };
  });
  if (!algunoSobreLaFoto) return { apilado: true };
  return peor;
}

function initVeloDemo() {
  const banner = document.querySelector(".hero-banner-media");
  const sangrada = document.querySelector(".hero-split-bleed-media");
  if (!banner && !sangrada) return;

  const valores = veloLeer();
  veloAplicar(valores);

  const panel = document.createElement("div");
  panel.className = "velo-demo";
  panel.innerHTML =
    '<button type="button" class="velo-demo__tirador" aria-expanded="false">' +
      '<i class="ti ti-adjustments-horizontal"></i> <span>Contraste foto/texto</span>' +
    "</button>" +
    '<div class="velo-demo__cuerpo" hidden>' +
      (banner
        ? '<label class="velo-demo__campo">Intensidad del velo <output data-salida="fuerza"></output>' +
          '<input type="range" data-velo="fuerza" min="0" max="1" step="0.02"></label>' +
          '<label class="velo-demo__campo">Hasta dónde llega <output data-salida="ancho"></output>' +
          '<input type="range" data-velo="ancho" min="20" max="100" step="1"></label>' +
          '<p class="velo-demo__medida" data-medida></p>'
        : '<label class="velo-demo__campo">Suavidad del borde <output data-salida="fundido"></output>' +
          '<input type="range" data-velo="fundido" min="0" max="50" step="1"></label>' +
          '<p class="velo-demo__medida">El texto va sobre el fondo crema, no sobre la foto.</p>') +
      '<div class="velo-demo__pie">' +
        '<button type="button" class="velo-demo__reset">Volver a los valores actuales</button>' +
        '<code data-velo-css></code>' +
      "</div>" +
    "</div>";
  document.body.appendChild(panel);

  const cuerpo = panel.querySelector(".velo-demo__cuerpo");
  const tirador = panel.querySelector(".velo-demo__tirador");
  tirador.addEventListener("click", () => {
    const abierto = !cuerpo.hidden;
    cuerpo.hidden = abierto;
    tirador.setAttribute("aria-expanded", abierto ? "false" : "true");
    if (!abierto) refrescar();
  });

  function refrescar() {
    panel.querySelectorAll("[data-velo]").forEach((input) => {
      const clave = input.dataset.velo;
      input.value = valores[clave];
      const salida = panel.querySelector('[data-salida="' + clave + '"]');
      if (salida) salida.textContent = clave === "fuerza" ? Math.round(valores.fuerza * 100) + "%" : valores[clave] + "%";
    });
    const css = panel.querySelector("[data-velo-css]");
    if (css) {
      css.textContent = banner
        ? "--velo-fuerza: " + valores.fuerza + "; --velo-ancho: " + valores.ancho + ";"
        : "--fundido: " + valores.fundido + ";";
    }
    const medida = panel.querySelector("[data-medida]");
    if (medida) {
      const peor = veloMedirContraste(valores);
      if (peor && peor.apilado) {
        medida.textContent = "A este ancho el texto va debajo de la foto, sobre el fondo crema: el velo solo actúa en pantallas de 1200px o más.";
        medida.className = "velo-demo__medida";
      } else if (!peor) {
        medida.textContent = "Contraste: no se puede medir acá.";
        medida.className = "velo-demo__medida";
      } else {
        medida.textContent = "Contraste del texto: " + peor.valor.toFixed(2) + ":1 (mínimo " + peor.exigido + ")";
        medida.className = "velo-demo__medida " + (peor.holgura >= 1 ? "velo-demo__medida--ok" : "velo-demo__medida--falla");
      }
    }
  }

  panel.addEventListener("input", (e) => {
    const input = e.target.closest("[data-velo]");
    if (!input) return;
    valores[input.dataset.velo] = parseFloat(input.value);
    veloAplicar(valores);
    veloGuardar(valores);
    refrescar();
  });

  panel.querySelector(".velo-demo__reset").addEventListener("click", () => {
    Object.assign(valores, VELO_DEFECTO);
    veloAplicar(valores);
    veloGuardar(valores);
    refrescar();
  });

  refrescar();
  window.addEventListener("resize", refrescar);
}
