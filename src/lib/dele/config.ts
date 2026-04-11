// DELE Exam Configuration
// Based on Instituto Cervantes DELE exam structure

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DELELevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type DELESkill =
  | "comprension-lectura"
  | "comprension-auditiva"
  | "expresion-escrita"
  | "expresion-oral"
  | "gramatica";

export interface DELESkillStructure {
  id: DELESkill;
  name: string;
  durationMinutes: number;
  totalPoints: number;
  passThreshold: number; // percentage to pass this section
  description: string;
}

export interface DELELevelConfig {
  level: DELELevel;
  name: string;
  fullName: string;
  color: string;
  colorDark: string;
  skills: DELESkillStructure[];
  overallPassThreshold: number; // percentage
  totalDurationMinutes: number;
}

// ---------------------------------------------------------------------------
// Skill Definitions
// ---------------------------------------------------------------------------

const READING: DELESkillStructure = {
  id: "comprension-lectura",
  name: "Comprension de lectura",
  durationMinutes: 70,
  totalPoints: 25,
  passThreshold: 60,
  description: "Comprension de textos escritos de diversa naturaleza y complejidad.",
};

const LISTENING: DELESkillStructure = {
  id: "comprension-auditiva",
  name: "Comprension auditiva",
  durationMinutes: 40,
  totalPoints: 25,
  passThreshold: 60,
  description: "Comprension de mensajes orales en distintos contextos comunicativos.",
};

const WRITING: DELESkillStructure = {
  id: "expresion-escrita",
  name: "Expresion e interaccion escritas",
  durationMinutes: 60,
  totalPoints: 25,
  passThreshold: 60,
  description: "Produccion de textos escritos claros y detallados.",
};

const SPEAKING: DELESkillStructure = {
  id: "expresion-oral",
  name: "Expresion e interaccion orales",
  durationMinutes: 15,
  totalPoints: 25,
  passThreshold: 60,
  description: "Comunicacion oral fluida y espontanea con preparacion previa.",
};

const GRAMMAR: DELESkillStructure = {
  id: "gramatica",
  name: "Gramatica y vocabulario",
  durationMinutes: 60,
  totalPoints: 25,
  passThreshold: 60,
  description: "Dominio de estructuras gramaticales y vocabulario contextualizado.",
};

// ---------------------------------------------------------------------------
// Level Configurations
// ---------------------------------------------------------------------------

