// Recetas de MUESTRA. Deben ser reemplazadas por recetas revisadas por un profesional antes de vender.
export type LifeStage = "cachorro" | "adulto" | "senior";
export type DogSize = "pequeño" | "mediano" | "grande";

export type Recipe = {
  id: string;
  name: string;
  stages: LifeStage[];
  sizes: DogSize[];
  minutes: number;
  summary: string;
  ingredients: string[];
  steps: string[];
  warning?: string;
};

const ALL_SIZES: DogSize[] = ["pequeño", "mediano", "grande"];

export const RECIPES: Recipe[] = [
  {
    id: "pollo-arroz-zanahoria",
    name: "Pollo con arroz y zanahoria",
    stages: ["adulto", "senior"],
    sizes: ALL_SIZES,
    minutes: 35,
    summary: "Base suave y fácil de digerir.",
    ingredients: ["Pechuga de pollo sin piel ni huesos", "Arroz blanco cocido", "Zanahoria cocida", "Aceite de oliva (poca cantidad)"],
    steps: ["Cocina el pollo en agua sin sal.", "Cocina el arroz y la zanahoria por separado.", "Desmenuza el pollo y mezcla todo.", "Deja enfriar antes de servir."],
    warning: "Sin sal, cebolla ni ajo.",
  },
  {
    id: "pavo-calabaza",
    name: "Pavo con calabaza",
    stages: ["adulto"],
    sizes: ALL_SIZES,
    minutes: 30,
    summary: "Proteína magra con fibra natural.",
    ingredients: ["Carne de pavo molida", "Calabaza cocida", "Avena cocida", "Espinaca cocida"],
    steps: ["Dora el pavo sin aceite ni condimentos.", "Agrega calabaza y avena cocidas.", "Añade la espinaca picada al final.", "Enfría y porciona."],
  },
  {
    id: "res-batata-senior",
    name: "Res magra con batata",
    stages: ["senior"],
    sizes: ["mediano", "grande"],
    minutes: 40,
    summary: "Textura blanda para perros mayores.",
    ingredients: ["Carne de res magra", "Batata cocida", "Judías verdes cocidas"],
    steps: ["Cocina la carne en trozos pequeños.", "Haz puré de batata.", "Mezcla con las judías picadas finas."],
  },
  {
    id: "pescado-arroz-cachorro",
    name: "Pescado blanco con arroz",
    stages: ["cachorro", "adulto"],
    sizes: ["pequeño", "mediano"],
    minutes: 25,
    summary: "Opción ligera, revisa porciones con tu veterinario.",
    ingredients: ["Filete de pescado blanco sin espinas", "Arroz cocido", "Calabacín cocido"],
    steps: ["Cocina el pescado al vapor.", "Retira cualquier espina.", "Mezcla con arroz y calabacín."],
    warning: "Cachorros necesitan pauta profesional específica.",
  },
];

export const FORBIDDEN_FOODS = ["Chocolate", "Uvas y pasas", "Cebolla y ajo", "Xilitol (edulcorante)", "Aguacate", "Alcohol", "Café", "Huesos cocidos", "Nueces de macadamia"];

export function recipesFor(stage: LifeStage | "todas", size: DogSize | "todos"): Recipe[] {
  return RECIPES.filter(
    (r) => (stage === "todas" || r.stages.includes(stage)) && (size === "todos" || r.sizes.includes(size)),
  );
}
