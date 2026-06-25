import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogin, isAdminAuthed } from "@/lib/site-data";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(email, password)) {
      navigate({ to: "/" });
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-6">
      <form onSubmit={handleLogin} className="bg-background rounded-lg shadow-2xl p-10 w-full max-w-md space-y-6">
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-accent mb-2">Admin</p>
          <h1 className="font-display text-3xl text-primary">Palm Garden</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to edit the site directly.</p>
        </div>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border rounded-md px-3 py-2 bg-transparent focus:outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border rounded-md px-3 py-2 bg-transparent focus:outline-none focus:border-accent" />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-full uppercase tracking-widest text-sm">Sign In</button>
        <button type="button" onClick={() => navigate({ to: "/" })} className="block w-full text-center text-xs text-muted-foreground hover:text-accent">← Back to site</button>
      </form>
    </div>
  );
}
