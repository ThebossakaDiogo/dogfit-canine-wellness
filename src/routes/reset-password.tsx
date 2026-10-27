import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — DogFit" },
      { name: "description", content: "Define una nueva contraseña para DogFit." },
      { property: "og:title", content: "Nueva contraseña — DogFit" },
      { property: "og:description", content: "Define una nueva contraseña para DogFit." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("El enlace caducó. Pide uno nuevo.");
      return;
    }
    toast.success("Contraseña actualizada.");
    navigate({ to: "/biblioteca" });
  }

  return (
    <AuthShell title="Nueva contraseña">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">Contraseña nueva</Label>
          <Input id="pw" type="password" required minLength={MIN_PASSWORD_LENGTH} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
        </div>
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>Guardar</Button>
      </form>
    </AuthShell>
  );
}
