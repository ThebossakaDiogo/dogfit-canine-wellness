import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH, canAccessApp, useAuth } from "@/lib/auth";

const search = z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Entrar — DogFit" },
      { name: "description", content: "Crea tu cuenta o entra en DogFit." },
      { property: "og:title", content: "Entrar — DogFit" },
      { property: "og:description", content: "Crea tu cuenta o entra en DogFit." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signup" } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);

  useEffect(() => {
    if (canAccessApp(user)) navigate({ to: "/biblioteca" });
  }, [user, navigate]);

  const setMode = (m: "login" | "signup" | "forgot") => navigate({ to: "/auth", search: { mode: m } });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setUnconfirmed(false);
    try {
      if (mode === "signup") {
        if (password.length < MIN_PASSWORD_LENGTH) {
          toast.error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/confirmado` },
        });
        if (error) throw error;
        navigate({ to: "/verifica", search: { email } });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("not confirmed")) {
            setUnconfirmed(true);
            return;
          }
          throw new Error("Correo o contraseña incorrectos.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Si el correo existe, te enviamos un enlace para cambiar la contraseña.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const titles = {
    signup: ["Crea tu cuenta", "Te enviaremos un correo para confirmarla."],
    login: ["Hola de nuevo", "Entra para ver tus recetas."],
    forgot: ["Recupera tu contraseña", "Te enviaremos un enlace por correo."],
  } as const;

  return (
    <AuthShell title={titles[mode][0]} subtitle={titles[mode][1]}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
            {mode === "signup" && <p className="text-xs text-muted-foreground">Mínimo {MIN_PASSWORD_LENGTH} caracteres.</p>}
          </div>
        )}
        {unconfirmed && (
          <div className="rounded-xl bg-secondary p-3 text-sm">
            Confirma tu correo para continuar.{" "}
            <button type="button" className="font-semibold text-primary underline" onClick={() => navigate({ to: "/verifica", search: { email } })}>
              Reenviar correo
            </button>
          </div>
        )}
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
          {busy ? "Un momento…" : mode === "signup" ? "Crear cuenta" : mode === "login" ? "Entrar" : "Enviar enlace"}
        </Button>
      </form>
      <div className="mt-6 space-y-2 text-center text-sm">
        {mode === "login" && (
          <button className="block w-full text-muted-foreground hover:text-foreground" onClick={() => setMode("forgot")}>¿Olvidaste tu contraseña?</button>
        )}
        {mode === "signup" ? (
          <p>¿Ya tienes cuenta? <button className="font-semibold text-primary" onClick={() => setMode("login")}>Entrar</button></p>
        ) : (
          <p>¿Nuevo en DogFit? <button className="font-semibold text-primary" onClick={() => setMode("signup")}>Crear cuenta</button></p>
        )}
      </div>
    </AuthShell>
  );
}
