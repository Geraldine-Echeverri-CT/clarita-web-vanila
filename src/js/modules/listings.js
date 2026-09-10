// Listado de alojamientos (tarjetas renderizadas desde PROPIEDADES) + su filtro.

function zonaKeyFor(key) {
  if (key === "villa-brisa" || key === "villa-sol") return "pelada";
  if (key === "casa-bosque") return "k-section";
  return "guiones";
}

// Cada propiedad trae PROPIEDADES[key].ocupado: [["2026-09-12","2026-09-18"], ...]
// (rangos ya reservados). El filtro de fechas descarta una propiedad si el
// rango elegido se solapa con alguno de esos rangos.
function isPropertyAvailable(key, checkin, checkout) {
  const p = PROPIEDADES[key];
  if (!p || !p.ocupado || !p.ocupado.length) return true;
  const selStart = new Date(checkin);
  const selEnd = new Date(checkout);
  return !p.ocupado.some(([start, end]) => selStart < new Date(end) && new Date(start) < selEnd);
}

// Las fechas elegidas en el buscador viajan al detalle por query string, para
// que el calendario de esa página las precargue y calcule las noches solo.
function syncDetailLinks(checkin, checkout) {
  document.querySelectorAll(".listing-card__footer a").forEach((a) => {
    const [path, query] = a.getAttribute("href").split("?");
    const params = new URLSearchParams(query || "");
    if (checkin && checkout) {
      params.set("checkin", checkin);
      params.set("checkout", checkout);
    } else {
      params.delete("checkin");
      params.delete("checkout");
    }
    a.setAttribute("href", path + "?" + params.toString());
  });
}

function renderAlojamientosListado() {
  const grid = document.getElementById("listing-grid");
  if (!grid) return;
  const d = dict();
  grid.innerHTML = Object.keys(PROPIEDADES).map((key) => {
    const p = PROPIEDADES[key];
    return '<article class="listing-card" data-key="' + key + '" data-zona="' + zonaKeyFor(key) + '" data-huespedes="' + p.huespedes + '">' +
      '<div class="listing-card__thumb"><img src="' + p.img + '" alt="' + p.nombre + ', ' + t(p.zona) + '" loading="lazy" decoding="async"></div>' +
      '<div class="listing-card__body">' +
        '<h3 class="listing-card__title">' + p.nombre + '</h3>' +
        '<p class="listing-card__loc"><i class="fa-solid fa-location-dot"></i> ' + t(p.zona) + '</p>' +
        '<div class="listing-card__meta">' +
          '<span><i class="fa-solid fa-user"></i> ' + p.huespedes + ' ' + d["common.huespedes"] + '</span>' +
          '<span><i class="fa-solid fa-bed"></i> ' + p.habitaciones + ' ' + d["common.habitaciones"] + '</span>' +
          '<span><i class="fa-solid fa-star"></i> ' + t(p.amenity) + '</span>' +
        '</div>' +
        '<div class="listing-card__footer">' +
          '<p class="listing-card__price">$' + p.precio + ' <span>' + d["common.nochePorNoche"] + '</span></p>' +
          '<a href="alojamiento-detalle.html?propiedad=' + key + '" class="btn btn-primary btn-sm">' + d["alojamientos.verDetalle"] + '</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }).join("");
}

// Calendario propio para el campo "Fechas" — reemplaza el <input type="date">
// nativo (su calendario emergente es UI del navegador/SO, no se puede
// estilizar) por un mini datepicker de rango en HTML/CSS/JS.
const DATEPICKER_LOCALES = { es: "es-CR", en: "en-US", fr: "fr-FR" };

function initDatePickerField(field, valueEl) {
  const panel = field.querySelector(".search-field__panel--dates");
  if (!panel) return;
  const labelEl = panel.querySelector("[data-cal-label]");
  const weekdaysEl = panel.querySelector("[data-cal-weekdays]");
  const daysEl = panel.querySelector("[data-cal-days]");
  const prevBtn = panel.querySelector("[data-cal-prev]");
  const nextBtn = panel.querySelector("[data-cal-next]");
  const clearBtn = panel.querySelector("[data-dates-clear]");
  const applyBtn = panel.querySelector("[data-dates-apply]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let rangeStart = null;
  let rangeEnd = null;

  function locale() { return DATEPICKER_LOCALES[getLang()] || "es-CR"; }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function sameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // semana arranca en lunes
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
      const disabled = cellDate < today;
      if (disabled) classes.push("is-disabled");
      if (rangeStart && sameDay(cellDate, rangeStart)) classes.push("is-selected", "is-start");
      if (rangeEnd && sameDay(cellDate, rangeEnd)) classes.push("is-selected", "is-end");
      if (rangeStart && rangeEnd && cellDate > rangeStart && cellDate < rangeEnd) classes.push("is-in-range");

      html += '<button type="button" class="' + classes.join(" ") + '" data-date="' + isoDate(cellDate) + '"' + (disabled ? " disabled" : "") + ">" + cellDate.getDate() + "</button>";
    }
    daysEl.innerHTML = html;

    daysEl.querySelectorAll(".datepicker__day:not(.is-disabled)").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // El botón se reemplaza (innerHTML) dentro de este mismo handler: si el
        // clic sigue burbujeando, llega a document con un e.target ya
        // desconectado del DOM, form.contains(e.target) da false y el panel
        // se cierra solo. stopPropagation corta el burbujeo antes de eso.
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

  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      rangeStart = null;
      rangeEnd = null;
      renderDays();
      field.dataset.checkin = "";
      field.dataset.checkout = "";
      if (valueEl) valueEl.textContent = dict()["alojamientos.seleccionarFechas"];
      syncDetailLinks("", "");
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (rangeStart) {
        field.dataset.checkin = isoDate(rangeStart);
        field.dataset.checkout = rangeEnd ? isoDate(rangeEnd) : "";
        const shortFmt = (d) => d.toLocaleDateString(locale(), { day: "numeric", month: "short" });
        if (valueEl) valueEl.textContent = rangeEnd ? shortFmt(rangeStart) + " - " + shortFmt(rangeEnd) : shortFmt(rangeStart);
        syncDetailLinks(field.dataset.checkin, field.dataset.checkout);
      }
      field.classList.remove("is-open");
    });
  }

  document.addEventListener("clarita:languagechange", () => {
    renderWeekdays();
    renderDays();
  });

  renderWeekdays();
  renderDays();
}

