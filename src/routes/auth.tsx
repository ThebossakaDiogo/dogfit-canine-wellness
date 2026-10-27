import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Database, Loader2, MailSearch, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canAccessApp, useAuth } from "@/lib/auth";
import mascot from "@/assets/mascot.png";

// `mode` kept only so old links keep working; entry is email-only now.
const search = z.object({ mode: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Entrar — DogFit" },
      { name: "description", content: "Entra en DogFit solo con tu correo." },
      { property: "og:title", content: "Entrar — DogFit" },
      { property: "og:description", content: "Entra en DogFit solo con tu correo." },
    ],
  }),
  component: AuthPage,
});

const STEPS = [
  { icon: Database, label: "Consultando la base de datos…" },
  { icon: MailSearch, label: "Verificando tu correo…" },
  { icon: UserPlus, label: "Creando tu registro…" },
  { icon: Check, label: "¡Correo aprobado!" },
];
const STEP_MS = 850;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Random one-off credential; the user never types it. The session stays on this device. */
function randomSecret() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("") + "Aa1!";
}

type Outcome = "approved" | "existing" | "error";

async function enter(email: string): Promise<Outcome> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: randomSecret(),
    options: { emailRedirectTo: `${window.location.origin}/confirmado` },
  });
  if (!error && data.session) return "approved";
  const msg = error?.message.toLowerCase() ?? "";
  if (msg.includes("already") || (!error && !data.session)) {
    // Existing account on a new device: prove ownership with a one-click email link.
    const otp = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/confirmado` },
    });
    if (otp.error) throw otp.error;
    return "existing";
  }
  if (msg.includes("not allowed") || msg.includes("invalid")) throw new Error("Ese correo no es válido. Usa un correo real.");
  throw error ?? new Error("Algo salió mal.");
}

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (canAccessApp(user) && step === -1) navigate({ to: "/hoy" });
  }, [user, step, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    setStep(0);
    const work = enter(clean);
    try {
      await wait(STEP_MS);
      setStep(1);
      await wait(STEP_MS);
      const outcome = await work;
      if (outcome === "existing") {
        navigate({ to: "/verifica", search: { email: clean } });
        return;
      }
      setStep(2);
      await wait(STEP_MS);
      setStep(3);
      await wait(1100);
      navigate({ to: "/hoy" });
    } catch (err) {
      setStep(-1);
      toast.error(err instanceof Error ? err.message : "Algo salió mal. Inténtalo de nuevo.");
    }
  }

  if (step >= 0) {
    const approved = step === 3;
    return (
      <AuthShell title={approved ? "¡Bienvenido a DogFit!" : "Registrando tu correo"} subtitle={email}>
        <div className="flex justify-center">
          <img src={mascot} alt="" width={1024} height={1024} className={`h-32 w-32 ${approved ? "animate-pop" : "animate-float"}`} />
        </div>
        <ol className="mt-6 space-y-3" aria-live="polite">
          {STEPS.map((s, i) => {
            const done = i < step || approved;
            const active = i === step && !approved;
            const Icon = s.icon;
            return (
              <li key={s.label} className={`flex items-center gap-3 rounded-2xl p-3 transition-all duration-500 ${i > step ? "opacity-30" : "opacity-100"} ${active ? "bg-secondary" : ""}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${done ? "animate-pop bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {active ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className="font-semibold">{s.label}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Entra con tu correo" subtitle="Sin contraseña. Solo escribe tu correo y listo.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" required autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
        </div>
        <Button type="submit" variant="hero" size="xl" className="w-full">Continuar</Button>
      </form>
      <p className="mt-5 text-center text-xs text-muted-foreground">Al continuar aceptas que DogFit no reemplaza a tu veterinario.</p>
    </AuthShell>
  );
}
