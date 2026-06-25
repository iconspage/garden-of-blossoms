import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pencil, Save, X, LogOut, Calendar, RotateCcw, Eye, EyeOff } from "lucide-react";
import {
  adminLogout,
  adminPassword,
  isAdminAuthed,
  saveData,
  adminListBookings,
  adminDeleteBooking,
  type SiteData,
  type BookingRow,
} from "@/lib/site-data";

type Ctx = {
  isAdmin: boolean;
  isEditing: boolean;
  setEditing: (b: boolean) => void;
  data: SiteData;
  get: (path: string) => string;
  set: (path: string, value: string) => void;
  dirty: boolean;
  saving: boolean;
  save: () => Promise<void>;
  discard: () => void;
  savedNote: string;
};

const EditCtx = createContext<Ctx | null>(null);
export function useEdit() {
  const v = useContext(EditCtx);
  if (!v) throw new Error("useEdit must be used inside EditableProvider");
  return v;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return acc;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}
function setByPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone: unknown = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as object) };
  let cur = clone as Record<string, unknown> | unknown[];
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const idx = Array.isArray(cur) ? Number(k) : k;
    const next = (cur as Record<string, unknown>)[idx as string];
    const copy: unknown = Array.isArray(next) ? [...(next as unknown[])] : { ...(next as object) };
    (cur as Record<string, unknown>)[idx as string] = copy;
    cur = copy as Record<string, unknown> | unknown[];
  }
  const lastKey = keys[keys.length - 1];
  (cur as Record<string, unknown>)[Array.isArray(cur) ? Number(lastKey) : lastKey] = value;
  return clone as T;
}

export function EditableProvider({ children, initial }: { children: ReactNode; initial: SiteData }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SiteData>(initial);
  const [original, setOriginal] = useState<SiteData>(initial);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState("");

  useEffect(() => { setIsAdmin(isAdminAuthed()); }, []);
  useEffect(() => { setDraft(initial); setOriginal(initial); }, [initial]);

  const get = useCallback((path: string) => {
    const v = getByPath(draft, path);
    return v == null ? "" : String(v);
  }, [draft]);

  const set = useCallback((path: string, value: string) => {
    setDraft((d) => setByPath(d, path, value));
  }, []);

  const dirty = JSON.stringify(draft) !== JSON.stringify(original);

  const save = useCallback(async () => {
    setSaving(true);
    const res = await saveData(draft, adminPassword());
    setSaving(false);
    if (res.ok) {
      setOriginal(draft);
      setSavedNote("Saved ✓");
      setTimeout(() => setSavedNote(""), 2500);
    } else {
      setSavedNote("Error: " + res.error);
      setTimeout(() => setSavedNote(""), 4500);
    }
  }, [draft]);

  const discard = useCallback(() => setDraft(original), [original]);

  return (
    <EditCtx.Provider value={{ isAdmin, isEditing, setEditing, data: draft, get, set, dirty, saving, save, discard, savedNote }}>
      {children}
    </EditCtx.Provider>
  );
}

export function EditText({ path, className, multiline }: { path: string; className?: string; multiline?: boolean }) {
  const { isAdmin, isEditing, get, set } = useEdit();
  const value = get(path);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isAdmin && isEditing && ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value, isAdmin, isEditing]);

  if (!isAdmin || !isEditing) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => set(path, (e.currentTarget.textContent ?? "").trim())}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLSpanElement).blur();
        }
      }}
      className={(className ?? "") + " editable-text outline-none ring-1 ring-amber-400/60 hover:ring-amber-400 focus:ring-2 focus:ring-amber-400 rounded px-1 -mx-1 cursor-text bg-amber-50/10"}
    />
  );
}

function ImagePicker({ initial, onCancel, onSave }: { initial: string; onCancel: () => void; onSave: (url: string) => void }) {
  const [url, setUrl] = useState(initial);
  return (
    <div className="fixed inset-0 z-[400] bg-black/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="bg-background rounded-lg shadow-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-primary">Change Image</h3>
          <button onClick={onCancel} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        {url ? <img src={url} alt="preview" className="w-full h-44 object-cover rounded bg-muted" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }} /> : null}
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Image URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://i.postimg.cc/..."
            className="w-full border border-border rounded px-3 py-2 mt-1 text-sm bg-transparent focus:outline-none focus:border-accent"
            autoFocus
          />
        </label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tip: upload to <a href="https://postimages.org" target="_blank" rel="noopener" className="text-accent underline">postimages.org</a> (free, no account), copy the <strong>Direct link</strong>, paste here.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="text-xs px-4 py-2 border border-border rounded-full">Cancel</button>
          <button onClick={() => onSave(url)} disabled={!url} className="text-xs px-5 py-2 bg-accent text-accent-foreground rounded-full disabled:opacity-50">Use Image</button>
        </div>
      </div>
    </div>
  );
}

