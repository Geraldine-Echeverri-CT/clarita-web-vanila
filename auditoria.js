// Auditoría de contraste (WCAG AA) y desbordes horizontales, página por página.
// Se pega en la consola de la pestaña servida por el puerto que se quiere auditar.
window.__auditar = async function (anchos = [390, 768, 1280]) {
  const pages = ["index","quienes-somos","servicios","alojamientos","alojamiento-detalle","alianza-propietarios","contacto","checkout","blogs","blog-articulo","testimoniales","faq"];
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const res = { fails: [], over: [], ok: 0 };
  for (const W of anchos) for (const p of pages) {
    const f = document.createElement('iframe');
    f.style.cssText = `width:${W}px;height:900px;position:absolute;left:-9999px;top:0`;
    f.src = `/${p}.html?v=` + Date.now();
    document.body.appendChild(f);
    await new Promise(r => f.onload = r);
    await f.contentDocument.fonts.ready;
    await new Promise(r => setTimeout(r, 500));
    const d = f.contentDocument, win = f.contentWindow, w = d.documentElement.clientWidth;
    if (d.documentElement.scrollWidth > w + 1) res.over.push(W + ' ' + p);
    for (const el of d.querySelectorAll('body *')) {
      if (!el.offsetParent && win.getComputedStyle(el).position !== 'fixed') continue;
      // el texto sobre foto se mide aparte (canvas): acá se saltea
      if (el.closest('.offcanvas:not(.show), .dropdown-menu:not(.show), .search-field__panel, .lightbox, .hero-banner-copy, .card-visual')) continue;
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
      const cs = win.getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      let fg = parse(cs.color), e = el, bg = null, img = false;
      while (e) { const s = win.getComputedStyle(e); if (s.backgroundImage !== 'none' && !s.backgroundImage.includes('linear-gradient(transparent')) { img = true; break; } const c = parse(s.backgroundColor); if (c && c.a > 0) { bg = bg ? blend(bg, c) : c; if (c.a >= 1) break; } e = e.parentElement; }
      if (img) continue;
      if (!bg || bg.a < 1) bg = blend(bg || { r: 255, g: 255, b: 255, a: 0 }, { r: 255, g: 255, b: 255, a: 1 });
      fg = blend(fg, bg);
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
      if (ratio < need) res.fails.push(`${W} ${p} ${el.tagName}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 26)}" ${ratio.toFixed(2)}<${need}`);
      else res.ok++;
    }
    f.remove();
  }
  return { desbordes: res.over, revisados: res.ok + res.fails.length, fallas: [...new Set(res.fails.map(s => s.split(' ').slice(1).join(' ')))] };
};
'listo';
