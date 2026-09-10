// Pasarela de pago / checkout (demo, sin cobro real).

function refreshCheckoutSummary() {
  const propSelect = document.getElementById("summary-propiedad");
  if (!propSelect) return;
  const d = dict();
  const nochesInput = document.getElementById("summary-noches");
  const huespedesInput = document.getElementById("summary-huespedes");
  const checkinInput = document.getElementById("summary-checkin");
  const thumb = document.getElementById("summary-thumb");
  const nombreEl = document.getElementById("summary-nombre");
  const zonaEl = document.getElementById("summary-zona");
  const subtotalEl = document.getElementById("summary-subtotal");
  const limpiezaEl = document.getElementById("summary-limpieza");
  const totalEl = document.getElementById("summary-total");
  const totalBtnEl = document.getElementById("pay-total-label");

  const key = propSelect.value;
  const propiedad = PROPIEDADES[key];
  const noches = Math.max(1, parseInt(nochesInput.value, 10) || 1);
  const limpieza = 45;
  const subtotal = propiedad.precio * noches;
  const total = subtotal + limpieza;

  const propNombreEl = document.getElementById("summary-propiedad-nombre");
  if (propNombreEl) propNombreEl.textContent = propiedad.nombre;

  const nocheTxt = noches === 1 ? d["checkout.noche1"] : d["checkout.nocheN"];
  const nochesDisplay = document.getElementById("summary-noches-display");
  if (nochesDisplay) nochesDisplay.textContent = noches + " " + nocheTxt;
  const huespedesDisplay = document.getElementById("summary-huespedes-display");
  if (huespedesDisplay) huespedesDisplay.textContent = (huespedesInput.value || 1) + " " + d["checkout.huespedes"].toLowerCase();
  const checkinDisplay = document.getElementById("summary-checkin-display");
  if (checkinDisplay) {
    checkinDisplay.textContent = checkinInput.value ? checkinInput.value.split("-").reverse().join("/") : "—";
  }

  thumb.src = propiedad.img;
  thumb.alt = propiedad.nombre;
  nombreEl.textContent = propiedad.nombre;
  zonaEl.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + t(propiedad.zona);
  subtotalEl.textContent = "$" + subtotal + " USD (" + noches + " " + nocheTxt + ")";
  limpiezaEl.textContent = "$" + limpieza + " USD";
  totalEl.textContent = "$" + total + " USD";
  if (totalBtnEl) totalBtnEl.textContent = "$" + total + " USD";
}

function luhnValido(numero) {
  const digits = numero.replace(/\D/g, "");
  if (digits.length < 13) return false;
  let sum = 0;
  let doble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let dgt = parseInt(digits[i], 10);
    if (doble) { dgt *= 2; if (dgt > 9) dgt -= 9; }
    sum += dgt;
    doble = !doble;
  }
  return sum % 10 === 0;
}

function expiryValida(valor) {
  const match = /^(\d{2})\/(\d{2})$/.exec(valor);
  if (!match) return false;
  const mes = parseInt(match[1], 10);
  const anio = parseInt("20" + match[2], 10);
  if (mes < 1 || mes > 12) return false;
  const ahora = new Date();
  const expira = new Date(anio, mes, 0);
  return expira >= new Date(ahora.getFullYear(), ahora.getMonth(), 1);
}

