// Tarjetas de "para quién es cada servicio". La home usa una versión resumida
// (4 puntos, ícono genérico) y servicios.html la versión completa (5-6 puntos,
// ícono por punto) — mismo componente visual (.audience-card), datos propios
// de cada página porque el contenido es distinto (resumen vs. detalle).

const SERVICE_CARDS_FULL = [
  {
    modifier: "", icon: "fa-house-chimney",
    eyebrowKey: "servicios.card1Eyebrow", titleKey: "servicios.card1Title",
    items: [
      { icon: "fa-list-check", textKey: "servicios.card1li1" },
      { icon: "fa-broom", textKey: "servicios.card1li2" },
      { icon: "fa-clipboard-check", textKey: "servicios.card1li3" },
      { icon: "fa-comments", textKey: "servicios.card1li4" },
      { icon: "fa-user-check", textKey: "servicios.card1li5" },
    ],
    ctaHref: "alianza-propietarios.html", ctaKey: "servicios.card1Cta",
  },
  {
    modifier: "audience-card--blue", icon: "fa-suitcase",
    eyebrowKey: "servicios.card2Eyebrow", titleKey: "servicios.card2Title",
    items: [
      { icon: "fa-door-open", textKey: "servicios.card2li1" },
      { icon: "fa-person-walking-luggage", textKey: "servicios.card2li2" },
      { icon: "fa-basket-shopping", textKey: "servicios.card2li3" },
      { icon: "fa-car", textKey: "servicios.card2li4" },
      { icon: "fa-umbrella-beach", textKey: "servicios.card2li5" },
      { icon: "fa-map-location-dot", textKey: "servicios.card2li6" },
    ],
    ctaHref: "alojamientos.html", ctaKey: "servicios.card2Cta",
  },
  {
    modifier: "audience-card--terracota", icon: "fa-handshake",
    eyebrowKey: "servicios.card3Eyebrow", titleKey: "servicios.card3Title",
    items: [
      { icon: "fa-bullhorn", textKey: "servicios.card3li1" },
      { icon: "fa-user-plus", textKey: "servicios.card3li2" },
      { icon: "fa-puzzle-piece", textKey: "servicios.card3li3" },
      { icon: "fa-people-group", textKey: "servicios.card3li4" },
    ],
    ctaHref: "contacto.html", ctaKey: "servicios.card3Cta",
  },
];

const SERVICE_CARDS_HOME = [
  {
    modifier: "", icon: "fa-house-chimney",
    eyebrowKey: "home.aud1Eyebrow", titleKey: "home.aud1Title",
    items: [
      { icon: "fa-check", textKey: "home.aud1li1" },
      { icon: "fa-check", textKey: "home.aud1li2" },
      { icon: "fa-check", textKey: "home.aud1li3" },
      { icon: "fa-check", textKey: "home.aud1li4" },
    ],
    ctaHref: "alianza-propietarios.html", ctaKey: "home.aud1Cta",
  },
  {
    modifier: "audience-card--blue", icon: "fa-suitcase",
    eyebrowKey: "home.aud2Eyebrow", titleKey: "home.aud2Title",
    items: [
      { icon: "fa-check", textKey: "home.aud2li1" },
      { icon: "fa-check", textKey: "home.aud2li2" },
      { icon: "fa-check", textKey: "home.aud2li3" },
      { icon: "fa-check", textKey: "home.aud2li4" },
    ],
    ctaHref: "alojamientos.html", ctaKey: "home.aud2Cta",
  },
  {
    modifier: "audience-card--terracota", icon: "fa-handshake",
    eyebrowKey: "home.aud3Eyebrow", titleKey: "home.aud3Title",
    items: [
      { icon: "fa-check", textKey: "home.aud3li1" },
      { icon: "fa-check", textKey: "home.aud3li2" },
      { icon: "fa-check", textKey: "home.aud3li3" },
      { icon: "fa-check", textKey: "home.aud3li4" },
    ],
    ctaHref: "contacto.html", ctaKey: "home.aud3Cta",
  },
];
