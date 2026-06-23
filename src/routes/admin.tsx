import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  adminLogin,
  adminLogout,
  adminPassword,
  isAdminAuthed,
  loadDataFromCloud,
  saveData,
  DEFAULT_DATA,
  type SiteData,
  type Activity,
  type Room,
  type Hero,
  type Review,
} from "@/lib/site-data";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<SiteData | null>(null);
  const [savedNote, setSavedNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
      loadDataFromCloud().then(setData);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(email, password)) {
      setAuthed(true);
      setError("");
      setData(await loadDataFromCloud());
    } else {
      setError("Invalid credentials");
    }
  };

  const updateActivity = (i: number, field: keyof Activity, value: string) => {
    if (!data) return;
    const next = { ...data, activities: [...data.activities] };
    next.activities[i] = { ...next.activities[i], [field]: value };
    setData(next);
  };

  const updateRoom = (i: number, field: keyof Room, value: string) => {
    if (!data) return;
    const next = { ...data, rooms: [...data.rooms] };
    next.rooms[i] = { ...next.rooms[i], [field]: value };
    setData(next);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    const res = await saveData(data, adminPassword());
    setSaving(false);
    if (res.ok) {
      setSavedNote("Saved ✓");
      setTimeout(() => setSavedNote(""), 2500);
    } else {
      setSavedNote(`Error: ${res.error}`);
      setTimeout(() => setSavedNote(""), 4000);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset all content to defaults? This will overwrite your saved edits.")) return;
    setData(DEFAULT_DATA);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary px-6">
        <form onSubmit={handleLogin} className="bg-background rounded-lg shadow-2xl p-10 w-full max-w-md space-y-6">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-2">Admin</p>
            <h1 className="font-display text-3xl text-primary">Palm Garden</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in to edit site content.</p>
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

  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-secondary py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-1">Admin Panel</p>
            <h1 className="font-display text-4xl text-primary">Edit Site Content</h1>
            <p className="text-xs text-muted-foreground mt-1">Changes save to the cloud — visible to everyone, everywhere.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {savedNote && <span className="text-sm text-accent">{savedNote}</span>}
            <button onClick={() => navigate({ to: "/" })} className="text-sm px-4 py-2 border border-border rounded-full hover:bg-background">View Site</button>
            <button onClick={handleResetDefaults} className="text-sm px-4 py-2 border border-border rounded-full hover:bg-background">Reset</button>
            <button onClick={() => { adminLogout(); setAuthed(false); }} className="text-sm px-4 py-2 border border-border rounded-full hover:bg-background">Logout</button>
            <button onClick={handleSave} disabled={saving} className="text-sm px-6 py-2 bg-primary text-primary-foreground rounded-full uppercase tracking-wider disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-primary mb-6">Rooms</h2>
          <div className="space-y-6">
            {data.rooms.map((r, i) => (
              <div key={r.id} className="bg-background rounded-lg shadow-sm p-6 grid md:grid-cols-[120px_1fr] gap-6">
                <img src={r.img} alt={r.name} className="w-full h-32 object-cover rounded-md" />
                <div className="grid md:grid-cols-2 gap-4">
                  <LabeledInput label="Name" value={r.name} onChange={(v) => updateRoom(i, "name", v)} />
                  <LabeledInput label="Price" value={r.price} onChange={(v) => updateRoom(i, "price", v)} />
                  <div className="md:col-span-2"><LabeledInput label="Image URL" value={r.img} onChange={(v) => updateRoom(i, "img", v)} /></div>
                  <div className="md:col-span-2"><LabeledInput label="Description" value={r.desc} onChange={(v) => updateRoom(i, "desc", v)} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-primary mb-6">Activities</h2>
          <div className="space-y-6">
            {data.activities.map((a, i) => (
              <div key={a.id} className="bg-background rounded-lg shadow-sm p-6 grid md:grid-cols-[120px_1fr] gap-6">
                <img src={a.img} alt={a.name} className="w-full h-32 object-cover rounded-md" />
                <div className="grid md:grid-cols-2 gap-4">
                  <LabeledInput label="Name" value={a.name} onChange={(v) => updateActivity(i, "name", v)} />
                  <LabeledInput label="Price" value={a.price} onChange={(v) => updateActivity(i, "price", v)} />
                  <LabeledInput label="Unit" value={a.unit} onChange={(v) => updateActivity(i, "unit", v)} />
                  <LabeledInput label="Image URL" value={a.img} onChange={(v) => updateActivity(i, "img", v)} />
                  <div className="md:col-span-2"><LabeledInput label="Description" value={a.desc} onChange={(v) => updateActivity(i, "desc", v)} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-accent text-accent-foreground rounded-full uppercase tracking-widest text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 bg-transparent text-sm focus:outline-none focus:border-accent" />
    </label>
  );
}
