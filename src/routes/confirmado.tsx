import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PartyPopper, TriangleAlert } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { canAccessApp, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/confirmado")({
  head: () => ({
    meta: [
      { title: "Correo confirmado — DogFit" },
      { name: "description", content: "Tu cuenta DogFit está activa." },
      { property: "og:title", content: "Correo confirmado — DogFit" },
      { property: "og:description", content: "Tu cuenta DogFit está activa." },
    ],
  }),
  component: Confirmed,
});

function Confirmed() {
  const { user, loading } = useAuth();
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (p.get("error") || p.get("error_code")) setLinkError(true);
  }, []);

  if (loading) return <AuthShell title="Confirmando…" />;

  if (linkError || !canAccessApp(user)) {
    return (
      <AuthShell title="Enlace no válido" subtitle="El enlace caducó o ya se usó.">
        <div className="mb-6 flex gap-3 rounded-2xl bg-muted p-4 text-sm">
          <TriangleAlert className="h-5 w-5 shrink-0 text-accent" />
          Entra con tu correo para recibir un enlace nuevo.
        </div>
        <Button asChild variant="hero" size="xl" className="w-full">
          <Link to="/auth" search={{ mode: "login" }}>Entrar</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="¡Correo confirmado!" subtitle="Tu cuenta DogFit ya está activa.">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
        <PartyPopper className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <Button asChild variant="hero" size="xl" className="w-full">
          <Link to="/perros">Añadir mi perro</Link>
        </Button>
        <Button asChild variant="ghost" size="xl" className="w-full rounded-full">
          <Link to="/hoy">Empezar</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
