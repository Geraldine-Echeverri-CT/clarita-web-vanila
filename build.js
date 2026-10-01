// Build estático — sin dependencias externas (solo Node "fs"/"path").
//
// Arma cada página final en la raíz del repo a partir de:
//   - src/partials/*.html   (header, footer, lightbox+whatsapp, head común, JSON-LD)
//   - src/pages/*.html      (metadatos de cada página + su <main>)
//
// CSS (src/css/*.css) y JS (src/js/**/*.js) NO pasan por este build: son archivos
// reales, se editan directamente ahí y el navegador los carga tal cual desde esa
// misma ruta (un <link> por cada archivo de src/css/, y un <script> por cada
// archivo de src/js/, en orden de dependencias — ver SCRIPT_ORDER más abajo).
// No son ES modules (type="module"): los módulos ES fallan por CORS cuando el
// .html se abre con doble clic (file://), que es como este sitio se previsualiza.
// La única razón de que exista este script es reutilizar el header/footer entre
// las 12 páginas, algo que HTML puro no permite sin JS en el cliente (malo para
// SEO) o sin un paso de build (esto).
//
// Todo lo que se edita a mano vive bajo src/ — la raíz del repo solo tiene los
// 12 .html generados (lo que efectivamente se despliega).
//
// Uso: node build.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC_PARTIALS = path.join(ROOT, "src", "partials");
const SRC_PAGES = path.join(ROOT, "src", "pages");
const SRC_CSS = path.join(ROOT, "src", "css");
const SRC_FOTOS = path.join(ROOT, "src", "assets", "photos");

const BASE_URL = "https://tu-dominio.com";
// Imagen de preview cuando se comparte el link (WhatsApp, Facebook, etc.) —
// una página puede pisarla con "ogImage: src/assets/photos/otra.webp" en su
// bloque META si conviene una foto más específica para esa página.
const DEFAULT_OG_IMAGE = "src/assets/photos/villa-pool-1.webp";

// Orden de carga: son scripts normales (no ES modules) que comparten el scope
// global, así que cada archivo debe cargar DESPUÉS de lo que usa (los datos antes
// que los módulos que los consumen, y main.js al final porque llama a los init()).
const SCRIPT_ORDER = [
  // Bootstrap 5 (bundle con Popper): navbar/offcanvas y dropdown del header.
  // Va primero y desde CDN, así que no se valida con existsSync más abajo.
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
  "src/js/data/i18n.es.js",
  "src/js/data/i18n.en.js",
  "src/js/data/i18n.fr.js",
  "src/js/data/properties.js",
  "src/js/data/posts.js",
  "src/js/data/testimonials.js",
  "src/js/data/faq.js",
  "src/js/data/service-cards.js",
  "src/js/modules/i18n.js",
  "src/js/modules/lightbox.js",
  "src/js/modules/faq.js",
  "src/js/modules/listings.js",
  "src/js/modules/blog.js",
  "src/js/modules/testimonials.js",
  "src/js/modules/service-cards.js",
  "src/js/modules/detalle-alojamiento.js",
  "src/js/modules/detalle-blog.js",
  "src/js/modules/contact-form.js",
  "src/js/modules/paleta-demo.js", // DEMO PALETAS (temporal)
  "src/js/modules/velo-demo.js",   // DEMO VELO (temporal)
  "src/js/modules/checkout.js",
  "src/js/main.js",
];
const BOOTSTRAP_JS_SRI = "sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz";
const GENERATED_NOTICE =
  "<!-- Generado por build.js a partir de src/pages + src/partials. No editar este archivo a mano: los cambios se pierden en el próximo build. -->";

// Con git core.autocrlf=true (default en Windows) los .html se descargan con
// CRLF: se normaliza a LF para que los regex de abajo (bloque META) funcionen
// igual en cualquier sistema.
function read(relPath) {
  return readNormalized(path.join(ROOT, relPath));
}

function readNormalized(absPath) {
  return fs.readFileSync(absPath, "utf8").replace(/\r\n/g, "\n");
}

