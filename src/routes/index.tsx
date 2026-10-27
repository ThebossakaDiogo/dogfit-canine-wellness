import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_KEY, canAccessApp, useAuth } from "@/lib/auth";
import hero from "@/assets/hero-dog.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DogFit — Comida casera para tu perro" },
      { name: "description", content: "Recetas, guías y planificación para alimentar a tu perro en casa con seguridad." },
      { property: "og:title", content: "DogFit — Comida casera para tu perro" },
      { property: "og:description", content: "Recetas, guías y planificación para alimentar a tu perro en casa." },
    ],
  }),
  component: Onboarding,
});

const SLIDES = [
  { icon: Sparkles, title: "Bienvenido a DogFit", text: "Organiza la comida casera de tu perro, paso a paso, desde el móvil." },
  { icon: BookOpen, title: "Qué incluye tu plan", text: "Recetas para perros por edad y tamaño, guías de transición y lista de alimentos prohibidos." },
  { icon: ShieldCheck, title: "Seguridad primero", text: "DogFit no reemplaza a tu veterinario. Consulta siempre ante cambios de dieta o problemas de salud." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (canAccessApp(user)) navigate({ to: "/biblioteca" });
    else if (localStorage.getItem(ONBOARDING_KEY)) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const finish = (mode: "signup" | "login") => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    navigate({ to: "/auth", search: { mode } });
  };

  const slide = SLIDES[i] ?? SLIDES[0]!;
  const Icon = slide.icon;
  const last = i === SLIDES.length - 1;

  return (
    <main className="min-h-screen bg-background md:grid md:grid-cols-2">
      <div className="relative h-[42vh] md:h-screen">
        <img src={hero} alt="Perro feliz junto a un plato de comida casera" width={1024} height={1280} className="h-full w-full object-cover" />
        <span className="absolute left-5 top-5 rounded-full bg-card/90 px-4 py-1.5 font-display text-lg font-extrabold text-primary">DogFit</span>
      </div>
      <section className="flex flex-col justify-between px-6 py-8 md:px-14 md:py-16">
        <div className="flex justify-end">
          <button onClick={() => finish("signup")} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            Saltar
          </button>
        </div>
        <div key={i} className="animate-in fade-in slide-in-from-right-4 duration-300 py-8">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">{slide.title}</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">{slide.text}</p>
        </div>
        <div className="space-y-6">
          <div className="flex gap-2" aria-label={`Paso ${i + 1} de ${SLIDES.length}`}>
            {SLIDES.map((_, n) => (
              <button
                key={n}
                aria-label={`Ir al paso ${n + 1}`}
                onClick={() => setI(n)}
                className={`h-2 rounded-full transition-all ${n === i ? "w-8 bg-primary" : "w-2 bg-border"}`}
              />
            ))}
          </div>
          {last ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="xl" onClick={() => finish("signup")}>Crear cuenta</Button>
              <Button variant="ghost" size="xl" className="rounded-full" onClick={() => finish("login")}>Ya tengo cuenta</Button>
            </div>
          ) : (
            <Button variant="hero" size="xl" onClick={() => setI(i + 1)}>Siguiente</Button>
          )}
          <p className="text-xs text-muted-foreground">
            ¿Ya tienes cuenta? <Link to="/auth" search={{ mode: "login" }} className="font-semibold text-primary">Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
