import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, TriangleAlert } from "lucide-react";
import { RECIPES } from "@/lib/recipes";
import { Button } from "@/components/ui/button";
import { useAward, useGame } from "@/lib/useGame";

export const Route = createFileRoute("/_authenticated/receta/$id")({
  loader: ({ params }) => {
    const recipe = RECIPES.find((r) => r.id === params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.recipe.name ?? "Receta"} — DogFit` },
      { name: "description", content: loaderData?.recipe.summary ?? "Receta casera para perros." },
      { property: "og:title", content: `${loaderData?.recipe.name ?? "Receta"} — DogFit` },
      { property: "og:description", content: loaderData?.recipe.summary ?? "Receta casera para perros." },
    ],
  }),
  notFoundComponent: () => <p className="text-muted-foreground">Receta no encontrada.</p>,
  component: RecipePage,
});

function RecipePage() {
  const { recipe: r } = Route.useLoaderData();
  const award = useAward();
  const { doneToday } = useGame();
  const cooked = doneToday.has("receta");
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link to="/biblioteca" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Biblioteca</Link>
      <img src={r.image} alt={r.name} width={944} height={704} className="animate-pop h-64 w-full rounded-3xl object-cover md:h-80" />
      <header>
        <h1 className="text-4xl font-extrabold">{r.name}</h1>
        <p className="mt-2 text-muted-foreground">{r.summary}</p>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {r.minutes} min</span>
          <span className="capitalize">{r.stages.join(" · ")}</span>
          <span className="capitalize">Tamaño: {r.sizes.join(", ")}</span>
        </p>
      </header>
      {r.warning && (
        <div className="flex gap-3 rounded-2xl bg-secondary p-4 text-sm"><TriangleAlert className="h-5 w-5 shrink-0 text-accent" /> {r.warning}</div>
      )}
      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Ingredientes</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">{r.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
      </section>
      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Preparación</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">{r.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>
      <Button variant="hero" size="xl" className="w-full" disabled={cooked || award.isPending} onClick={() => award.mutate("receta")}>
        {cooked ? "¡Preparada hoy! ✓" : "La preparé · +20 XP"}
      </Button>
      <Link to="/calculadora" className="block text-center text-sm font-semibold text-primary">Calcula cuántos gramos servir →</Link>
      <p className="text-xs text-muted-foreground">Las porciones dependen del peso y la salud de tu perro. Consulta a tu veterinario.</p>
    </article>
  );
}
