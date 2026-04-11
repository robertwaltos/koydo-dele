// DELE Gamification System

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  lastStudyDate: string | null;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: StreakData;
  achievements: Achievement[];
  dailyQuestionsToday: number;
  dailyGoal: number;
}

// XP constants
export const XP_PER_QUESTION = 10;
export const XP_CORRECT_BONUS = 5;
export const XP_STREAK_BONUS = 20; // per day of streak
export const XP_EXAM_COMPLETE = 100;
export const XP_PER_LEVEL = 500;

export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function xpToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const nextLevelXp = currentLevel * XP_PER_LEVEL;
  return nextLevelXp - xp;
}

export function xpProgressPercent(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const levelStartXp = (currentLevel - 1) * XP_PER_LEVEL;
  const progress = xp - levelStartXp;
  return Math.round((progress / XP_PER_LEVEL) * 100);
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_question", name: "Primera pregunta", description: "Completa tu primera pregunta de practica", icon: "star" },
  { id: "streak_3", name: "Racha de 3 dias", description: "Estudia 3 dias seguidos", icon: "flame" },
  { id: "streak_7", name: "Semana perfecta", description: "Estudia 7 dias seguidos", icon: "flame" },
  { id: "streak_30", name: "Constancia total", description: "Estudia 30 dias seguidos", icon: "flame" },
  { id: "questions_100", name: "Centenario", description: "Responde 100 preguntas", icon: "target" },
  { id: "questions_500", name: "Incansable", description: "Responde 500 preguntas", icon: "target" },
  { id: "first_exam", name: "Primer examen", description: "Completa tu primer examen simulado", icon: "file-text" },
  { id: "pass_a1", name: "Aprobado A1", description: "Aprueba un examen simulado de nivel A1", icon: "check-circle" },
  { id: "pass_a2", name: "Aprobado A2", description: "Aprueba un examen simulado de nivel A2", icon: "check-circle" },
  { id: "pass_b1", name: "Aprobado B1", description: "Aprueba un examen simulado de nivel B1", icon: "check-circle" },
  { id: "pass_b2", name: "Maestro B2", description: "Aprueba un examen simulado de nivel B2", icon: "award" },
  { id: "pass_c1", name: "Experto C1", description: "Aprueba un examen simulado de nivel C1", icon: "award" },
  { id: "pass_c2", name: "Hispanohablante nativo", description: "Aprueba un examen simulado de nivel C2", icon: "crown" },
  { id: "all_skills", name: "Completo", description: "Practica las 5 areas de habilidad", icon: "layers" },
  { id: "perfect_score", name: "Puntuacion perfecta", description: "Obtiene 100% en una sesion de practica", icon: "zap" },
];
