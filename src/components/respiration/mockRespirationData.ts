// Données d'exercices par défaut de qualité pour Cesizen

export const defaultExercises = [
  {
    id: 1,
    label: "Cohérence Cardiaque 365",
    description: "Technique de respiration 3-6-5 pour équilibrer votre rythme cardiaque et réduire le stress. Inspirez pendant 5 secondes, expirez pendant 5 secondes, répétez pendant 5 minutes.",
    phases: [
      { type: "inspire", duration: 5, instruction: "Inspirez profondément par le nez, sentez votre poitrine se gonfler" },
      { type: "expire", duration: 5, instruction: "Expirez lentement par la bouche, relâchez toute tension" },
    ],
    totalDuration: 300,
    isOwner: false,
  },
  {
    id: 2,
    label: "Respiration Carrée",
    description: "Technique de respiration en 4 temps pour améliorer la concentration et la gestion du stress. Chaque phase dure 4 secondes.",
    phases: [
      { type: "inspire", duration: 4, instruction: "Inspirez lentement en comptant jusqu'à 4" },
      { type: "pause", duration: 4, instruction: "Retenez votre souffle en comptant jusqu'à 4" },
      { type: "expire", duration: 4, instruction: "Expirez lentement en comptant jusqu'à 4" },
      { type: "pause", duration: 4, instruction: "Restez sans respirer en comptant jusqu'à 4" },
    ],
    totalDuration: 240,
    isOwner: false,
  },
  {
    id: 3,
    label: "Respiration Relaxante",
    description: "Technique de respiration profonde pour la détente musculaire et la relaxation mentale. Idéale avant le sommeil.",
    phases: [
      { type: "inspire", duration: 6, instruction: "Inspirez profondément, remplissez vos poumons d'air pur" },
      { type: "expire", duration: 8, instruction: "Expirez très lentement, relâchez tous vos muscles" },
    ],
    totalDuration: 180,
    isOwner: false,
  },
  {
    id: 4,
    label: "Respiration Énergisante",
    description: "Technique de respiration dynamique pour augmenter votre énergie et votre vitalité. Parfaite pour le matin.",
    phases: [
      { type: "inspire", duration: 3, instruction: "Inspirez rapidement et énergiquement" },
      { type: "expire", duration: 3, instruction: "Expirez avec force et détermination" },
    ],
    totalDuration: 120,
    isOwner: false,
  },
  {
    id: 5,
    label: "Respiration Méditative",
    description: "Technique de respiration consciente pour la méditation et la pleine conscience. Développez votre présence.",
    phases: [
      { type: "inspire", duration: 7, instruction: "Inspirez en conscience, observez l'air qui entre" },
      { type: "pause", duration: 3, instruction: "Restez présent, observez votre respiration" },
      { type: "expire", duration: 7, instruction: "Expirez en conscience, laissez partir les tensions" },
    ],
    totalDuration: 300,
    isOwner: false,
  },
]; 