function nombreValido(v) { return v.trim().length > 2; }
function emailValido(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function telefonoValido(v) { return v.trim().length >= 8; }
function cvvValido(v) { return v.length >= 3; }

// Marca un campo inválido apenas el usuario sale de él sin completarlo bien
// (blur), y le quita el error en cuanto lo corrige sin esperar a otro blur
// (input) — no solo al intentar continuar/pagar.
function attachLiveValidation(field, testFn) {
  if (!field) return;
  const wrap = field.closest(".field");
  field.addEventListener("blur", () => {
    wrap.classList.toggle("field--invalid", !testFn(field.value));
  });
  field.addEventListener("input", () => {
    if (wrap.classList.contains("field--invalid") && testFn(field.value)) {
      wrap.classList.remove("field--invalid");
    }
  });
}

function initCheckout() {
  const checkout = document.getElementById("checkout");
  if (!checkout) return;

  const params = new URLSearchParams(window.location.search);
  let propKey = params.get("propiedad");
  if (!PROPIEDADES[propKey]) propKey = "casa-palma";

  const propSelect = document.getElementById("summary-propiedad");
  const nochesInput = document.getElementById("summary-noches");
  const huespedesInput = document.getElementById("summary-huespedes");
  const checkinInput = document.getElementById("summary-checkin");

  if (params.get("noches")) nochesInput.value = params.get("noches");
  if (params.get("huespedes")) huespedesInput.value = params.get("huespedes");
  if (checkinInput && params.get("checkin")) checkinInput.value = params.get("checkin");

  propSelect.value = propKey;
  refreshCheckoutSummary();
  document.addEventListener("clarita:languagechange", refreshCheckoutSummary);

  // ---- Paso 1 (alojamiento + datos del huésped) → paso 2 (pago) ----
  const step1 = document.getElementById("checkout-step-1");
  const step2 = document.getElementById("checkout-step-2");
  const dot1 = document.getElementById("step-dot-1");
  const dot2 = document.getElementById("step-dot-2");
  const btnContinuar = document.getElementById("btn-continuar-pago");
  const btnVolverDatos = document.getElementById("btn-volver-datos");
  const huespedNombre = document.getElementById("huesped-nombre");
  const huespedEmail = document.getElementById("huesped-email");
  const huespedTelefono = document.getElementById("huesped-telefono");

  attachLiveValidation(huespedNombre, nombreValido);
  attachLiveValidation(huespedEmail, emailValido);
  attachLiveValidation(huespedTelefono, telefonoValido);

  if (btnContinuar) {
    btnContinuar.addEventListener("click", () => {
      const checks = [
        [huespedNombre, nombreValido(huespedNombre.value)],
        [huespedEmail, emailValido(huespedEmail.value)],
        [huespedTelefono, telefonoValido(huespedTelefono.value)],
      ];
      let valid = true;
      checks.forEach(([field, ok]) => {
        field.closest(".field").classList.toggle("field--invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      step1.style.display = "none";
      step2.style.display = "block";
      dot1.classList.remove("steps-indicator__dot--active");
      dot2.classList.add("steps-indicator__dot--active");
      window.scrollTo({ top: step2.offsetTop - 120, behavior: "smooth" });
    });
  }

  if (btnVolverDatos) {
    btnVolverDatos.addEventListener("click", (e) => {
      e.preventDefault();
      step2.style.display = "none";
      step1.style.display = "block";
      dot2.classList.remove("steps-indicator__dot--active");
      dot1.classList.add("steps-indicator__dot--active");
    });
  }

  // ---- Tabs de método de pago ----
  const tabs = document.querySelectorAll(".pay-tab");
  const panels = document.querySelectorAll(".pay-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((tb) => tb.classList.remove("pay-tab--active"));
      panels.forEach((p) => p.classList.remove("pay-panel--active"));
      tab.classList.add("pay-tab--active");
      document.getElementById(tab.dataset.panel).classList.add("pay-panel--active");
    });
  });

  // ---- Formato dinámico de tarjeta ----
  const cardNumber = document.getElementById("card-number");
  const cardName = document.getElementById("card-name");
  const cardExpiry = document.getElementById("card-expiry");
  const cardCvv = document.getElementById("card-cvv");

  const visualNumber = document.getElementById("cvisual-number");
  const visualName = document.getElementById("cvisual-name");
  const visualExpiry = document.getElementById("cvisual-expiry");

  if (cardNumber) {
    cardNumber.addEventListener("input", () => {
      let digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
      cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
      visualNumber.textContent = digits.length ? cardNumber.value.padEnd(19, "•") : "•••• •••• •••• ••••";
    });
    cardName.addEventListener("input", () => {
      visualName.textContent = cardName.value.trim() ? cardName.value.toUpperCase() : "NOMBRE APELLIDO";
    });
    cardExpiry.addEventListener("input", () => {
      let digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
      if (digits.length > 2) digits = digits.slice(0, 2) + "/" + digits.slice(2);
      cardExpiry.value = digits;
      visualExpiry.textContent = digits || "MM/AA";
    });
    cardCvv.addEventListener("input", () => {
      cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
    });

    attachLiveValidation(cardName, nombreValido);
    attachLiveValidation(cardNumber, luhnValido);
    attachLiveValidation(cardExpiry, expiryValida);
    attachLiveValidation(cardCvv, cvvValido);
  }

  const payForm = document.getElementById("form-pago");
  const payBtn = document.getElementById("btn-pagar");
  const checkoutCard = document.getElementById("checkout-card-panel");
  const successScreen = document.getElementById("success-screen");

  if (payForm) {
    payForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = dict();
      const activePanel = document.querySelector(".pay-panel--active");
      let valid = true;

      if (activePanel.id === "panel-tarjeta") {
        [
          [cardName, nombreValido(cardName.value)],
          [cardNumber, luhnValido(cardNumber.value)],
          [cardExpiry, expiryValida(cardExpiry.value)],
          [cardCvv, cvvValido(cardCvv.value)],
        ].forEach(([field, ok]) => {
          field.closest(".field").classList.toggle("field--invalid", !ok);
          if (!ok) valid = false;
        });
      }

      const terms = document.getElementById("checkout-terms");
      const termsWrap = terms.closest(".terms-row");
      if (!terms.checked) {
        termsWrap.style.color = "#b0432f";
        valid = false;
      } else {
        termsWrap.style.color = "";
      }

      if (!valid) return;

      payBtn.disabled = true;
      payBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ' + d["checkout.procesando"];

      setTimeout(() => {
        const d2 = dict();
        const codigo = "#CPC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        document.getElementById("success-code").textContent = codigo;
        document.getElementById("success-property").textContent = document.getElementById("summary-nombre").textContent;
        document.getElementById("success-total").textContent = document.getElementById("summary-total").textContent;

        // Ya se "pagó" — el hero deja de invitar a completar datos y el
        // aviso de modo demo (ya cumplió su función durante el pago) se oculta.
        const heroEyebrow = document.getElementById("checkout-hero-eyebrow");
        const heroTitle = document.getElementById("checkout-hero-title");
        const heroLead = document.getElementById("checkout-hero-lead");
        if (heroEyebrow) heroEyebrow.textContent = d2["checkout.eyebrowExito"];
        if (heroTitle) heroTitle.textContent = d2["checkout.tituloExito"];
        if (heroLead) heroLead.textContent = d2["checkout.leadExito"];
        const demoNote = document.getElementById("checkout-demo-note");
        if (demoNote) demoNote.style.display = "none";

        checkoutCard.style.display = "none";
        successScreen.style.display = "block";
        const wrap = document.querySelector(".checkout-wrap");
        if (wrap) wrap.classList.add("checkout-wrap--success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1600);
    });
  }
}
