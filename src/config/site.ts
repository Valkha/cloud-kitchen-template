export const siteConfig = {
  // Identité du restaurant
  name: "Template Restaurant",
  shortName: "Template", 
  description: "L'excellence culinaire, sur place ou chez vous.",
  url: "https://ton-domaine.com",
  locale: "fr",
  
  // 🔗 Le LIEN avec Supabase (Doit correspondre exactement au "slug" de la table restaurants)
  restaurantSlug: "ma-super-cuisine", 
  
  // Paramètres e-commerce
  currency: "CHF", // ou "€", "$", etc.
  
  // Coordonnées (utilisées dans le Footer et la page Contact)
  contact: {
    email: "contact@templatedomain.com",
    phone: "+41 22 000 00 00",
    address: {
      street: "123 Rue de la Gastronomie",
      city: "Genève",
      zipCode: "1200",
      country: "Suisse"
    }
  },
  
  // Réseaux sociaux (laisser vide "" si non utilisé)
  links: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },

  // Informations légales (Mentions légales, facturation)
  business: {
    companyName: "Template Corp",
    vatNumber: "CHE-000.000.000 TVA",
  }
};

export type SiteConfig = typeof siteConfig;