export const DELE_LEVELS: DELELevelConfig[] = [
  {
    level: "A1",
    name: "A1 - Acceso",
    fullName: "Diploma de Espanol Nivel A1",
    color: "#22c55e",
    colorDark: "#16a34a",
    skills: [
      { ...READING, durationMinutes: 45, totalPoints: 25 },
      { ...LISTENING, durationMinutes: 20, totalPoints: 25 },
      { ...WRITING, durationMinutes: 25, totalPoints: 25 },
      { ...SPEAKING, durationMinutes: 10, totalPoints: 25 },
      { ...GRAMMAR, durationMinutes: 30, totalPoints: 25 },
    ],
    overallPassThreshold: 60,
    totalDurationMinutes: 130,
  },
  {
    level: "A2",
    name: "A2 - Plataforma",
    fullName: "Diploma de Espanol Nivel A2",
    color: "#16a34a",
    colorDark: "#15803d",
    skills: [
      { ...READING, durationMinutes: 60, totalPoints: 25 },
      { ...LISTENING, durationMinutes: 35, totalPoints: 25 },
      { ...WRITING, durationMinutes: 50, totalPoints: 25 },
      { ...SPEAKING, durationMinutes: 12, totalPoints: 25 },
      { ...GRAMMAR, durationMinutes: 40, totalPoints: 25 },
    ],
    overallPassThreshold: 60,
    totalDurationMinutes: 197,
  },
  {
    level: "B1",
    name: "B1 - Umbral",
    fullName: "Diploma de Espanol Nivel B1",
    color: "#2563eb",
    colorDark: "#1d4ed8",
    skills: [
      { ...READING, durationMinutes: 70, totalPoints: 25 },
      { ...LISTENING, durationMinutes: 40, totalPoints: 25 },
      { ...WRITING, durationMinutes: 60, totalPoints: 25 },
      { ...SPEAKING, durationMinutes: 15, totalPoints: 25 },
      { ...GRAMMAR, durationMinutes: 60, totalPoints: 25 },
    ],
    overallPassThreshold: 60,
    totalDurationMinutes: 245,
  },
  {
    level: "B2",
    name: "B2 - Avanzado",
    fullName: "Diploma de Espanol Nivel B2",
    color: "#1d4ed8",
    colorDark: "#1e40af",
    skills: [
      { ...READING, durationMinutes: 70, totalPoints: 25 },
      { ...LISTENING, durationMinutes: 40, totalPoints: 25 },
      { ...WRITING, durationMinutes: 80, totalPoints: 25 },
      { ...SPEAKING, durationMinutes: 20, totalPoints: 25 },
      { ...GRAMMAR, durationMinutes: 60, totalPoints: 25 },
    ],
    overallPassThreshold: 60,
    totalDurationMinutes: 270,
  },
  {
    level: "C1",
    name: "C1 - Dominio operativo",
    fullName: "Diploma de Espanol Nivel C1",
    color: "#9333ea",
    colorDark: "#7c3aed",
    skills: [
      { ...READING, durationMinutes: 90, totalPoints: 25 },
      { ...LISTENING, durationMinutes: 50, totalPoints: 25 },
      { ...WRITING, durationMinutes: 80, totalPoints: 25 },
      { ...SPEAKING, durationMinutes: 20, totalPoints: 25 },
      { ...GRAMMAR, durationMinutes: 60, totalPoints: 25 },
    ],
    overallPassThreshold: 60,
    totalDurationMinutes: 300,
  },
  {
    level: "C2",
    name: "C2 - Maestria",
    fullName: "Diploma de Espanol Nivel C2",
    color: "#7c3aed",
    colorDark: "#6d28d9",
    skills: [
      { ...READING, durationMinutes: 90, totalPoints: 25 },
      { ...LISTENING, durationMinutes: 55, totalPoints: 25 },
      { ...WRITING, durationMinutes: 80, totalPoints: 25 },
      { ...SPEAKING, durationMinutes: 20, totalPoints: 25 },
      { ...GRAMMAR, durationMinutes: 60, totalPoints: 25 },
    ],
    overallPassThreshold: 70,
    totalDurationMinutes: 305,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getDELELevel(level: string): DELELevelConfig | undefined {
  return DELE_LEVELS.find((l) => l.level === level.toUpperCase());
}

export function getDELESkillConfig(
  level: string,
  skillId: string,
): DELESkillStructure | undefined {
  const levelConfig = getDELELevel(level);
  if (!levelConfig) return undefined;
  return levelConfig.skills.find((s) => s.id === skillId);
}

export function getExamDuration(level: string, skillId?: string): number {
  const levelConfig = getDELELevel(level);
  if (!levelConfig) return 60;
  if (skillId) {
    const skill = levelConfig.skills.find((s) => s.id === skillId);
    return skill?.durationMinutes ?? 60;
  }
  return levelConfig.totalDurationMinutes;
}

export const EXAM_CONFIG = {
  examId: "dele",
  slug: "dele",
  name: "DELE",
  fullName: "Diplomas de Espanol como Lengua Extranjera",
  family: "DELE",
  category: "Certificacion de idiomas",
  country: "Global",
  languages: ["es"],
  locale: "es",
  isRTL: false,
  freemiumGate: {
    dailyQuestions: 10,
  },
  themeColor: "#DC2626",
  themeColorDark: "#B91C1C",
  themeGold: "#F59E0B",
  themeNavy: "#1E3A5F",
  themeEmerald: "#059669",
} as const;

export type ExamConfig = typeof EXAM_CONFIG;
