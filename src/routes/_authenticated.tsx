import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookOpen, Dog, User } from "lucide-react";
import { canAccessApp, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: AppLayout,
});

const NAV = [
  { to: "/biblioteca", label: "Recetas", icon: BookOpen },
  { to: "/perros", label: "Mis perros", icon: Dog },
  { to: "/cuenta", label: "Cuenta", icon: User },
] as const;

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !canAccessApp(user)) navigate({ to: "/auth", search: { mode: "login" } });
  }, [user, loading, navigate]);

  if (loading || !canAccessApp(user)) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/biblioteca" className="font-display text-2xl font-extrabold text-primary">DogFit</Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-secondary text-primary" }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-3 border-t bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-3 text-xs font-semibold text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
