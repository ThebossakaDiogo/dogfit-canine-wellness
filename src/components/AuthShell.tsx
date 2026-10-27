import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center font-display text-3xl font-extrabold text-primary">DogFit</Link>
        <div className="rounded-3xl bg-card p-7 shadow-card">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