// Dropdowns "bonitos" del buscador (destino / fechas / zona / huéspedes): cada
// .search-field guarda su selección en dataset.value (u dataset.checkin/checkout
// para fechas) para que initFiltro los lea sin depender de <select> nativos.
function initSearchDropdowns(form) {
  const fields = Array.from(form.querySelectorAll(".search-field"));

  function closeAll(except) {
    fields.forEach((field) => {
      if (field !== except) field.classList.remove("is-open");
    });
  }

  fields.forEach((field) => {
    // El trigger cubre todo el campo (ícono + etiqueta + valor + flecha), no
    // solo el texto del valor: así también responde el clic sobre la flecha.
    const toggle = field.querySelector("[data-dropdown-toggle]");
    const valueEl = field.querySelector(".search-field__value");
    if (toggle) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = !field.classList.contains("is-open");
        closeAll(field);
        field.classList.toggle("is-open", willOpen);
      });
    }

    const options = field.querySelectorAll(".search-field__option");
    if (options.length) {
      const selected = field.querySelector(".search-field__option.is-selected") || options[0];
      field.dataset.value = selected.dataset.value;
      options.forEach((option) => {
        option.addEventListener("click", () => {
          options.forEach((o) => o.classList.remove("is-selected"));
          option.classList.add("is-selected");
          field.dataset.value = option.dataset.value;
          if (valueEl) valueEl.textContent = option.textContent.trim();
          field.classList.remove("is-open");
        });
      });
    }

    if (field.dataset.field === "fechas") {
      initDatePickerField(field, valueEl);
    }
  });

  document.addEventListener("click", (e) => {
    if (!form.contains(e.target)) closeAll();
  });

  // Al cambiar de idioma, applyTranslations() ya tradujo las opciones y el
  // valor por defecto de cada campo — solo hace falta re-sincronizar el
  // texto visible con la opción actualmente seleccionada.
  document.addEventListener("clarita:languagechange", () => {
    fields.forEach((field) => {
      const valueEl = field.querySelector(".search-field__value");
      const selected = field.querySelector(".search-field__option.is-selected");
      if (valueEl && selected) valueEl.textContent = selected.textContent.trim();
    });
  });
}

function initFiltro() {
  const form = document.getElementById("filtro-alojamientos");
  if (!form) return;
  initSearchDropdowns(form);

  const zonaField = form.querySelector('[data-field="zona"]');
  const huespedesField = form.querySelector('[data-field="huespedes"]');
  const fechasField = form.querySelector('[data-field="fechas"]');

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const zona = (zonaField && zonaField.dataset.value) || "todas";
    const huespedes = parseInt((huespedesField && huespedesField.dataset.value) || "0", 10) || 0;
    const checkin = fechasField && fechasField.dataset.checkin;
    const checkout = fechasField && fechasField.dataset.checkout;
    syncDetailLinks(checkin, checkout);

    document.querySelectorAll(".listing-card").forEach((card) => {
      const cardZona = card.dataset.zona;
      const cardHuespedes = parseInt(card.dataset.huespedes, 10);
      const matchZona = zona === "todas" || cardZona === zona;
      const matchHuespedes = !huespedes || cardHuespedes >= huespedes;
      const matchFechas = !(checkin && checkout) || isPropertyAvailable(card.dataset.key, checkin, checkout);
      card.style.display = matchZona && matchHuespedes && matchFechas ? "" : "none";
    });
  });
}

function initListings() {
  if (!document.getElementById("listing-grid")) return;
  renderAlojamientosListado();
  initFiltro();
  document.addEventListener("clarita:languagechange", () => {
    renderAlojamientosListado();
    const fechasField = document.querySelector('#filtro-alojamientos [data-field="fechas"]');
    if (fechasField) syncDetailLinks(fechasField.dataset.checkin, fechasField.dataset.checkout);
  });
}
