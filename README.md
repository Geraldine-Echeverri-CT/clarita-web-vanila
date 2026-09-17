# Clarita Property Care — sitio web

Sitio estático (HTML + CSS + JS, sin bundler; usa Bootstrap 5 desde CDN para la grilla responsive y el menú) para Clarita Property Care, gestión de propiedades y hospitalidad en Nosara, Costa Rica.

## Cómo correrlo en local

```bash
npx -y http-server -p 8791 -c-1 .
```

Abrí `http://localhost:8791/index.html`. También podés abrir cualquier `.html` de la raíz con doble clic (sin servidor) — el sitio está pensado para andar así, ver [por qué no hay ES modules](#por-qué-no-hay-es-modules).

---

## Estructura de archivos

```
src/
  partials/    → pedazos de HTML repetidos en las 12 páginas
    header.html                → nav + logo + selector de idioma + botón WhatsApp
    footer.html                → columnas de links + redes + copyright
    head-common.html           → meta tags, fuentes, favicon (igual en todas)
    jsonld-local-business.html → structured data para SEO (Google)
    lightbox-whatsapp.html     → el modal de imagen ampliada + el botón flotante de WhatsApp

  pages/       → el contenido único de cada página (12 archivos = 12 páginas)
    index.html, quienes-somos.html, servicios.html, alojamientos.html,
    alojamiento-detalle.html, alianza-propietarios.html, contacto.html,
    checkout.html, blogs.html, blog-articulo.html, testimoniales.html, faq.html
    → cada uno empieza con un bloque <!--META ...--> (title, description, page)
      y sigue con el <main> de esa página nada más (sin header/footer/head).

  css/         → un archivo por sección de UI, numerado por orden de carga
  js/
    data/      → "base de datos" del sitio: objetos JS planos (ver más abajo)
    modules/   → un archivo por funcionalidad (nav, listados, checkout, i18n...)
    main.js    → arranca todo: llama el init() de cada módulo en DOMContentLoaded

  assets/      → logo, fotos (src/assets/photos/)

build.js                → arma los 12 .html de la raíz a partir de partials/ + pages/
index.html, servicios.html, ...  (en la raíz) → SALIDA de build.js, no se editan a mano
robots.txt, sitemap.xml → SEO, apuntan a los .html de la raíz
```

### La regla más importante

**Todo lo que se edita a mano vive bajo `src/`.** Los 12 `.html` de la raíz (`index.html`, `servicios.html`, etc.) son generados por `build.js` — cualquier cambio hecho directo ahí se pierde la próxima vez que alguien corra `node build.js` (cada archivo generado lo recuerda en un comentario al principio).

| Querés cambiar...                              | Editá...                                    | ¿Hace falta `node build.js`? |
|-------------------------------------------------|----------------------------------------------|:---:|
| El header o el footer (todas las páginas)        | `src/partials/header.html` / `footer.html`   | ✅ Sí |
| El contenido de una página puntual                | `src/pages/<pagina>.html`                     | ✅ Sí |
| Colores, tipografía, espaciado, layout            | el `.css` correspondiente en `src/css/`       | ❌ No (se recarga solo) |
| Cómo se comporta algo (un dropdown, un formulario)| el `.js` correspondiente en `src/js/modules/` | ❌ No |
| Las propiedades, posts de blog, testimonios, FAQ  | el archivo correspondiente en `src/js/data/`  | ❌ No |
| Un texto traducible                                | los 3 `src/js/data/i18n.*.js` (misma clave)   | ❌ No |

CSS y JS se sirven directo desde `src/css/`/`src/js/` (cada página los linkea ahí), así que esos cambios se ven con un simple refresh del navegador. Solo `partials/` y `pages/` pasan por el build porque son los únicos que build.js combina.

### Cómo arma build.js cada página

Por cada archivo en `src/pages/`, build.js pega: `head-common.html` + `<title>`/meta del bloque `<!--META-->` + los `<link>` de todos los `.css` + `header.html` + el `<main>` de esa página + `footer.html` + `lightbox-whatsapp.html` + los `<script>` de todos los `.js` (en un orden fijo de dependencias, ver `SCRIPT_ORDER` dentro de `build.js`) + `jsonld-local-business.html`. El resultado es el `.html` correspondiente en la raíz.

### Por qué no hay ES modules

Los `<script>` son clásicos (sin `type="module"`) y todo vive en un scope global compartido — `function initNav() {}` en `nav.js` es visible desde `main.js` sin `import`/`export`. Es así a propósito: los ES modules fallan por CORS cuando el `.html` se abre con doble clic (protocolo `file://`), y este sitio está pensado para poder revisarse así, sin depender de ningún servidor.

---

## Bootstrap 5

Bootstrap 5.3 se carga desde jsDelivr (con SRI): el CSS en `src/partials/head-common.html`, **antes** de todo `src/css/`, y el JS (bundle con Popper) primero en `SCRIPT_ORDER` de `build.js`. Se usa para:

- **Grilla responsive**: las secciones de columnas (`.split`, tarjetas de servicios/blog/testimonios/alojamientos, footer, formularios, checkout, detalle) son `.row` + `.col-*` / `row-cols-*`. Los breakpoints son los de Bootstrap: `sm` 576px, `md` 768px, `lg` 992px, `xl` 1200px. Para cambiar cuántas columnas se ven en cada tamaño se editan esas clases en el HTML, no el CSS.
- **Header**: `navbar-expand-xl` con **offcanvas** (hamburguesa por debajo de 1200px) y **dropdown** para el selector de idioma.
- Utilidades puntuales (`mt-*`, `justify-content-center`, `text-start`...) en lugar de `style=""` inline.

Las clases propias siguen existiendo al lado de las de Bootstrap (ej. `class="row g-4 blog-grid"`) para estilos y ganchos de JS. `src/css/00a-bootstrap-theme.css` pasa la paleta de marca a las variables `--bs-*` y neutraliza choques de nombres (`.lead`, `.nav`, `.btn`, `hr.divider`).

Los grids que generan los módulos JS (`blog.js`, `testimonials.js`, `service-cards.js`, `listings.js`, `detalle-blog.js`) envuelven cada tarjeta en un `<div class="col">`; el filtro de alojamientos oculta esa columna, no solo la tarjeta.

## Los módulos JS, uno por uno

Cada archivo de `src/js/modules/` expone una función `initX()` que **main.js** llama al cargar la página. Todas revisan primero si el elemento que necesitan existe (`if (!el) return;`), así que es seguro llamarlas todas en cualquier página aunque esa página no tenga ese componente.

| Archivo | Qué controla |
|---|---|
| `i18n.js` | Selector de idioma ES/EN/FR (el abrir/cerrar lo hace el dropdown de Bootstrap), motor de traducción (`data-i18n`), dispara `clarita:languagechange` |
| `lightbox.js` | Modal de imagen ampliada al hacer clic en una foto de galería |
| `faq.js` | Acordeón de preguntas frecuentes |
| `listings.js` | Buscador y listado de alojamientos: los 4 dropdowns (destino/fechas/zona/huéspedes), el mini-calendario de rango de fechas, y el filtro que oculta/muestra tarjetas |
| `blog.js` | Grids de blog (home y `/blogs.html`) |
| `testimonials.js` | Grid de testimonios |
| `service-cards.js` | Tarjetas "para propietarios / huéspedes / aliados" (home y `/servicios.html`) |
| `detalle-alojamiento.js` | Página de una propiedad: galería, calendario de disponibilidad, cálculo de noches/total |
| `detalle-blog.js` | Página de un artículo de blog |
| `contact-form.js` | Validación del formulario de contacto + su dropdown de "Motivo de consulta" |
| `checkout.js` | Los 2 pasos de la pasarela de pago (datos del huésped → método de pago) y la simulación de "pagar" |

## Los datos, uno por uno (`src/js/data/`)

No hay base de datos ni backend — todo es JS plano cargado en el navegador:

- **`properties.js`** — objeto `PROPIEDADES`, una entrada por alojamiento (`casa-palma`, `villa-brisa`, ...). Campos: nombre, zona, huéspedes, habitaciones, precio, descripción, amenities, `galeria` (fotos del detalle — **cualquier cantidad**, no hay límite, ver más abajo) y `ocupado` (rangos de fechas ya reservadas — **datos ficticios de ejemplo**, no vienen de ningún sistema de reservas real).
- **`posts.js`** — artículos de blog.
- **`testimonials.js`** — testimonios.
- **`faq.js`** — preguntas frecuentes por categoría.
- **`service-cards.js`** — el contenido de las tarjetas "para propietarios/huéspedes/aliados".
- **`i18n.es.js` / `i18n.en.js` / `i18n.fr.js`** — diccionario `"clave": "texto"` para cada idioma, mismas claves en los tres.

Campos que cambian según el idioma (nombre de zona, descripciones largas, etc.) son objetos `{ es, en, fr }` dentro del mismo registro en vez de vivir en el diccionario i18n — la función global `t(valor)` (en `i18n.js`) resuelve cuál mostrar según el idioma activo.

---

## Cómo hacer tareas comunes

**Cambiar un texto de la interfaz (botones, títulos fijos, labels):**
Buscá la clave en los 3 `src/js/data/i18n.*.js` (ej. `"checkout.pagar"`) y cambiá el valor en cada uno. Si el texto está hardcodeado en un `.html` de `src/pages/` sin `data-i18n`, agregale `data-i18n="una.clave.nueva"` y sumá esa clave a los 3 diccionarios (así queda traducible).

**Agregar/editar un alojamiento:**
Editá `src/js/data/properties.js` — copiá una entrada existente como plantilla. Las fotos van en `src/assets/photos/` (convertilas a WebP antes, ver [Imágenes y rendimiento](#imágenes-y-rendimiento)). No hace falta tocar HTML ni build: `listings.js` y `detalle-alojamiento.js` arman todo desde ahí, incluida la galería del detalle — `p.galeria` acepta cualquier cantidad de fotos, no solo 5: con 1 a 4 arma un mosaico distinto para cada cantidad, con 5 o más muestra las primeras 5 como miniatura y un aviso "+N" en la última si hay más; el lightbox (clic para agrandar) navega la lista completa con flechas/teclado, no solo las miniaturas visibles.

**Agregar una página nueva:**
1. Creá `src/pages/nueva-pagina.html` con el bloque `<!--META-->` arriba y el `<main>` abajo (mirá cualquier página existente como plantilla).
2. Sumá el link en `src/partials/header.html` (nav) y `src/partials/footer.html` si corresponde.
3. Corré `node build.js` — genera `nueva-pagina.html` en la raíz automáticamente (build.js recorre todo `src/pages/`, no hace falta registrarla en ningún lado más).

**Cambiar el estilo de una sección:**
Los archivos de `src/css/` están numerados por orden de aparición típico en una página (`00-tokens` = colores/fuentes, `00a-bootstrap-theme` = tema/compatibilidad con Bootstrap, `01-base` = reset, `02-buttons`, `03-header`, ... hasta `24-detalle-alojamiento`, y `99-responsive.css` al final con los ajustes de mobile/tablet). Buscá el nombre de la clase en el HTML y grepeala en `src/css/` para encontrar dónde se define.

**Conectar una pasarela de pagos real:**
Hoy `checkout.js` simula el pago: el `submit` del formulario (dentro de `initCheckout()`, línea ~215) valida los campos y después de un `setTimeout` de 1.6s (línea ~247, solo ahí para que se vea el spinner) genera un código de reserva random y muestra la pantalla de éxito — **no se contacta ningún servidor**. Para conectar un proveedor real (Stripe, dLocal, Tilopay, lo que sea):
1. Ese `setTimeout` se reemplaza por la llamada real (`fetch` a tu backend, o el SDK del proveedor) pasándole lo que ya está calculado ahí mismo: propiedad, noches, huéspedes, checkin/checkout, total.
2. El resultado (éxito/rechazo) determina si se muestra la pantalla de éxito (`successScreen`) o un error en el formulario, en vez de asumir éxito siempre.
3. El "código de reserva" (`CPC-XXXXXX`, generado con `Math.random()`) tendría que venir de tu backend en vez de generarse en el navegador.
4. El aviso de "modo demostración" (`.demo-note`, arriba de la pasarela) se puede sacar del HTML una vez que el cobro sea real.

Como no hay backend, **también hace falta un servidor propio** en el medio (nunca guardes claves secretas de un proveedor de pagos en JS del navegador) — este sitio estático llamaría a ese servidor, no directo al proveedor.

**Conectar disponibilidad/reservas reales (que no sea el array `ocupado` de ejemplo):**
El campo `ocupado` de cada propiedad en `properties.js` es hoy una lista fija de rangos escrita a mano. Lo usan `listings.js` (filtro de fechas del buscador) y `detalle-alojamiento.js` (calendario del detalle) para saber qué días tachar. Para que sea real, ese array tendría que venir de una consulta a un backend/PMS (ej. un `fetch` al cargar la página que reemplace `p.ocupado` con la respuesta), en vez de leerse directo del archivo estático.

---

## Imágenes y rendimiento

Las fotos viven en `src/assets/photos/` en **WebP** (no JPG/PNG) — a igual calidad visual pesan bastante menos. Si sumás una foto nueva:
1. Convertila a WebP antes de subirla (`npx sharp-cli -i original.jpg -o src/assets/photos -f webp -q 75 --effort 6`, o cualquier herramienta que prefieras — Squoosh.app es una opción sin instalar nada).
2. No hace falta que sea más ancha que ~1200px — nada en el sitio muestra una foto más grande que eso.
3. Referencia la ruta `.webp` en `properties.js`/`posts.js` o el `.html` que corresponda.

Cada `<img>` del sitio lleva `loading="lazy" decoding="async"` **excepto** la foto principal de arriba de cada página (esa lleva `fetchpriority="high"` en cambio) — esa es la única que conviene cargar de una, todas las demás pueden esperar a que el usuario haga scroll hasta ahí.

El logo (`logo.png` / `logo_dark.png`) se achicó de ~1900px de ancho a 600px — llegaba con una resolución absurda para mostrarse a 46px de alto en el header. Si lo reemplazás por una versión nueva, no hace falta que sea más ancha que eso.

## SEO

- Título y meta description únicos por página (bloque `<!--META-->` en cada `src/pages/*.html`).
- `og:title`/`og:description`/`og:image` (preview al compartir en WhatsApp/redes) se arman solos en `build.js` desde el META de cada página, con fallback a un título/imagen por defecto (`DEFAULT_OG_IMAGE` en `build.js`) si la página no define uno propio. Para usar una foto distinta en una página puntual, agregale `ogImage: src/assets/photos/otra.webp` a su bloque META.
- Datos estructurados `LocalBusiness` (JSON-LD) en `src/partials/jsonld-local-business.html`.
- **Antes de publicar el sitio**, reemplazar el placeholder `https://tu-dominio.com` por el dominio real en 3 lugares: `BASE_URL` en `build.js`, y adentro de `robots.txt` y `sitemap.xml` (esos dos no los toca el build, hay que editarlos a mano).
- `sameAs: []` en el JSON-LD queda vacío hasta tener los links reales de Instagram/Facebook/TikTok — sumarlos ahí ayuda a que Google conecte el negocio con esos perfiles.

---

## Limitaciones actuales (a propósito, por ahora)

- **Checkout**: simulado de punta a punta, sin cobro real ni persistencia (se pierde al recargar).
- **Disponibilidad**: datos ficticios de ejemplo, no un sistema de reservas real.
- **Sin backend**: todo el "contenido dinámico" es JS estático — cualquier cambio de datos requiere editar archivos y volver a desplegar, no hay panel de administración.
- **Mapa del detalle de alojamiento**: apunta a una búsqueda genérica de "Nosara, Costa Rica" para las 6 propiedades (no hay dirección/coordenada específica por propiedad todavía).
