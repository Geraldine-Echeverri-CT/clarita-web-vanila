// Datos de alojamientos, compartidos entre páginas (listado, detalle, checkout).
// Campos que varían por idioma son objetos { es, en, fr }; el resto es fijo.

const PROPIEDADES = {
  "casa-palma": {
    nombre: "Casa Palma",
    zona: { es: "Nosara, Playa Guiones", en: "Nosara, Guiones Beach", fr: "Nosara, plage de Guiones" },
    huespedes: 4,
    habitaciones: 2,
    amenity: { es: "Piscina", en: "Pool", fr: "Piscine" },
    precio: 180,
    img: "src/assets/photos/villa-pool-1.webp",
    ocupado: [["2026-09-12", "2026-09-18"], ["2026-10-05", "2026-10-10"]],
    descripcion: {
      es: "Casa Palma es una villa luminosa a pocos minutos de Playa Guiones, pensada para familias o grupos de amigos que buscan comodidad sin perder la esencia tropical de Nosara. Sus espacios abiertos se conectan con una piscina privada rodeada de vegetación, ideal para desconectar después de un día de playa.",
      en: "Casa Palma is a bright villa just minutes from Guiones Beach, designed for families or groups of friends seeking comfort without losing Nosara's tropical essence. Its open spaces connect to a private pool surrounded by greenery, perfect for unwinding after a day at the beach.",
      fr: "Casa Palma est une villa lumineuse à quelques minutes de la plage de Guiones, pensée pour les familles ou groupes d'amis en quête de confort sans perdre l'esprit tropical de Nosara. Ses espaces ouverts donnent sur une piscine privée entourée de végétation, idéale pour se détendre après une journée de plage."
    },
    amenities: {
      es: ["Piscina privada", "Wifi de alta velocidad", "Cocina totalmente equipada", "Aire acondicionado en habitaciones", "Parqueo privado", "Terraza con hamacas"],
      en: ["Private pool", "High-speed Wifi", "Fully equipped kitchen", "Air conditioning in bedrooms", "Private parking", "Terrace with hammocks"],
      fr: ["Piscine privée", "Wifi haut débit", "Cuisine entièrement équipée", "Climatisation dans les chambres", "Stationnement privé", "Terrasse avec hamacs"]
    },
    galeria: [
      "src/assets/photos/living-room-1.webp",
      "src/assets/photos/living-room-4.webp",
      "src/assets/photos/pool-1.webp",
      "src/assets/photos/kitchen-1.webp",
      "src/assets/photos/terrace-1.webp",
      "src/assets/photos/palm-water-1.webp",
      "src/assets/photos/surfers-1.webp",
      "src/assets/photos/yoga-beach-1.webp"
    ]
  },
  "villa-brisa": {
    nombre: "Villa Brisa",
    zona: { es: "Nosara, Playa Pelada", en: "Nosara, Pelada Beach", fr: "Nosara, plage de Pelada" },
    huespedes: 6,
    habitaciones: 3,
    amenity: { es: "Piscina", en: "Pool", fr: "Piscine" },
    precio: 220,
    img: "src/assets/photos/villa-exterior-1.webp",
    ocupado: [["2026-09-20", "2026-09-25"]],
    descripcion: {
      es: "Villa Brisa combina diseño tropical-minimalista con vistas abiertas hacia la vegetación de Playa Pelada. Sus tres habitaciones y áreas sociales amplias la hacen ideal para grupos grandes o familias extendidas que buscan compartir tiempo de calidad en Nosara.",
      en: "Villa Brisa combines tropical-minimalist design with open views over the greenery of Pelada Beach. Its three bedrooms and spacious common areas make it ideal for large groups or extended families looking to share quality time in Nosara.",
      fr: "Villa Brisa allie design tropical minimaliste et vues dégagées sur la végétation de la plage de Pelada. Ses trois chambres et ses vastes espaces communs en font un lieu idéal pour les grands groupes ou familles élargies souhaitant partager de bons moments à Nosara."
    },
    amenities: {
      es: ["Piscina privada", "Wifi de alta velocidad", "Cocina totalmente equipada", "Aire acondicionado", "Parqueo privado", "A 5 minutos de la playa en bicicleta"],
      en: ["Private pool", "High-speed Wifi", "Fully equipped kitchen", "Air conditioning", "Private parking", "5-minute bike ride to the beach"],
      fr: ["Piscine privée", "Wifi haut débit", "Cuisine entièrement équipée", "Climatisation", "Stationnement privé", "Plage à 5 minutes à vélo"]
    },
    galeria: [
      "src/assets/photos/living-room-2.webp",
      "src/assets/photos/living-room-5.webp",
      "src/assets/photos/villa-pool-1.webp",
      "src/assets/photos/terrace-hammock-1.webp",
      "src/assets/photos/kitchen-2.webp"
    ]
  },
  "casa-arena": {
    nombre: "Casa Arena",
    zona: { es: "Nosara, Playa Guiones", en: "Nosara, Guiones Beach", fr: "Nosara, plage de Guiones" },
    huespedes: 5,
    habitaciones: 2,
    amenity: { es: "A pasos de la playa", en: "Steps from the beach", fr: "À deux pas de la plage" },
    precio: 150,
    img: "src/assets/photos/villa-exterior-2.webp",
    ocupado: [["2026-09-09", "2026-09-15"], ["2026-09-28", "2026-10-02"]],
    descripcion: {
      es: "A pasos de Playa Guiones, Casa Arena ofrece la posibilidad de vivir el ritmo de Nosara de cerca: caminar hasta el mar, disfrutar del atardecer desde la terraza y volver a casa sin necesidad de auto. Un espacio cálido y funcional, ideal para amantes del surf.",
      en: "Steps from Guiones Beach, Casa Arena lets you live Nosara's rhythm up close: walk to the sea, enjoy the sunset from the terrace, and get home without a car. A warm, functional space, ideal for surf lovers.",
      fr: "À deux pas de la plage de Guiones, Casa Arena permet de vivre le rythme de Nosara au plus près : marcher jusqu'à la mer, profiter du coucher de soleil depuis la terrasse et rentrer sans voiture. Un espace chaleureux et fonctionnel, idéal pour les amateurs de surf."
    },
    amenities: {
      es: ["A pasos de la playa", "Wifi de alta velocidad", "Cocina equipada", "Ventiladores de techo", "Guardatablas de surf", "Terraza exterior"],
      en: ["Steps from the beach", "High-speed Wifi", "Equipped kitchen", "Ceiling fans", "Surfboard storage", "Outdoor terrace"],
      fr: ["À deux pas de la plage", "Wifi haut débit", "Cuisine équipée", "Ventilateurs de plafond", "Rangement pour planches de surf", "Terrasse extérieure"]
    },
    galeria: [
      "src/assets/photos/living-room-3.webp",
      "src/assets/photos/living-room-6.webp",
      "src/assets/photos/seaside-chair-1.webp",
      "src/assets/photos/kitchen-1.webp",
      "src/assets/photos/surfboards-1.webp"
    ]
  },
  "nalu-house": {
    nombre: "Nalu House",
    zona: { es: "Nosara, Playa Guiones", en: "Nosara, Guiones Beach", fr: "Nosara, plage de Guiones" },
    huespedes: 4,
    habitaciones: 2,
    amenity: { es: "Aire acondicionado", en: "Air conditioning", fr: "Climatisation" },
    precio: 170,
    img: "src/assets/photos/villa-exterior-3.webp",
    ocupado: [["2026-10-01", "2026-10-08"]],
    descripcion: {
      es: "Nalu House es una propuesta moderna y confortable en el corazón de Playa Guiones, con aire acondicionado en todas las habitaciones para los días más cálidos. Su diseño abierto y luminoso la convierte en una excelente opción para parejas o familias pequeñas.",
      en: "Nalu House is a modern, comfortable option in the heart of Guiones Beach, with air conditioning in every bedroom for the warmer days. Its open, bright design makes it a great choice for couples or small families.",
      fr: "Nalu House est une proposition moderne et confortable au cœur de la plage de Guiones, avec climatisation dans toutes les chambres pour les journées les plus chaudes. Son design ouvert et lumineux en fait une excellente option pour les couples ou petites familles."
    },
    amenities: {
      es: ["Aire acondicionado", "Wifi de alta velocidad", "Cocina equipada", "Parqueo privado", "Cerca de restaurantes y cafés", "Ropa de cama premium"],
      en: ["Air conditioning", "High-speed Wifi", "Equipped kitchen", "Private parking", "Close to restaurants and cafés", "Premium bedding"],
      fr: ["Climatisation", "Wifi haut débit", "Cuisine équipée", "Stationnement privé", "Proche des restaurants et cafés", "Linge de lit haut de gamme"]
    },
    galeria: [
      "src/assets/photos/living-room-4.webp",
      "src/assets/photos/living-room-1.webp",
      "src/assets/photos/kitchen-2.webp",
      "src/assets/photos/terrace-1.webp",
      "src/assets/photos/pool-1.webp"
    ]
  },
  "villa-sol": {
    nombre: "Villa Sol",
    zona: { es: "Nosara, Playa Pelada", en: "Nosara, Pelada Beach", fr: "Nosara, plage de Pelada" },
    huespedes: 6,
    habitaciones: 3,
    amenity: { es: "Piscina", en: "Pool", fr: "Piscine" },
    precio: 260,
    img: "src/assets/photos/resort-tropical-1.webp",
    ocupado: [["2026-09-15", "2026-09-22"], ["2026-11-01", "2026-11-05"]],
    descripcion: {
      es: "Villa Sol es nuestra propiedad más espaciosa en Playa Pelada: tres habitaciones, piscina privada y una cocina amplia pensada para reuniones familiares. Perfecta para quienes buscan privacidad, espacio y una estadía sin apuros en Nosara.",
      en: "Villa Sol is our most spacious property in Pelada Beach: three bedrooms, a private pool and a large kitchen made for family gatherings. Perfect for those seeking privacy, space and an unhurried stay in Nosara.",
      fr: "Villa Sol est notre propriété la plus spacieuse à la plage de Pelada : trois chambres, une piscine privée et une grande cuisine pensée pour les réunions de famille. Idéale pour ceux qui recherchent intimité, espace et un séjour sans précipitation à Nosara."
    },
    amenities: {
      es: ["Piscina privada", "Wifi de alta velocidad", "Cocina totalmente equipada", "Aire acondicionado", "Parqueo privado", "Zona de asados"],
      en: ["Private pool", "High-speed Wifi", "Fully equipped kitchen", "Air conditioning", "Private parking", "BBQ area"],
      fr: ["Piscine privée", "Wifi haut débit", "Cuisine entièrement équipée", "Climatisation", "Stationnement privé", "Espace barbecue"]
    },
    galeria: [
      "src/assets/photos/living-room-5.webp",
      "src/assets/photos/living-room-2.webp",
      "src/assets/photos/villa-pool-1.webp",
      "src/assets/photos/kitchen-1.webp",
      "src/assets/photos/terrace-hammock-1.webp"
    ]
  },
  "casa-bosque": {
    nombre: "Casa Bosque",
    zona: { es: "Nosara, Barrio K Section", en: "Nosara, K Section", fr: "Nosara, quartier K Section" },
    huespedes: 4,
    habitaciones: 2,
    amenity: { es: "Jardín privado", en: "Private garden", fr: "Jardin privé" },
    precio: 140,
    img: "src/assets/photos/island-houses-1.webp",
    ocupado: [["2026-09-10", "2026-09-14"]],
    descripcion: {
      es: "Rodeada de vegetación en el tranquilo Barrio K Section, Casa Bosque es la opción ideal para quienes buscan silencio y contacto con la naturaleza sin alejarse demasiado de la playa. Su jardín privado invita a desconectar por completo.",
      en: "Surrounded by greenery in the quiet K Section, Casa Bosque is the ideal choice for those seeking silence and contact with nature without straying too far from the beach. Its private garden invites you to fully unwind.",
      fr: "Entourée de végétation dans le quartier tranquille de K Section, Casa Bosque est le choix idéal pour ceux qui recherchent le silence et le contact avec la nature sans s'éloigner trop de la plage. Son jardin privé invite à une déconnexion totale."
    },
    amenities: {
      es: ["Jardín privado", "Wifi de alta velocidad", "Cocina equipada", "Ventiladores de techo", "Parqueo privado", "Zona tranquila y arbolada"],
      en: ["Private garden", "High-speed Wifi", "Equipped kitchen", "Ceiling fans", "Private parking", "Quiet, tree-lined area"],
      fr: ["Jardin privé", "Wifi haut débit", "Cuisine équipée", "Ventilateurs de plafond", "Stationnement privé", "Zone calme et arborée"]
    },
    galeria: [
      "src/assets/photos/villa-interior-garden-1.webp",
      "src/assets/photos/living-room-3.webp",
      "src/assets/photos/resort-aerial-1.webp",
      "src/assets/photos/kitchen-2.webp",
      "src/assets/photos/seaside-chair-1.webp"
    ]
  }
};
