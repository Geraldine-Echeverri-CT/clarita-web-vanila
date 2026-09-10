// Preguntas frecuentes, agrupadas por categoría. Compartidas entre la home
// (3 destacadas) y la página completa. Los textos viven en I18N (faq.*).

const FAQ_CATEGORIES = [
  {
    icon: "fa-house-chimney", color: "verde", labelKey: "faq.catPropietarios",
    items: [
      { q: "faq.p1q", a: "faq.p1a" },
      { q: "faq.p2q", a: "faq.p2a" },
      { q: "faq.p3q", a: "faq.p3a" },
      { q: "faq.p4q", a: "faq.p4a" },
    ],
  },
  {
    icon: "fa-suitcase", color: "azul", labelKey: "faq.catHuespedes",
    items: [
      { q: "faq.h1q", a: "faq.h1a" },
      { q: "faq.h2q", a: "faq.h2a" },
      { q: "faq.h3q", a: "faq.h3a" },
      { q: "faq.h4q", a: "faq.h4a" },
    ],
  },
  {
    icon: "fa-handshake", color: "terracota", labelKey: "faq.catAliados",
    items: [
      { q: "faq.a1q", a: "faq.a1a" },
      { q: "faq.a2q", a: "faq.a2a" },
      { q: "faq.a3q", a: "faq.a3a" },
    ],
  },
];

// Destacadas en la home: una de cada categoría.
const FAQ_FEATURED_KEYS = ["faq.p1q", "faq.h1q", "faq.a1q"];