export function EditOverlay({ path, label = "Change image", className }: { path: string; label?: string; className?: string }) {
  const { isAdmin, isEditing, get, set } = useEdit();
  const [open, setOpen] = useState(false);
  if (!isAdmin || !isEditing) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={(className ?? "absolute top-3 right-3 z-30") + " bg-black/75 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full hover:bg-black flex items-center gap-1.5 shadow-lg ring-1 ring-amber-400/60"}
      >
        <Pencil className="w-3 h-3" />{label}
      </button>
      {open && <ImagePicker initial={get(path)} onCancel={() => setOpen(false)} onSave={(v) => { set(path, v); setOpen(false); }} />}
    </>
  );
}

function BookingsDrawer({ onClose }: { onClose: () => void }) {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { setError(""); setBookings(await adminListBookings(adminPassword())); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return (
    <div className="fixed inset-0 z-[300] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-xl h-full bg-background shadow-2xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="uppercase tracking-[0.25em] text-[10px] text-accent mb-1">Reservations</p>
            <h2 className="font-display text-2xl text-primary">Customer Bookings</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-secondary">Refresh</button>
            <button onClick={onClose} aria-label="Close" className="text-xs p-2 border border-border rounded-full hover:bg-secondary"><X className="w-3 h-3" /></button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}
        {!bookings ? <p className="text-sm text-muted-foreground">Loading…</p>
          : bookings.length === 0 ? <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-8 text-center">No bookings yet.</p>
            : <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="border border-border rounded-lg p-4 text-sm space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <strong className="text-primary text-base">{b.name}</strong>
                      <span className="text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider">{b.kind} · {b.item_name}</div>
                    <div className="text-xs"><a href={`tel:${b.phone}`} className="text-accent">{b.phone}</a> · <a href={`mailto:${b.email}`} className="text-accent">{b.email}</a></div>
                    {b.checkin && <div className="text-xs">In: {b.checkin} · Out: {b.checkout} · Guests: {b.guests}</div>}
                    {b.notes && <div className="text-xs italic text-muted-foreground">"{b.notes}"</div>}
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this booking?")) return;
                        try { await adminDeleteBooking(adminPassword(), b.id); setBookings((p) => (p ?? []).filter((x) => x.id !== b.id)); }
                        catch (e) { alert(e instanceof Error ? e.message : "Delete failed"); }
                      }}
                      className="text-xs text-destructive hover:underline mt-1"
                    >Delete</button>
                  </div>
                ))}
              </div>}
      </div>
    </div>
  );
}

export function AdminBar() {
  const { isAdmin, isEditing, setEditing, dirty, save, discard, saving, savedNote } = useEdit();
  const [showBookings, setShowBookings] = useState(false);
  if (!isAdmin) return null;
  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-foreground text-background rounded-full shadow-2xl px-1.5 py-1.5 flex items-center gap-1 text-xs max-w-[calc(100vw-1rem)] overflow-x-auto">
        <button
          onClick={() => setEditing(!isEditing)}
          className={"px-3.5 py-2 rounded-full transition whitespace-nowrap flex items-center gap-1.5 " + (isEditing ? "bg-amber-400 text-black" : "hover:bg-white/10")}
          title={isEditing ? "Exit edit mode" : "Enter edit mode"}
        >
          {isEditing ? <EyeOff className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isEditing ? "Editing" : "Edit"}</span>
        </button>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="px-3.5 py-2 rounded-full bg-accent text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
          title="Save changes to cloud"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{saving ? "Saving…" : dirty ? "Save" : "Saved"}</span>
        </button>
        <button onClick={discard} disabled={!dirty} className="px-2.5 py-2 rounded-full hover:bg-white/10 disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5" title="Discard unsaved changes">
          <RotateCcw className="w-3.5 h-3.5" /><span className="hidden md:inline">Discard</span>
        </button>
        <button onClick={() => setShowBookings(true)} className="px-2.5 py-2 rounded-full hover:bg-white/10 whitespace-nowrap flex items-center gap-1.5" title="View customer bookings">
          <Calendar className="w-3.5 h-3.5" /><span className="hidden md:inline">Bookings</span>
        </button>
        <button onClick={() => { adminLogout(); window.location.reload(); }} className="px-2.5 py-2 rounded-full hover:bg-white/10 whitespace-nowrap flex items-center gap-1.5" title="Sign out">
          <LogOut className="w-3.5 h-3.5" /><span className="hidden md:inline">Logout</span>
        </button>
        {savedNote && <span className="px-3 text-amber-300 whitespace-nowrap">{savedNote}</span>}
      </div>
      {showBookings && <BookingsDrawer onClose={() => setShowBookings(false)} />}
    </>
  );
}
