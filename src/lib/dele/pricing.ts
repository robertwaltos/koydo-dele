// DELE Pricing Configuration — EUR pricing for Spanish market

export const PRICING = {
  free: {
    dailyQuestions: 10,
    features: [
      "10 preguntas por dia",
      "Seguimiento de puntuacion",
      "Tutor IA (3 explicaciones/dia)",
      "Revision de formato DELE",
    ],
  },
  premium: {
    monthlyPrice: 6.99,
    yearlyPrice: 69.99,
    currency: "EUR",
    currencySymbol: "\u20ac",
    features: [
      "Preguntas ilimitadas",
      "Tutor IA completo y explicaciones",
      "Examenes simulados completos",
      "Prediccion de puntuacion avanzada",
      "Plan de estudio personalizado",
      "Soporte prioritario",
    ],
  },
} as const;
