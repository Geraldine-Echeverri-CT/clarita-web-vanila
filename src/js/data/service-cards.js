// Tarjetas de "para quién es cada servicio". La home usa una versión resumida
// (4 puntos, ícono genérico) y servicios.html la versión completa (5-6 puntos,
// ícono por punto) — mismo componente visual (.audience-card), datos propios
// de cada página porque el contenido es distinto (resumen vs. detalle).

const SERVICE_CARDS_FULL = [
  {
    modifier: "", icon: "ti-building-cottage",
    eyebrowKey: "servicios.card1Eyebrow", titleKey: "servicios.card1Title",
    items: [
      { icon: "ti-list-check", textKey: "servicios.card1li1" },
      { icon: "ti-sparkles", textKey: "servicios.card1li2" },
      { icon: "ti-clipboard-check", textKey: "servicios.card1li3" },
      { icon: "ti-messages", textKey: "servicios.card1li4" },
      { icon: "ti-user-check", textKey: "servicios.card1li5" },
    ],
    ctaHref: "alianza-propietarios.html", ctaKey: "servicios.card1Cta",
  },
  {
    modifier: "audience-card--blue", icon: "ti-luggage",
    eyebrowKey: "servicios.card2Eyebrow", titleKey: "servicios.card2Title",
    items: [
      { icon: "ti-door-enter", textKey: "servicios.card2li1" },
      { icon: "ti-luggage", textKey: "servicios.card2li2" },
      { icon: "ti-basket", textKey: "servicios.card2li3" },
      { icon: "ti-car", textKey: "servicios.card2li4" },
      { icon: "ti-beach", textKey: "servicios.card2li5" },
      { icon: "ti-map-2", textKey: "servicios.card2li6" },
    ],
    ctaHref: "alojamientos.html", ctaKey: "servicios.card2Cta",
  },
  {
    modifier: "audience-card--dorado", icon: "ti-heart-handshake",
    eyebrowKey: "servicios.card3Eyebrow", titleKey: "servicios.card3Title",
    items: [
      { icon: "ti-speakerphone", textKey: "servicios.card3li1" },
      { icon: "ti-user-plus", textKey: "servicios.card3li2" },
      { icon: "ti-puzzle", textKey: "servicios.card3li3" },
      { icon: "ti-users-group", textKey: "servicios.card3li4" },
    ],
    ctaHref: "contacto.html", ctaKey: "servicios.card3Cta",
  },
];

const SERVICE_CARDS_HOME = [
  {
    modifier: "", icon: "ti-building-cottage",
    eyebrowKey: "home.aud1Eyebrow", titleKey: "home.aud1Title",
    items: [
      { icon: "ti-check", textKey: "home.aud1li1" },
      { icon: "ti-check", textKey: "home.aud1li2" },
      { icon: "ti-check", textKey: "home.aud1li3" },
      { icon: "ti-check", textKey: "home.aud1li4" },
    ],
    ctaHref: "alianza-propietarios.html", ctaKey: "home.aud1Cta",
  },
  {
    modifier: "audience-card--blue", icon: "ti-luggage",
    eyebrowKey: "home.aud2Eyebrow", titleKey: "home.aud2Title",
    items: [
      { icon: "ti-check", textKey: "home.aud2li1" },
      { icon: "ti-check", textKey: "home.aud2li2" },
      { icon: "ti-check", textKey: "home.aud2li3" },
      { icon: "ti-check", textKey: "home.aud2li4" },
    ],
    ctaHref: "alojamientos.html", ctaKey: "home.aud2Cta",
  },
  {
    modifier: "audience-card--dorado", icon: "ti-heart-handshake",
    eyebrowKey: "home.aud3Eyebrow", titleKey: "home.aud3Title",
    items: [
      { icon: "ti-check", textKey: "home.aud3li1" },
      { icon: "ti-check", textKey: "home.aud3li2" },
      { icon: "ti-check", textKey: "home.aud3li3" },
      { icon: "ti-check", textKey: "home.aud3li4" },
    ],
    ctaHref: "contacto.html", ctaKey: "home.aud3Cta",
  },
];