function parsePage(raw) {
  const metaMatch = /^<!--META\n([\s\S]*?)\n-->\n/.exec(raw);
  if (!metaMatch) throw new Error("Página sin bloque META");
  const meta = {};
  metaMatch[1].split("\n").forEach((line) => {
    const idx = line.indexOf(": ");
    if (idx === -1) return;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 2).trim();
  });
  const mainHtml = raw.slice(metaMatch[0].length).trim();
  return { meta, mainHtml };
}

function buildHead(meta, headCommon, cssLinksHtml) {
  const url = BASE_URL + "/" + meta.filename;
  const ogTitle = meta.ogTitle || meta.title;
  const ogDescription = meta.ogDescription || meta.description;
  const ogImage = BASE_URL + "/" + (meta.ogImage || DEFAULT_OG_IMAGE);
  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${ogTitle}">`,
    `<meta property="og:description" content="${ogDescription}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    headCommon.trim(),
    cssLinksHtml,
  ].join("\n");
}

function buildCssLinks(cssFiles) {
  // Un <link> por archivo de src/css/ (el prefijo numérico del nombre define el
  // orden real en que se aplican los estilos, por eso se listan alfabéticamente).
  return cssFiles.map((f) => `<link rel="stylesheet" href="src/css/${f}">`).join("\n");
}

function buildNav(headerPartial, activePage) {
  // Marca como activo el link <a class="nav-link nav-links__link" ... data-page="X"> que
  // coincide con la página actual, agregando el modificador BEM y la clase "active" de
  // Bootstrap a la clase ya existente (nunca un segundo atributo class="", que el
  // navegador ignoraría).
  return headerPartial.replace(
    /<a ([^>]*data-page="([^"]+)"[^>]*)>/g,
    (full, attrs, page) => {
      if (page !== activePage) return `<a ${attrs}>`;
      const withModifier = attrs.replace(
        /class="([^"]*)"/,
        (m, classes) => `class="${classes} nav-links__link--active active"`
      );
      return `<a ${withModifier} aria-current="page">`;
    }
  );
}

function main() {
  const headCommon = read("src/partials/head-common.html");
  const headerPartial = read("src/partials/header.html");
  const footerPartial = read("src/partials/footer.html");
  const lightboxWhatsapp = read("src/partials/lightbox-whatsapp.html");
  const jsonLd = read("src/partials/jsonld-local-business.html");

  const pageFiles = fs.readdirSync(SRC_PAGES).filter((f) => f.endsWith(".html"));
  const cssFiles = fs.readdirSync(SRC_CSS).filter((f) => f.endsWith(".css")).sort();
  const cssLinksHtml = buildCssLinks(cssFiles);

  for (const rel of SCRIPT_ORDER) {
    if (/^https?:/.test(rel)) continue;
    if (!fs.existsSync(path.join(ROOT, rel))) throw new Error("Falta " + rel + " (revisar SCRIPT_ORDER en build.js)");
  }
  // DEMO VELO (temporal): la lista de fotos disponibles, para que el panel de
  // la demo permita cambiar la foto del banner. Se va junto con la demo.
  const fotosDemo = fs.readdirSync(SRC_FOTOS).filter((f) => f.endsWith(".webp")).sort();
  const fotosDemoHtml = `<script>window.FOTOS_DEMO = ${JSON.stringify(fotosDemo)};</script>`;

  const scriptTagsHtml = SCRIPT_ORDER.map((rel) =>
    /^https?:/.test(rel)
      ? `<script src="${rel}" integrity="${BOOTSTRAP_JS_SRI}" crossorigin="anonymous"></script>`
      : `<script src="${rel}"></script>`
  ).join("\n");

  for (const filename of pageFiles) {
    const raw = readNormalized(path.join(SRC_PAGES, filename));
    const { meta, mainHtml } = parsePage(raw);
    meta.filename = filename;

    const head = buildHead(meta, headCommon, cssLinksHtml);
    const nav = buildNav(headerPartial, meta.page);

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
${GENERATED_NOTICE}
${head}
</head>
<body>

${nav}

${mainHtml}

${footerPartial}

${lightboxWhatsapp}
${jsonLd}
${fotosDemoHtml}
${scriptTagsHtml}
</body>
</html>
`;

    fs.writeFileSync(path.join(ROOT, filename), html, "utf8");
    console.log("built", filename);
  }

  console.log("src/css (" + cssFiles.length + " archivos) y src/js no se tocan: se editan directamente.");
}

main();
