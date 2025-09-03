// Configuration des catégories d'articles
export const articleCategories = [
  "Respiration",
  "Méditation", 
  "Bien-être",
  "Santé mentale",
  "Exercices",
  "Techniques",
  "Guides",
  "Actualités"
] as const;

export type ArticleCategory = typeof articleCategories[number];

export const defaultCategory: ArticleCategory = "Respiration"; 