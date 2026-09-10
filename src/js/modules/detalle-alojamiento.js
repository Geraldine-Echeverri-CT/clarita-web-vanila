// Página de detalle de un alojamiento (alojamiento-detalle.html?propiedad=<key>).
//
// El calendario de disponibilidad vive en la tarjeta de reserva (no en la
// columna de descripción) y permite elegir el rango de fechas ahí mismo.
// Si se llega desde el buscador de Alojamientos con ?checkin=&checkout= en
// la URL (ver listings.js), esas fechas se precargan y las noches se
// calculan solas; si no, el huésped las elige acá mismo viendo qué días
// están libres.

let currentPropKey = null;

const DETALLE_CAL_LOCALES = { es: "es-CR", en: "en-US", fr: "fr-FR" };

function initBookingCalendar(p) {
  const calEl = document.getElementById("calendario-mes");
  if (!calEl) return;

  const panel = calEl.closest(".datepicker");
  const labelEl = panel.querySelector("[data-cal-label]");
  const weekdaysEl = panel.querySelector("[data-cal-weekdays]");
  const prevBtn = panel.querySelector("[data-cal-prev]");
  const nextBtn = panel.querySelector("[data-cal-next]");
  const resumenEl = document.getElementById("detalle-fechas-resumen");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangos = (p.ocupado || []).map(([ini, fin]) => [new Date(ini), new Date(fin)]);

  // Precarga desde ?checkin=&checkout= (llegó del buscador de Alojamientos).
  const params = new URLSearchParams(window.location.search);
  const urlCheckin = params.get("checkin");
  const urlCheckout = params.get("checkout");
  let rangeStart = urlCheckin ? new Date(urlCheckin + "T00:00:00") : null;
  let rangeEnd = urlCheckout ? new Date(urlCheckout + "T00:00:00") : null;
  let viewDate = new Date((rangeStart || today).getFullYear(), (rangeStart || today).getMonth(), 1);

  function locale() { return DETALLE_CAL_LOCALES[getLang()] || "es-CR"; }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function sameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function isOcupado(date) {
    return rangos.some(([ini, fin]) => date >= ini && date <= fin);
  }

  // El aviso de "faltan fechas" reusa el mismo mecanismo que los formularios
  // del sitio (.field--invalid revela el <small class="error">, ver
  // 17-forms.css); acá el campo no es un input sino el resumen de fechas.
  function campoFechas() {
    return resumenEl && resumenEl.closest(".field");
  }
  function marcarAvisoFechas() {
    const campo = campoFechas();
    if (campo) campo.classList.add("field--invalid");
  }
  function limpiarAvisoFechas() {
    const campo = campoFechas();
    if (campo) campo.classList.remove("field--invalid");
  }

  function updateResumen() {
    if (!resumenEl) return;
    const d = dict();
    const fmt = (dt) => dt.toLocaleDateString(locale(), { day: "numeric", month: "short" });
    if (rangeStart && rangeEnd) {
      const noches = Math.round((rangeEnd - rangeStart) / 86400000);
      const nocheTxt = noches === 1 ? d["detalle.nocheSingular"] : d["detalle.nochesPlural"];
      const total = noches * p.precio;
      resumenEl.textContent = fmt(rangeStart) + " – " + fmt(rangeEnd) + " · " + noches + " " + nocheTxt + " · $" + total + " " + d["detalle.total"];
    } else if (rangeStart) {
      resumenEl.textContent = d["detalle.eligeSalida"].replace("%s", fmt(rangeStart));
    } else {
      resumenEl.textContent = d["detalle.elegiFechas"];
    }
  }

  function renderWeekdays() {
    const loc = locale();
    let html = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(2021, 0, 4 + i); // 4 ene 2021 fue lunes
      html += "<span>" + d.toLocaleDateString(loc, { weekday: "short" }).replace(".", "").toUpperCase() + "</span>";
    }
    weekdaysEl.innerHTML = html;
  }

  function renderDays() {
    const loc = locale();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const label = viewDate.toLocaleDateString(loc, { month: "long", year: "numeric" });
    labelEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);

    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    let html = "";
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      let cellDate, outside = false;
      if (dayNum < 1) { cellDate = new Date(year, month - 1, daysInPrevMonth + dayNum); outside = true; }
      else if (dayNum > daysInMonth) { cellDate = new Date(year, month + 1, dayNum - daysInMonth); outside = true; }
      else { cellDate = new Date(year, month, dayNum); }

      const classes = ["datepicker__day"];
      if (outside) classes.push("is-outside");
      if (sameDay(cellDate, today)) classes.push("is-today");
      const ocupado = isOcupado(cellDate);
      const pasado = cellDate < today;
      if (ocupado) classes.push("is-occupied");
      if (pasado || ocupado) classes.push("is-disabled");
      if (rangeStart && sameDay(cellDate, rangeStart)) classes.push("is-selected", "is-start");
      if (rangeEnd && sameDay(cellDate, rangeEnd)) classes.push("is-selected", "is-end");
      if (rangeStart && rangeEnd && cellDate > rangeStart && cellDate < rangeEnd) classes.push("is-in-range");

      html += '<button type="button" class="' + classes.join(" ") + '" data-date="' + isoDate(cellDate) + '"' + ((pasado || ocupado) ? " disabled" : "") + ">" + cellDate.getDate() + "</button>";
    }
    calEl.innerHTML = html;

    calEl.querySelectorAll(".datepicker__day:not(.is-disabled)").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const parts = btn.dataset.date.split("-").map(Number);
        const clicked = new Date(parts[0], parts[1] - 1, parts[2]);
        if (!rangeStart || rangeEnd) {
          rangeStart = clicked;
          rangeEnd = null;
        } else if (clicked < rangeStart) {
          rangeStart = clicked;
        } else {
          rangeEnd = clicked;
        }
        renderDays();
        updateResumen();
        // Si el huésped ya había intentado reservar sin fechas, el aviso se va
        // en cuanto empieza a elegirlas, sin esperar a que vuelva a apretar.
        limpiarAvisoFechas();
      });
    });
  }

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderDays();
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderDays();
  });

  document.addEventListener("clarita:languagechange", () => {
    renderWeekdays();
    renderDays();
    updateResumen();
  });

  renderWeekdays();
  renderDays();
  updateResumen();

  return {
    marcarAvisoFechas,
    getRange: () => ({ checkin: rangeStart ? isoDate(rangeStart) : null, checkout: rangeEnd ? isoDate(rangeEnd) : null }),
  };
}

