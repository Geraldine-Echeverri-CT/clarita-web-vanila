// Validación genérica del formulario de contacto.

function initMotivoDropdown(form) {
  const wrap = form.querySelector('.form-dropdown[data-field="motivo"]');
  if (!wrap) return null;
  const trigger = wrap.querySelector("[data-dropdown-toggle]");
  const valueEl = wrap.querySelector(".form-dropdown__value");
  const hiddenInput = wrap.querySelector('input[type="hidden"]');
  const options = wrap.querySelectorAll(".search-field__option");
  const placeholderText = valueEl.textContent;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    wrap.classList.toggle("is-open");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((o) => o.classList.remove("is-selected"));
      option.classList.add("is-selected");
      hiddenInput.value = option.dataset.value;
      valueEl.textContent = option.textContent.trim();
      valueEl.classList.remove("form-dropdown__value--placeholder");
      wrap.classList.remove("is-open");
      wrap.closest(".field").classList.remove("field--invalid");
    });
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) wrap.classList.remove("is-open");
  });

  // applyTranslations() ya tradujo el placeholder y las opciones — solo hay
  // que re-sincronizar el texto visible con la opción actualmente elegida.
  document.addEventListener("clarita:languagechange", () => {
    const selected = wrap.querySelector(".search-field__option.is-selected");
    if (selected) valueEl.textContent = selected.textContent.trim();
  });

  return function resetMotivo() {
    options.forEach((o) => o.classList.remove("is-selected"));
    hiddenInput.value = "";
    valueEl.textContent = placeholderText;
    valueEl.classList.add("form-dropdown__value--placeholder");
  };
}

function initContactForm() {
  const form = document.getElementById("form-contacto");
  if (!form) return;
  const msg = document.getElementById("contacto-msg");
  const resetMotivo = initMotivoDropdown(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = dict();
    let valid = true;

    form.querySelectorAll("[required]").forEach((field) => {
      const wrap = field.closest(".field");
      let ok = field.value.trim() !== "";
      if (field.type === "email" && ok) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      wrap.classList.toggle("field--invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      msg.textContent = d["contacto.errMsg"];
      msg.className = "form-msg form-msg--show";
      return;
    }

    msg.textContent = d["contacto.okMsg"];
    msg.className = "form-msg form-msg--show form-msg--ok";
    form.reset();
    if (resetMotivo) resetMotivo();
  });
}
