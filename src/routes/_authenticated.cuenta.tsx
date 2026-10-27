import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ONBOARDING_KEY, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({
    meta: [
      { title: "Cuenta — DogFit" },
      { name: "description", content: "Tu cuenta DogFit." },
      { property: "og:title", content: "Cuenta — DogFit" },
      { property: "og:description", content: "Tu cuenta DogFit." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-extrabold">Cuenta</h1>
      <div className="rounded-3xl bg-card p-6 shadow-card">
        <p className="text-sm text-muted-foreground">Correo</p>
        <p className="font-semibold break-all">{user?.email}</p>
        <p className="mt-2 text-xs text-primary">Correo confirmado ✓</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="xl" className="rounded-full" onClick={() => { localStorage.removeItem(ONBOARDING_KEY); navigate({ to: "/" }); }}>Ver presentación otra vez</Button>
        <Button variant="hero" size="xl" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth", search: { mode: "login" } }); }}>Cerrar sesión</Button>
      </div>
    </div>
  );
}