// Galería con la cantidad de fotos que tenga la propiedad (ya no un mosaico
// fijo de 5) — ver la variante .detalle-gallery--N en 24-detalle-alojamiento.css
// para cada cantidad de miniaturas. De 5 fotos en adelante se muestran 5 como
// miniatura y la última lleva un aviso "+N" si hay más; el lightbox (ver
// lightbox.js) navega la lista completa igual, con flechas/teclado, gracias
// al atributo data-gallery con TODAS las fotos (no solo las que se ven).
function renderGallery(p) {
  const container = document.getElementById("detalle-gallery");
  if (!container) return;
  const photos = p.galeria || [];
  container.className = "detalle-gallery";
  if (!photos.length) { container.innerHTML = ""; return; }

  const full = photos.map((src, i) => ({ src, alt: p.nombre + " " + (i + 1) }));
  container.dataset.gallery = JSON.stringify(full);

  const visibleCount = Math.min(photos.length, 5);
  container.classList.add("detalle-gallery--" + (photos.length >= 5 ? "5plus" : String(visibleCount)));

  container.innerHTML = full.slice(0, visibleCount).map((photo, i) => {
    const isLast = i === visibleCount - 1;
    const hiddenCount = photos.length - visibleCount;
    const overlay = (isLast && hiddenCount > 0) ? '<span class="tour-item__more">+' + hiddenCount + '</span>' : "";
    const loadAttrs = i === 0 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
    return '<button class="tour-item" aria-label="Ver foto ' + (i + 1) + ' en grande" data-index="' + i + '">' +
      '<img src="' + photo.src + '" alt="' + photo.alt + '" ' + loadAttrs + '>' + overlay +
    '</button>';
  }).join("");
}

function renderAlojamientoDetalle() {
  const key = currentPropKey;
  const p = PROPIEDADES[key];
  const d = dict();

  document.title = p.nombre + " | Clarita Property Care";
  document.getElementById("detalle-nombre").textContent = p.nombre;
  document.getElementById("detalle-zona").innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + t(p.zona);
  document.getElementById("detalle-descripcion").textContent = t(p.descripcion);
  document.getElementById("detalle-huespedes-meta").textContent = p.huespedes + " " + d["common.huespedes"];
  document.getElementById("detalle-habitaciones-meta").textContent = p.habitaciones + " " + d["common.habitaciones"];
  document.getElementById("detalle-amenity-meta").textContent = t(p.amenity);
  document.getElementById("detalle-precio").innerHTML = "$" + p.precio + ' <span>' + d["common.nochePorNoche"] + '</span>';

  renderGallery(p);

  const amenitiesList = document.getElementById("detalle-amenities");
  if (amenitiesList) {
    amenitiesList.innerHTML = "";
    t(p.amenities).forEach((a) => {
      const span = document.createElement("span");
      span.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + a;
      amenitiesList.appendChild(span);
    });
  }
}

function initDetalleAlojamiento() {
  const root = document.getElementById("detalle-alojamiento");
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  let key = params.get("propiedad");
  if (!PROPIEDADES[key]) key = "casa-palma";
  currentPropKey = key;
  renderAlojamientoDetalle();
  const calendar = initBookingCalendar(PROPIEDADES[key]);
  document.addEventListener("clarita:languagechange", () => { if (currentPropKey) renderAlojamientoDetalle(); });

  const btnReservar = document.getElementById("btn-reservar");
  if (btnReservar) {
    btnReservar.addEventListener("click", () => {
      const range = calendar ? calendar.getRange() : { checkin: null, checkout: null };

      // Sin rango completo no hay noches ni total que cobrar: el checkout caía
      // en su valor por defecto de 1 noche sin que nadie lo hubiera elegido.
      if (!range.checkin || !range.checkout) {
        if (calendar) calendar.marcarAvisoFechas();
        return;
      }

      const huespedes = document.getElementById("detalle-huespedes-input").value || 1;
      const noches = Math.round((new Date(range.checkout) - new Date(range.checkin)) / 86400000) || 1;
      const url = "checkout.html?propiedad=" + currentPropKey +
        "&noches=" + noches +
        "&huespedes=" + huespedes +
        "&checkin=" + range.checkin +
        "&checkout=" + range.checkout;
      window.location.href = url;
    });
  }
}
