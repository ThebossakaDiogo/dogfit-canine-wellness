import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Lightbulb, Lock, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgressBar, Ring } from "@/components/game";
import { MISSIONS, badges, tipOfDay } from "@/lib/game";
import { useAward, useGame } from "@/lib/useGame";
import { RECIPES } from "@/lib/recipes";
import mascot from "@/assets/mascot.png";

export const Route = createFileRoute("/_authenticated/hoy")({
  head: () => ({
    meta: [
      { title: "Hoy — DogFit" },
      { name: "description", content: "Tus misiones diarias, racha y nivel en DogFit." },
      { property: "og:title", content: "Hoy — DogFit" },
      { property: "og:description", content: "Tus misiones diarias, racha y nivel en DogFit." },
    ],
  }),
  component: Today,
});

function Today() {
  const g = useGame();
  const award = useAward();
  const dogs = useQuery({
    queryKey: ["dogs"],
    queryFn: async () => (await supabase.from("dogs").select("*").order("created_at")).data ?? [],
  });
  const dog = dogs.data?.[0];
  const done = MISSIONS.filter((m) => g.doneToday.has(m.kind)).length;
  const recipe = RECIPES[new Date().getDate() % RECIPES.length]!;
  const list = badges(g.acts, dogs.data?.length ?? 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground md:p-8">
        <div className="relative z-10 max-w-[62%] md:max-w-md">
          <p className="text-sm opacity-80">{dog ? `Hola, equipo ${dog.name}` : "¡Hola!"}</p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Nivel {g.level.level} · {g.level.name}</h1>
          <div className="mt-4"><ProgressBar value={g.level.progress} /></div>
          <p className="mt-2 text-sm opacity-90">{g.level.current} / {g.level.needed} XP para el siguiente nivel</p>
        </div>
        <img src={mascot} alt="" width={1024} height={1024} className="animate-float absolute -bottom-4 right-0 h-44 w-44 md:h-56 md:w-56" />
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
          <span className={`text-4xl ${g.streak > 0 ? "animate-flame" : "grayscale"}`}>🔥</span>
          <div><p className="font-display text-3xl font-extrabold">{g.streak}</p><p className="text-sm text-muted-foreground">días de racha</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
          <Ring value={done / MISSIONS.length}><div><p className="font-display text-2xl font-extrabold">{done}/{MISSIONS.length}</p><p className="text-[10px] text-muted-foreground">misiones</p></div></Ring>
          <p className="text-sm text-muted-foreground">{done === MISSIONS.length ? "¡Día completo! 🎉" : "Completa todas para cerrar el anillo"}</p>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
          <span className="text-4xl">⭐</span>
          <div><p className="font-display text-3xl font-extrabold">{g.xp}</p><p className="text-sm text-muted-foreground">XP total</p></div>
        </div>
      </div>

      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Misiones de hoy</h2>
        <ul className="mt-4 space-y-2">
          {MISSIONS.map((m) => {
            const ok = g.doneToday.has(m.kind);
            const inline = m.kind === "comida" || m.kind === "consejo";
            const body = (
              <>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${ok ? "animate-pop bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{ok ? <Check className="h-5 w-5" /> : null}</span>
                <span className={`flex-1 font-semibold ${ok ? "text-muted-foreground line-through" : ""}`}>{m.title}</span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">+{m.xp} XP</span>
                {!inline && !ok && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </>
            );
            const cls = "flex items-center gap-3 rounded-2xl p-3 transition hover:bg-muted";
            return (
              <li key={m.kind}>
                {inline || ok ? <div className={cls}>{body}</div> : <Link to={m.to} className={cls}>{body}</Link>}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button variant="hero" size="xl" disabled={g.doneToday.has("comida") || award.isPending} onClick={() => award.mutate("comida")}>
            <Utensils /> {g.doneToday.has("comida") ? "Comida registrada" : "Ya comió hoy"}
          </Button>
          <div className="rounded-2xl bg-secondary p-4 text-sm">
            <p className="flex items-center gap-1.5 font-bold"><Lightbulb className="h-4 w-4 text-accent" /> Consejo del día</p>
            <p className="mt-1">{tipOfDay()}</p>
            {!g.doneToday.has("consejo") && <button className="mt-2 font-semibold text-primary underline" onClick={() => award.mutate("consejo")}>Entendido (+5 XP)</button>}
          </div>
        </div>
      </section>

      <Link to="/receta/$id" params={{ id: recipe.id }} className="group grid overflow-hidden rounded-3xl bg-card shadow-card sm:grid-cols-2">
        <img src={recipe.image} alt={recipe.name} loading="lazy" width={944} height={704} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-full" />
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Receta sugerida</p>
          <h2 className="mt-1 text-2xl font-bold">{recipe.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{recipe.summary}</p>
          <p className="mt-4 text-sm font-semibold text-primary">Prepárala y gana +20 XP →</p>
        </div>
      </Link>

      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Insignias</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {list.map((b) => (
            <div key={b.id} className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center ${b.done ? "animate-pop bg-secondary" : "bg-muted opacity-60"}`}>
              <span className={`relative text-3xl ${b.done ? "" : "grayscale"}`}>{b.emoji}{!b.done && <Lock className="absolute -bottom-1 -right-2 h-4 w-4 text-muted-foreground" />}</span>
              <span className="text-xs font-semibold">{b.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
