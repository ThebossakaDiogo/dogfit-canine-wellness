import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, TriangleAlert } from "lucide-react";
import { FORBIDDEN_FOODS, recipesFor, type DogSize, type LifeStage } from "@/lib/recipes";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Mi biblioteca — DogFit" },
      { name: "description", content: "Recetas caseras para tu perro por edad y tamaño." },
      { property: "og:title", content: "Mi biblioteca — DogFit" },
      { property: "og:description", content: "Recetas caseras para tu perro por edad y tamaño." },
    ],
  }),
  component: Library,
});

const STAGES: (LifeStage | "todas")[] = ["todas", "cachorro", "adulto", "senior"];
const SIZES: (DogSize | "todos")[] = ["todos", "pequeño", "mediano", "grande"];

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground shadow-card hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function Library() {
  const [stage, setStage] = useState<LifeStage | "todas">("todas");
  const [size, setSize] = useState<DogSize | "todos">("todos");
  const list = recipesFor(stage, size);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-hero p-7 text-primary-foreground">
        <h1 className="text-3xl font-extrabold md:text-4xl">Mi biblioteca</h1>
        <p className="mt-2 max-w-lg opacity-90">Recetas para perros. Consulta a tu veterinario antes de cambiar la dieta.</p>
      </section>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">{STAGES.map((s) => <Chip key={s} active={stage === s} onClick={() => setStage(s)}>{s}</Chip>)}</div>
        <div className="flex flex-wrap gap-2">{SIZES.map((s) => <Chip key={s} active={size === s} onClick={() => setSize(s)}>{s}</Chip>)}</div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-muted p-6 text-center text-muted-foreground">No hay recetas para esta combinación.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((r) => (
            <Link key={r.id} to="/receta/$id" params={{ id: r.id }} className="group rounded-3xl bg-card p-5 shadow-card transition hover:-translate-y-0.5">
              <div className="flex flex-wrap gap-1.5">
                {r.stages.map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize text-secondary-foreground">{s}</span>)}
              </div>
              <h2 className="mt-3 text-xl font-bold group-hover:text-primary">{r.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>
              <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {r.minutes} min</p>
            </Link>
          ))}
        </div>
      )}

      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-xl font-bold"><TriangleAlert className="h-5 w-5 text-accent" /> Alimentos prohibidos</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FORBIDDEN_FOODS.map((f) => <li key={f} className="rounded-full bg-muted px-3 py-1 text-sm">{f}</li>)}
        </ul>
      </section>
    </div>
  );
}
