import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Droplets, Flame, Scale, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { dailyPlan, type CalcInput } from "@/lib/game";
import { useAward, useGame } from "@/lib/useGame";

export const Route = createFileRoute("/_authenticated/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de porciones — DogFit" },
      { name: "description", content: "Calcula calorías, gramos y agua diarios estimados para tu perro." },
      { property: "og:title", content: "Calculadora de porciones — DogFit" },
      { property: "og:description", content: "Calcula calorías, gramos y agua diarios estimados para tu perro." },
    ],
  }),
  component: Calc,
});

const sel = "h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

function Calc() {
  const award = useAward();
  const { doneToday } = useGame();
  const dogs = useQuery({ queryKey: ["dogs"], queryFn: async () => (await supabase.from("dogs").select("*").order("created_at")).data ?? [] });
  const [i, setI] = useState<CalcInput>({ weightKg: 10, stage: "adulto", neutered: true, activity: "normal", overweight: false, kcalPer100g: 130 });

  const pick = (id: string) => {
    const d = dogs.data?.find((x) => x.id === id);
    if (d) setI({ ...i, weightKg: Number(d.weight_kg) || i.weightKg, stage: (d.life_stage as CalcInput["stage"]) ?? "adulto" });
  };

  const plan = dailyPlan(i);

  useEffect(() => {
    if (!plan || doneToday.has("calc")) return;
    const t = setTimeout(() => award.mutate("calc"), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.kcal, doneToday.has("calc")]);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <section className="space-y-4 rounded-3xl bg-card p-6 shadow-card">
        <h1 className="text-3xl font-extrabold">Calculadora</h1>
        {!!dogs.data?.length && (
          <div className="space-y-1.5"><Label>Usar datos de</Label>
            <select className={sel} defaultValue="" onChange={(e) => pick(e.target.value)}>
              <option value="" disabled>Elige un perro</option>
              {dogs.data.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-1.5"><Label htmlFor="kg">Peso: <strong>{i.weightKg} kg</strong></Label>
          <input id="kg" type="range" min={1} max={80} step={0.5} value={i.weightKg} onChange={(e) => setI({ ...i, weightKg: Number(e.target.value) })} className="w-full accent-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Edad</Label>
            <select className={sel} value={i.stage} onChange={(e) => setI({ ...i, stage: e.target.value as CalcInput["stage"] })}>
              <option value="cachorro">Cachorro</option><option value="adulto">Adulto</option><option value="senior">Senior</option>
            </select>
          </div>
          <div className="space-y-1.5"><Label>Actividad</Label>
            <select className={sel} value={i.activity} onChange={(e) => setI({ ...i, activity: e.target.value as CalcInput["activity"] })}>
              <option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option>
            </select>
          </div>
        </div>
        <label className="flex items-center justify-between rounded-2xl bg-muted p-3 text-sm font-semibold">Castrado/esterilizado <Switch checked={i.neutered} onCheckedChange={(v) => setI({ ...i, neutered: v })} /></label>
        <label className="flex items-center justify-between rounded-2xl bg-muted p-3 text-sm font-semibold">Tiene sobrepeso <Switch checked={i.overweight} onCheckedChange={(v) => setI({ ...i, overweight: v })} /></label>
        <div className="space-y-1.5"><Label htmlFor="den">Calorías de la receta (kcal por 100 g)</Label>
          <Input id="den" type="number" min={50} max={500} value={i.kcalPer100g} onChange={(e) => setI({ ...i, kcalPer100g: Number(e.target.value) })} className="h-11" />
        </div>
      </section>

      <section className="space-y-4">
        {plan ? (
          <>
            <div key={plan.kcal} className="animate-pop rounded-3xl bg-hero p-7 text-primary-foreground">
              <p className="flex items-center gap-2 text-sm opacity-80"><Flame className="h-4 w-4" /> Energía diaria estimada</p>
              <p className="mt-1 font-display text-6xl font-extrabold">{plan.kcal}<span className="ml-2 text-2xl">kcal</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat icon={Scale} label="Comida al día" value={`${plan.grams} g`} />
              <Stat icon={Utensils} label={`${plan.meals} comidas de`} value={`${plan.perMeal} g`} />
              <Stat icon={Droplets} label="Agua aprox." value={`${plan.waterMl} ml`} />
              <Stat icon={Flame} label="Por kg" value={`${Math.round(plan.kcal / i.weightKg)} kcal`} />
            </div>
          </>
        ) : (
          <p className="rounded-3xl bg-muted p-6 text-muted-foreground">Completa peso y calorías para ver el cálculo.</p>
        )}
        <p className="text-xs text-muted-foreground">Estimación general. No reemplaza la indicación de tu veterinario, sobre todo en cachorros, gestación o enfermedad.</p>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-card">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
