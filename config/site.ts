export const siteConfig = {
  // Identité de la marque
  name: "Mon Restaurant",
  shortName: "Restaurant",
  description: "Découvrez notre menu exceptionnel en livraison et à emporter.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // Paramètres régionaux
  currency: "CHF",
  locale: "fr-CH",

  // Coordonnées de contact (utilisées dans le Footer, Contact, et SEO)
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+41 00 000 00 00",
    email: "contact@monrestaurant.ch",
    address: {
      street: "123 Rue de la Cuisine",
      city: "Genève",
      zipCode: "1200",
      country: "Suisse"
    }
  },

  // Réseaux sociaux
  links: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/"
  },

  // Paramètres métiers par défaut
  business: {
    minOrderValue: 20,
    deliveryRadiusKm: 10,
    freeDeliveryThreshold: 100
  }
};

export type SiteConfig = typeof siteConfig;