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

// Cada página guarda su propio velo: la clave lleva el nombre del archivo, así
// lo que se ajusta en Alojamientos no cambia el de Contacto.
const VELO_KEY = "clarita-velo:" + (location.pathname.split("/").pop() || "index.html");
// alto y encuadre: alto del banner en px y qué parte de la foto se ve (0 = la
// parte de arriba, 100 = la de abajo), ya que al recortar por relación de
// aspecto siempre se pierde una franja. foto: archivo de src/assets/photos.
const VELO_DEFECTO = { fuerza: 0.92, ancho: 96, fundido: 12, color: "#255957", alto: 0, encuadre: null, foto: "" };

// alto 0 y encuadre null significan "lo que define el diseño para esta página":
// la demo no los pisa hasta que se mueve la barra.
function veloEncuadreEfectivo(valores) {
  if (valores.encuadre !== null && valores.encuadre !== undefined) return valores.encuadre;
  const img = document.querySelector(".hero-banner-media img");
  if (!img) return 40;
  const y = getComputedStyle(img).objectPosition.split(" ")[1];
  return parseFloat(y) || 40;
}

// Colores rápidos: se leen de la paleta activa, así las muestras cambian junto
// con el selector de paletas (P1/P2/P3).
function veloColoresPaleta() {
  const cs = getComputedStyle(document.documentElement);
  const tomar = (nombre) => cs.getPropertyValue(nombre).trim();
  return [
    { nombre: "Petróleo oscuro", color: tomar("--petroleo-oscuro") },
    { nombre: "Petróleo", color: tomar("--petroleo") },
    { nombre: "Ocre", color: tomar("--dorado") },
    { nombre: "Beige", color: tomar("--crema-2") },
    { nombre: "Negro", color: "#1c1f1b" },
  // Solo hex: es lo que entiende el selector de color del navegador.
  ].filter((c) => /^#[0-9a-f]{3,8}$/i.test(c.color));
}

function veloHexARgb(hex) {
  const h = hex.trim().replace("#", "");
  const largo = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(largo.slice(i, i + 2), 16));
}

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
  // Las variables se ponen en el hero de esta página, no en :root: el velo es
  // de cada vista y no se arrastra a las demás.
  const heros = document.querySelectorAll(".hero-banner, .hero-split-bleed");
  const rgb = veloHexARgb(valores.color);
  heros.forEach((hero) => {
    hero.style.setProperty("--velo-fuerza", String(valores.fuerza));
    hero.style.setProperty("--velo-ancho", String(valores.ancho));
    hero.style.setProperty("--fundido", String(valores.fundido));
    hero.style.setProperty("--velo-rgb", rgb.join(", "));
    // alto 0 / encuadre null = los que trae el diseño de esa página
    if (valores.alto) hero.style.setProperty("--banner-alto", valores.alto + "px");
    else hero.style.removeProperty("--banner-alto");
    if (valores.encuadre !== null && valores.encuadre !== undefined) hero.style.setProperty("--banner-encuadre", valores.encuadre + "%");
    else hero.style.removeProperty("--banner-encuadre");
  });

  if (valores.foto) {
    const img = document.querySelector(".hero-banner-media img");
    if (img && !img.src.endsWith(valores.foto)) img.src = "src/assets/photos/" + valores.foto;
  }

  // Con un velo claro (beige, por ejemplo) el texto blanco no se leería: el
  // banner pasa a los colores oscuros, los mismos que usa en celular.
  const claro = veloLuminancia(rgb[0], rgb[1], rgb[2]) > 0.35;
  document.querySelectorAll(".hero-banner").forEach((el) => {
    el.classList.toggle("hero-banner--velo-claro", claro);
  });
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
    // el recorte sigue el encuadre elegido, igual que object-position
    ctx.drawImage(img, (ancho - dw) / 2, (alto - dh) * (veloEncuadreEfectivo(valores) / 100), dw, dh);
  } catch (e) {
    return null;
  }

  // mismo degradado que 04-hero.css, con el color elegido
  const f = valores.fuerza, a = valores.ancho / 100;
  const rgb = veloHexARgb(valores.color).join(", ");
  const grad = ctx.createLinearGradient(0, 0, ancho, 0);
  [[0, f], [0.476 * a, f * 0.957], [0.69 * a, f * 0.63], [0.857 * a, f * 0.174], [a, 0]].forEach(([pos, alfa]) => {
    grad.addColorStop(Math.min(1, Math.max(0, pos)), "rgba(" + rgb + ", " + alfa + ")");
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
        ? '<label class="velo-demo__campo">Foto del banner' +
            '<select class="velo-demo__select" data-velo-foto></select>' +
          "</label>" +
          '<label class="velo-demo__campo">Alto del banner <output data-salida="alto"></output>' +
          '<input type="range" data-velo="alto" min="240" max="760" step="10"></label>' +
          '<label class="velo-demo__campo">Qué parte de la foto se ve <output data-salida="encuadre"></output>' +
          '<input type="range" data-velo="encuadre" min="0" max="100" step="1"></label>' +
          '<label class="velo-demo__campo">Intensidad del velo <output data-salida="fuerza"></output>' +
          '<input type="range" data-velo="fuerza" min="0" max="1" step="0.02"></label>' +
          '<label class="velo-demo__campo">Hasta dónde llega <output data-salida="ancho"></output>' +
          '<input type="range" data-velo="ancho" min="20" max="100" step="1"></label>' +
          '<div class="velo-demo__campo">Color del velo' +
            '<div class="velo-demo__colores" data-colores></div>' +
            '<label class="velo-demo__custom">Otro color' +
              '<input type="color" data-velo-color-custom>' +
            "</label>" +
          "</div>" +
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

  // Muestras de color de la paleta activa (se rehacen si cambia la paleta)
  const contenedorColores = panel.querySelector("[data-colores]");
  function pintarColores() {
    if (!contenedorColores) return;
    contenedorColores.innerHTML = veloColoresPaleta().map((c) =>
      '<button type="button" class="velo-demo__color" data-velo-color="' + c.color + '" title="' + c.nombre + '" aria-label="' + c.nombre + '" style="background:' + c.color + '"></button>'
    ).join("");
    contenedorColores.querySelectorAll("[data-velo-color]").forEach((b) => {
      b.classList.toggle("velo-demo__color--activo", b.dataset.veloColor.toLowerCase() === valores.color.toLowerCase());
    });
  }

  // Lista de fotos disponibles (la publica build.js en window.FOTOS_DEMO)
  const selectorFoto = panel.querySelector("[data-velo-foto]");
  if (selectorFoto) {
    const actual = (document.querySelector(".hero-banner-media img") || {}).src || "";
    const laDeLaPagina = actual.split("/").pop();
    const fotos = (window.FOTOS_DEMO || []).slice();
    if (!valores.foto) valores.foto = laDeLaPagina;
    selectorFoto.innerHTML = fotos.map((f) =>
      '<option value="' + f + '"' + (f === valores.foto ? " selected" : "") + ">" +
      f.replace(".webp", "") + (f === laDeLaPagina ? " (la de esta página)" : "") + "</option>"
    ).join("");
  }

  function refrescar() {
    panel.querySelectorAll("[data-velo]").forEach((input) => {
      const clave = input.dataset.velo;
      // alto 0 significa "el del diseño": la barra arranca en el alto real
      if (clave === "alto" && !valores.alto) {
        input.value = Math.round((document.querySelector(".hero-banner") || {}).offsetHeight || 340);
      } else if (clave === "encuadre") {
        input.value = veloEncuadreEfectivo(valores);
      } else {
        input.value = valores[clave];
      }
      const salida = panel.querySelector('[data-salida="' + clave + '"]');
      if (!salida) return;
      if (clave === "fuerza") salida.textContent = Math.round(valores.fuerza * 100) + "%";
      else if (clave === "alto") salida.textContent = input.value + " px";
      else salida.textContent = input.value + "%";
    });
    pintarColores();
    const custom = panel.querySelector("[data-velo-color-custom]");
    if (custom) custom.value = valores.color;
    const css = panel.querySelector("[data-velo-css]");
    if (css) {
      css.textContent = banner
        ? "foto: " + valores.foto + " · alto: " + (valores.alto || "el del diseño") +
          " · encuadre: " + veloEncuadreEfectivo(valores) + "% · velo: " + veloHexARgb(valores.color).join(",") +
          " al " + Math.round(valores.fuerza * 100) + "% hasta " + valores.ancho + "%"
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

  function cambiar(clave, valor) {
    valores[clave] = valor;
    veloAplicar(valores);
    veloGuardar(valores);
    refrescar();
  }

  panel.addEventListener("input", (e) => {
    const custom = e.target.closest("[data-velo-color-custom]");
    if (custom) { cambiar("color", custom.value); return; }
    const input = e.target.closest("[data-velo]");
    if (!input) return;
    cambiar(input.dataset.velo, parseFloat(input.value));
  });

  panel.addEventListener("click", (e) => {
    const muestra = e.target.closest("[data-velo-color]");
    if (muestra) cambiar("color", muestra.dataset.veloColor);
  });

  panel.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-velo-foto]");
    if (!sel) return;
    const img = document.querySelector(".hero-banner-media img");
    valores.foto = sel.value;
    if (img) {
      img.src = "src/assets/photos/" + sel.value;
      // la medición necesita la foto ya decodificada
      img.decode().then(refrescar).catch(refrescar);
    }
    veloGuardar(valores);
  });

  // Si cambia la paleta, las muestras y el velo se actualizan solos.
  document.addEventListener("clarita:languagechange", refrescar);
  new MutationObserver(() => { pintarColores(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-paleta"] });

  panel.querySelector(".velo-demo__reset").addEventListener("click", () => {
    Object.assign(valores, VELO_DEFECTO);
    veloAplicar(valores);
    veloGuardar(valores);
    refrescar();
  });

  refrescar();
  window.addEventListener("resize", refrescar);
}
