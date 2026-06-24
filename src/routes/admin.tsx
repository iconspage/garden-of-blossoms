import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  adminLogin,
  adminLogout,
  adminPassword,
  isAdminAuthed,
  loadDataFromCloud,
  saveData,
  DEFAULT_DATA,
  adminListBookings,
  adminDeleteBooking,
  type SiteData,
  type Activity,
  type Room,
  type Hero,
  type Review,
  type BookingRow,
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
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [bookingsError, setBookingsError] = useState("");

  const refreshBookings = useCallback(async () => {
    try {
      setBookingsError("");
      const rows = await adminListBookings(adminPassword());
      setBookings(rows);
    } catch (e: unknown) {
      setBookingsError(e instanceof Error ? e.message : "Failed to load bookings");
    }
  }, []);

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
      loadDataFromCloud().then(setData);
      refreshBookings();
    }
  }, [refreshBookings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(email, password)) {
      setAuthed(true);
      setError("");
      setData(await loadDataFromCloud());
      refreshBookings();
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

  const updateHero = (field: keyof Hero, value: string) => {
    if (!data) return;
    setData({ ...data, hero: { ...data.hero, [field]: value } });
  };

  const updateReview = (field: keyof Review, value: string) => {
    if (!data) return;
    setData({ ...data, review: { ...data.review, [field]: value } });
  };

  const updateGalleryItem = (i: number, value: string) => {
    if (!data) return;
    const gallery = [...data.gallery];
    gallery[i] = value;
    setData({ ...data, gallery });
  };

  const addGalleryItem = () => {
    if (!data) return;
    setData({ ...data, gallery: [...data.gallery, ""] });
  };

  const removeGalleryItem = (i: number) => {
    if (!data) return;
    setData({ ...data, gallery: data.gallery.filter((_, idx) => idx !== i) });
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
          <h2 className="font-display text-2xl text-primary mb-6">Hero Section</h2>
          <div className="bg-background rounded-lg shadow-sm p-6 grid md:grid-cols-[160px_1fr] gap-6">
            <img src={data.hero.image} alt="hero" className="w-full h-32 object-cover rounded-md" />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><LabeledInput label="Hero Image URL" value={data.hero.image} onChange={(v) => updateHero("image", v)} /></div>
              <LabeledInput label="Eyebrow (small line above title)" value={data.hero.eyebrow} onChange={(v) => updateHero("eyebrow", v)} />
              <LabeledInput label="Title" value={data.hero.title} onChange={(v) => updateHero("title", v)} />
              <div className="md:col-span-2"><LabeledInput label="Subtitle" value={data.hero.subtitle} onChange={(v) => updateHero("subtitle", v)} /></div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-primary mb-6">Guest Review & Google Rating</h2>
          <div className="bg-background rounded-lg shadow-sm p-6 grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><LabeledInput label="Quote" value={data.review.quote} onChange={(v) => updateReview("quote", v)} /></div>
            <LabeledInput label="Attribution" value={data.review.attribution} onChange={(v) => updateReview("attribution", v)} />
            <LabeledInput label="Google Rating (e.g. 4.3)" value={data.review.rating} onChange={(v) => updateReview("rating", v)} />
            <div className="md:col-span-2"><LabeledInput label="Review Count Text (e.g. 153 Google reviews)" value={data.review.reviewCount} onChange={(v) => updateReview("reviewCount", v)} /></div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-primary">Gallery Images</h2>
            <button onClick={addGalleryItem} className="text-xs px-4 py-2 border border-border rounded-full hover:bg-background">+ Add Image</button>
          </div>
          <div className="space-y-3">
            {data.gallery.map((src, i) => (
              <div key={i} className="bg-background rounded-lg shadow-sm p-4 grid grid-cols-[80px_1fr_auto] gap-4 items-center">
                <img src={src} alt={`gallery ${i + 1}`} className="w-20 h-20 object-cover rounded-md" />
                <LabeledInput label={`Image ${i + 1} URL`} value={src} onChange={(v) => updateGalleryItem(i, v)} />
                <button onClick={() => removeGalleryItem(i)} className="text-xs px-3 py-2 border border-border rounded-full hover:bg-destructive hover:text-destructive-foreground self-end">Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-2xl text-primary">Customer Bookings</h2>
              <p className="text-xs text-muted-foreground mt-1">Submitted from the public booking form.</p>
            </div>
            <button onClick={refreshBookings} className="text-xs px-4 py-2 border border-border rounded-full hover:bg-background">Refresh</button>
          </div>
          {bookingsError && <p className="text-sm text-destructive mb-3">{bookingsError}</p>}
          {!bookings ? (
            <p className="text-sm text-muted-foreground">Loading bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-background rounded-lg p-6">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-background rounded-lg shadow-sm p-5 grid md:grid-cols-[1fr_auto] gap-4">
                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="text-muted-foreground">Name: </span><strong>{b.name}</strong></div>
                    <div><span className="text-muted-foreground">Item: </span>{b.kind} · {b.item_name}</div>
                    <div><span className="text-muted-foreground">Phone: </span><a href={`tel:${b.phone}`} className="text-accent">{b.phone}</a></div>
                    <div><span className="text-muted-foreground">Email: </span><a href={`mailto:${b.email}`} className="text-accent">{b.email}</a></div>
                    {b.checkin && <div><span className="text-muted-foreground">Check-in: </span>{b.checkin}</div>}
                    {b.checkout && <div><span className="text-muted-foreground">Check-out: </span>{b.checkout}</div>}
                    {b.guests && <div><span className="text-muted-foreground">Guests: </span>{b.guests}</div>}
                    <div><span className="text-muted-foreground">Submitted: </span>{new Date(b.created_at).toLocaleString()}</div>
                    {b.notes && <div className="md:col-span-2"><span className="text-muted-foreground">Notes: </span>{b.notes}</div>}
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this booking?")) return;
                      try {
                        await adminDeleteBooking(adminPassword(), b.id);
                        setBookings((prev) => (prev ?? []).filter((x) => x.id !== b.id));
                      } catch (e) {
                        alert(e instanceof Error ? e.message : "Delete failed");
                      }
                    }}
                    className="text-xs px-3 py-2 border border-border rounded-full hover:bg-destructive hover:text-destructive-foreground self-start"
                  >Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>

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
