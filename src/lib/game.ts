// Gamification + calculator rules for DogFit.

export type MissionKind = "comida" | "calc" | "peso" | "receta" | "consejo";

export const MISSIONS: { kind: MissionKind; title: string; xp: number; to: string }[] = [
  { kind: "comida", title: "Registra la comida de hoy", xp: 10, to: "/hoy" },
  { kind: "consejo", title: "Lee el consejo del día", xp: 5, to: "/hoy" },
  { kind: "calc", title: "Calcula la porción diaria", xp: 10, to: "/calculadora" },
  { kind: "peso", title: "Registra el peso de tu perro", xp: 15, to: "/diario" },
  { kind: "receta", title: "Prepara una receta", xp: 20, to: "/biblioteca" },
];

export const LEVELS = ["Cachorro curioso", "Aprendiz", "Cocinero canino", "Chef DogFit", "Maestro nutri", "Leyenda DogFit"];

/** Total XP needed to reach level L (1-based): 0, 100, 300, 600, 1000… */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelInfo(xp: number) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    name: LEVELS[Math.min(level - 1, LEVELS.length - 1)]!,
    current: xp - start,
    needed: next - start,
    progress: (xp - start) / (next - start),
  };
}

const toKey = (d: Date) => d.toISOString().slice(0, 10);

/** Consecutive active days ending today (or yesterday, so the streak isn't lost until the day ends). */
export function streak(days: string[], today: Date = new Date()): number {
  const set = new Set(days);
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (!set.has(toKey(d))) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while (set.has(toKey(d))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export type Activity = { kind: string; day: string; xp: number };

export function badges(acts: Activity[], dogCount: number) {
  const xp = acts.reduce((s, a) => s + a.xp, 0);
  const count = (k: string) => acts.filter((a) => a.kind === k).length;
  const s = streak(acts.map((a) => a.day));
  return [
    { id: "perro", emoji: "🐶", name: "Primer perro", done: dogCount > 0 },
    { id: "racha3", emoji: "🔥", name: "Racha de 3 días", done: s >= 3 },
    { id: "racha7", emoji: "🏆", name: "Semana perfecta", done: s >= 7 },
    { id: "chef", emoji: "👨‍🍳", name: "5 recetas preparadas", done: count("receta") >= 5 },
    { id: "bascula", emoji: "⚖️", name: "4 pesajes", done: count("peso") >= 4 },
    { id: "nivel3", emoji: "⭐", name: "Nivel 3", done: levelInfo(xp).level >= 3 },
  ];
}

export const TIPS = [
  "Introduce la comida casera poco a poco durante 7 días para evitar molestias.",
  "Nunca uses cebolla ni ajo: son tóxicos para los perros, incluso cocinados.",
  "Pesa a tu perro cada semana a la misma hora para comparar bien.",
  "Agua fresca siempre disponible: cámbiala al menos dos veces al día.",
  "Las porciones son una estimación: ajústalas con tu veterinario.",
  "Los huesos cocidos se astillan. Evítalos siempre.",
  "Guarda las porciones en la nevera hasta 3 días o congélalas.",
];
export const tipOfDay = (d = new Date()) => TIPS[Math.floor(d.getTime() / 86400000) % TIPS.length]!;

// ---- Calculator (estimation only; not a prescription) ----
export type Activity_ = "baja" | "normal" | "alta";
export type CalcInput = {
  weightKg: number;
  stage: "cachorro" | "adulto" | "senior";
  neutered: boolean;
  activity: Activity_;
  overweight: boolean;
  kcalPer100g: number;
};

/** Resting energy requirement: 70 × kg^0.75 */
export const rer = (kg: number) => 70 * Math.pow(kg, 0.75);

export function factor(i: Omit<CalcInput, "weightKg" | "kcalPer100g">): number {
  if (i.overweight) return 1.0;
  if (i.stage === "cachorro") return 2.5;
  let f = i.stage === "senior" ? 1.4 : i.neutered ? 1.6 : 1.8;
  if (i.activity === "baja") f -= 0.2;
  if (i.activity === "alta") f += 0.4;
  return f;
}

export function dailyPlan(i: CalcInput) {
  if (!(i.weightKg > 0) || i.weightKg > 120 || !(i.kcalPer100g > 0)) return null;
  const kcal = Math.round(rer(i.weightKg) * factor(i));
  const grams = Math.round((kcal / i.kcalPer100g) * 100);
  const meals = i.stage === "cachorro" ? 3 : 2;
  return { kcal, grams, meals, perMeal: Math.round(grams / meals), waterMl: Math.round(i.weightKg * 55) };
}
