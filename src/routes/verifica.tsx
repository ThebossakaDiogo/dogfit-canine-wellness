import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { RESEND_COOLDOWN_SECONDS } from "@/lib/auth";

export const Route = createFileRoute("/verifica")({
  validateSearch: z.object({ email: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Revisa tu correo — DogFit" },
      { name: "description", content: "Confirma tu correo para activar tu cuenta DogFit." },
      { property: "og:title", content: "Revisa tu correo — DogFit" },
      { property: "og:description", content: "Confirma tu correo para activar tu cuenta DogFit." },
    ],
  }),
  component: Verify,
});

function Verify() {
  const { email } = Route.useSearch();
  const [left, setLeft] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function resend() {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/confirmado` },
    });
    if (error) toast.error("No pudimos reenviar el correo. Espera un poco e inténtalo de nuevo.");
    else toast.success("Correo reenviado.");
    setLeft(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <AuthShell title="Revisa tu correo" subtitle="Este correo ya tiene cuenta. Te enviamos un enlace para entrar en este dispositivo.">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-secondary p-4">
        <MailCheck className="h-6 w-6 shrink-0 text-primary" />
        <p className="text-sm">
          Enviado a <strong className="break-all">{email ?? "tu correo"}</strong>. Si no lo ves, mira en spam.
        </p>
      </div>
      <Button variant="hero" size="xl" className="w-full" disabled={left > 0 || !email} onClick={resend}>
        {left > 0 ? `Reenviar correo (${left}s)` : "Reenviar correo"}
      </Button>
      <div className="mt-5 flex justify-between text-sm">
        <Link to="/auth" className="text-muted-foreground hover:text-foreground">Cambiar correo</Link>
        <Link to="/auth" className="font-semibold text-primary">Volver</Link>
      </div>
    </AuthShell>
  );
}
