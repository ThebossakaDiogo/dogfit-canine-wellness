import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dog, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/perros")({
  head: () => ({
    meta: [
      { title: "Mis perros — DogFit" },
      { name: "description", content: "Perfil de tus perros en DogFit." },
      { property: "og:title", content: "Mis perros — DogFit" },
      { property: "og:description", content: "Perfil de tus perros en DogFit." },
    ],
  }),
  component: Dogs,
});

const empty = { name: "", breed: "", size: "mediano", life_stage: "adulto", weight_kg: "", allergies: "" };
const selectCls = "h-11 w-full rounded-md border border-input bg-background px-3 text-sm";

function Dogs() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const dogs = useQuery({
    queryKey: ["dogs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dogs").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const weight = form.weight_kg ? Number(form.weight_kg) : null;
      if (weight !== null && (!(weight > 0) || weight > 120)) throw new Error("Peso no válido.");
      const { error } = await supabase.from("dogs").insert({
        name: form.name.trim(),
        breed: form.breed.trim() || null,
        size: form.size,
        life_stage: form.life_stage,
        weight_kg: weight,
        allergies: form.allergies.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm(empty);
      toast.success("Perro guardado.");
      qc.invalidateQueries({ queryKey: ["dogs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo guardar."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dogs"] }),
  });

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
      <section>
        <h1 className="text-3xl font-extrabold">Mis perros</h1>
        <div className="mt-5 space-y-3">
          {dogs.isLoading && <p className="text-muted-foreground">Cargando…</p>}
          {dogs.data?.length === 0 && <p className="rounded-2xl bg-muted p-5 text-muted-foreground">Aún no añadiste ningún perro. Puedes usar la biblioteca igualmente.</p>}
          {dogs.data?.map((d) => (
            <div key={d.id} className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary"><Dog className="h-6 w-6" /></div>
              <div className="flex-1">
                <p className="font-bold">{d.name}</p>
                <p className="text-sm capitalize text-muted-foreground">{[d.breed, d.life_stage, d.size, d.weight_kg && `${d.weight_kg} kg`].filter(Boolean).join(" · ")}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Eliminar ${d.name}`} onClick={() => remove.mutate(d.id)}><Trash2 /></Button>
            </div>
          ))}
        </div>
      </section>
      <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="space-y-4 rounded-3xl bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Añadir perro</h2>
        <div className="space-y-1.5"><Label htmlFor="n">Nombre</Label><Input id="n" required maxLength={60} value={form.name} onChange={set("name")} className="h-11" /></div>
        <div className="space-y-1.5"><Label htmlFor="b">Raza (opcional)</Label><Input id="b" maxLength={60} placeholder="Mestizo" value={form.breed} onChange={set("breed")} className="h-11" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="s">Tamaño</Label>
            <select id="s" className={selectCls} value={form.size} onChange={set("size")}><option value="pequeño">Pequeño</option><option value="mediano">Mediano</option><option value="grande">Grande</option></select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="l">Edad</Label>
            <select id="l" className={selectCls} value={form.life_stage} onChange={set("life_stage")}><option value="cachorro">Cachorro</option><option value="adulto">Adulto</option><option value="senior">Senior</option></select>
          </div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="w">Peso (kg)</Label><Input id="w" type="number" step="0.1" min="0.5" max="120" value={form.weight_kg} onChange={set("weight_kg")} className="h-11" /></div>
        <div className="space-y-1.5"><Label htmlFor="a">Alergias o restricciones</Label><Input id="a" maxLength={200} value={form.allergies} onChange={set("allergies")} className="h-11" /></div>
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={add.isPending}>Guardar perro</Button>
      </form>
    </div>
  );
}
