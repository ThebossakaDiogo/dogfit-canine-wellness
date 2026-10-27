import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAward } from "@/lib/useGame";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({
    meta: [
      { title: "Diario de peso — DogFit" },
      { name: "description", content: "Registra el peso de tu perro y mira su evolución." },
      { property: "og:title", content: "Diario de peso — DogFit" },
      { property: "og:description", content: "Registra el peso de tu perro y mira su evolución." },
    ],
  }),
  component: Diary,
});

function Diary() {
  const qc = useQueryClient();
  const award = useAward();
  const dogs = useQuery({ queryKey: ["dogs"], queryFn: async () => (await supabase.from("dogs").select("*").order("created_at")).data ?? [] });
  const [dogId, setDogId] = useState<string>("");
  const [kg, setKg] = useState("");
  const active = dogId || dogs.data?.[0]?.id || "";

  const logs = useQuery({
    queryKey: ["weights", active],
    enabled: !!active,
    queryFn: async () => (await supabase.from("weight_logs").select("*").eq("dog_id", active).order("logged_on")).data ?? [],
  });

  const add = useMutation({
    mutationFn: async () => {
      const w = Number(kg);
      if (!(w > 0) || w > 120) throw new Error("Peso no válido.");
      const { error } = await supabase.from("weight_logs").insert({ dog_id: active, weight_kg: w });
      if (error) throw error;
      await supabase.from("dogs").update({ weight_kg: w }).eq("id", active);
    },
    onSuccess: () => {
      setKg("");
      qc.invalidateQueries({ queryKey: ["weights", active] });
      qc.invalidateQueries({ queryKey: ["dogs"] });
      award.mutate("peso");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo guardar."),
  });

  if (dogs.data && dogs.data.length === 0) {
    return (
      <div className="rounded-3xl bg-card p-8 text-center shadow-card">
        <h1 className="text-2xl font-extrabold">Diario</h1>
        <p className="mt-2 text-muted-foreground">Añade tu perro para empezar a registrar su peso.</p>
        <Button asChild variant="hero" size="xl" className="mt-5"><Link to="/perros">Añadir perro</Link></Button>
      </div>
    );
  }

  const data = (logs.data ?? []).map((l) => ({ fecha: l.logged_on.slice(5), kg: Number(l.weight_kg) }));
  const diff = data.length > 1 ? data.at(-1)!.kg - data[0]!.kg : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Diario de peso</h1>
        <div className="flex flex-wrap gap-2">
          {dogs.data?.map((d) => (
            <button key={d.id} onClick={() => setDogId(d.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${active === d.id ? "bg-primary text-primary-foreground" : "bg-card shadow-card"}`}>{d.name}</button>
          ))}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="flex gap-3 rounded-3xl bg-card p-5 shadow-card">
        <Input type="number" step="0.1" min="0.5" max="120" required placeholder="Peso de hoy (kg)" value={kg} onChange={(e) => setKg(e.target.value)} className="h-11" />
        <Button type="submit" variant="hero" size="xl" disabled={add.isPending}>Guardar +15 XP</Button>
      </form>
      <section className="rounded-3xl bg-card p-6 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Evolución</h2>
          {data.length > 1 && <span className="text-sm font-semibold text-muted-foreground">{diff > 0 ? "+" : ""}{diff.toFixed(1)} kg desde el inicio</span>}
        </div>
        {data.length === 0 ? (
          <p className="mt-6 text-center text-muted-foreground">Aún no hay registros. ¡Haz el primero!</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis dataKey="fecha" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="var(--muted-foreground)" fontSize={12} width={36} />
                <Tooltip />
                <Line type="monotone" dataKey="kg" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: "var(--accent)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
