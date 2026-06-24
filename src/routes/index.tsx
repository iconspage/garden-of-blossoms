import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { MapPin, Phone, Star, Wifi, Utensils, Waves, Wind, Car, Coffee, ChevronRight, Menu, X, Sailboat, Fish, CalendarDays, UtensilsCrossed, ChevronLeft } from "lucide-react";
import buildingPool from "@/assets/palm-garden-building-pool.png.asset.json";
import flamingoBar from "@/assets/palm-garden-flamingo-bar.png.asset.json";
import heroAsset from "@/assets/palm-garden-hero.jpeg.asset.json";
import longPool from "@/assets/palm-garden-long-pool.png.asset.json";
import poolDay from "@/assets/palm-garden-pool-day.png.asset.json";
import poolGuest from "@/assets/palm-garden-pool-guest.png.asset.json";
import swanBoat from "@/assets/palm-garden-swan-boat.png.asset.json";
import waterGardenNight from "@/assets/palm-garden-water-garden-night.png.asset.json";
import { useSiteData, submitBooking } from "@/lib/site-data";

const ICONS = { Sailboat, Fish, Coffee, UtensilsCrossed, CalendarDays, Waves, Wind } as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palm Garden Resort — Kaase, Kumasi" },
      { name: "description", content: "A tranquil garden resort in Kaase, Kumasi. Pool, boat rides, fish feeding, café, restaurant & event spaces." },
      { property: "og:title", content: "Palm Garden Resort — Kaase, Kumasi" },
      { property: "og:description", content: "Book your stay at Palm Garden Resort — gardens, pool, boat rides, dining & events in Ashanti." },
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:image", content: heroAsset.url },
    ],
  }),
  component: Index,
});

const LOGO_MARK = "Palm Garden";
const PHONE_TEL = "tel:+233539795100";
const PHONE_DISPLAY = "053 979 5100";

const amenities = [
  { icon: Waves, label: "Outdoor Pool" },
  { icon: Utensils, label: "Fine Dining" },
  { icon: Wifi, label: "High-speed Wi-Fi" },
  { icon: Wind, label: "Spa & Wellness" },
  { icon: Car, label: "Airport Transfer" },
  { icon: Coffee, label: "24/7 Concierge" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

function Index() {
  const siteData = useSiteData();
  const rooms = siteData.rooms;
  const activities = siteData.activities;
  const gallery = siteData.gallery;
  const hero = siteData.hero;
  const review = siteData.review;
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.3]);
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [bookingSelection, setBookingSelection] = useState<{ kind: "room" | "activity"; name: string } | null>(null);

  const selectAndScrollToBook = (kind: "room" | "activity", name: string) => {
    setBookingSelection({ kind, name });
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : (i + 1) % gallery.length));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <div className="bg-background text-foreground font-sans antialiased overflow-x-hidden">
      {/* NAV */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navSolid ? "bg-background/85 backdrop-blur-xl border-b border-border/60 py-3" : "py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#top" className={`font-display text-2xl tracking-wide ${navSolid ? "text-foreground" : "text-white"}`}>
            {LOGO_MARK} <span className="text-accent text-sm tracking-[0.3em] uppercase">Resort</span>
          </a>
          <div className={`hidden md:flex items-center gap-10 text-sm tracking-wide ${navSolid ? "text-foreground" : "text-white/90"}`}>
            {["Rooms", "Activities", "Gallery", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-accent transition-colors">{l}</a>
            ))}
            <a href={PHONE_TEL} className="bg-accent text-accent-foreground px-5 py-2.5 rounded-full hover:bg-accent/90 transition tracking-wider text-xs uppercase font-medium">Book Now</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden ${navSolid ? "text-foreground" : "text-white"}`} aria-label="Menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-4 text-sm">
            {["Rooms", "Activities", "Gallery", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <a href={PHONE_TEL} onClick={() => setMenuOpen(false)} className="text-accent font-medium">Book Now · {PHONE_DISPLAY}</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="top" className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img src={hero.image} alt="Palm Garden Hotel" className="hero-zoom w-full h-[120%] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative h-full flex flex-col items-center justify-center text-center px-6 text-white">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="uppercase tracking-[0.4em] text-xs text-accent mb-6">
            {hero.eyebrow}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="font-display text-6xl md:text-8xl lg:text-9xl font-light leading-[0.95] max-w-5xl">
            {hero.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mt-8 max-w-xl text-white/80 text-lg font-light">
            {hero.subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.1 }} className="mt-12 flex flex-wrap gap-4 justify-center">
            <a href="#book" className="bg-accent text-accent-foreground px-8 py-4 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition">Reserve a Stay</a>
            <a href="#rooms" className="border border-white/40 text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase font-medium hover:bg-white/10 transition">Explore Rooms</a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-[0.3em] uppercase">
          Scroll
        </motion.div>
      </section>

      {/* INTRO */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="md:col-span-5">
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-6">Our Story</p>
            <h2 className="font-display text-5xl md:text-6xl leading-[1.05] text-primary">A sanctuary woven through palms.</h2>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.15 }} className="md:col-span-7 space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>Tucked into the leafy edge of Kaase, Palm Garden Hotel is a quiet counterpoint to the rhythm of Kumasi. Our grounds unfold across landscaped gardens, shaded courtyards, and an open-air pavilion where guests linger over slow breakfasts.</p>
            <p>Every room is shaped by the colours of the Ashanti land — earthy clays, deep greens, soft brass — and finished with the comforts of a contemporary boutique hotel.</p>
            <div className="flex items-center gap-2 pt-4">
              {[1, 2, 3, 4].map((i) => <Star key={i} className="w-5 h-5 fill-accent text-accent" />)}
              <Star className="w-5 h-5 fill-accent/50 text-accent" />
              <span className="ml-3 text-foreground font-medium">{review.rating}</span>
              <span className="text-muted-foreground">· {review.reviewCount}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMAGE BREAK */}
      <section className="relative h-[60vh] overflow-hidden">
        <motion.img initial={{ scale: 1.2 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} src={longPool.url} alt="Palm Garden pool surrounded by trees" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-center justify-center px-6">
          <motion.blockquote initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="font-display text-3xl md:text-5xl text-white text-center max-w-4xl leading-tight italic font-light">
            "{review.quote}"
            <footer className="not-italic text-sm tracking-[0.3em] uppercase mt-8 text-white/70">{review.attribution}</footer>
          </motion.blockquote>
        </div>
      </section>

      {/* ROOMS */}
      <section id="rooms" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">Accommodation</p>
              <h2 className="font-display text-5xl md:text-6xl text-primary leading-[1.05]">Rooms & Villas</h2>
            </div>
            <p className="text-muted-foreground max-w-md">Twenty-four bespoke rooms and villas, each opening onto a private corner of the garden.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((r, i) => (
              <motion.article key={r.id} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ delay: i * 0.15 }} className="group cursor-pointer">
                <div className="overflow-hidden rounded-sm aspect-[4/5] mb-6 bg-muted">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
                </div>
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-display text-3xl text-primary">{r.name}</h3>
                  <span className="text-sm text-muted-foreground"><span className="text-accent font-medium">{r.price}</span> / night</span>
                </div>
                <p className="text-muted-foreground mb-5 leading-relaxed">{r.desc}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-muted-foreground/80 mb-5">
                  {r.features.map((f) => <li key={f}>· {f}</li>)}
                </ul>
                <button type="button" onClick={() => selectAndScrollToBook("room", r.name)} className="inline-flex items-center gap-2 text-sm tracking-wider uppercase text-primary group-hover:text-accent transition">
                  Book Now <ChevronRight className="w-4 h-4" />
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section id="amenities" className="py-32 px-6 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-20">
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">The Experience</p>
            <h2 className="font-display text-5xl md:text-6xl leading-tight max-w-3xl mx-auto">Considered comforts, quietly delivered.</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6">
            {amenities.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7 }} className="flex flex-col items-center text-center">
                <a.icon className="w-8 h-8 text-accent mb-4" strokeWidth={1.25} />
                <p className="text-sm tracking-wider uppercase font-light">{a.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="py-32 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">Activities & Dining</p>
              <h2 className="font-display text-5xl md:text-6xl text-primary leading-[1.05]">Days well spent.</h2>
            </div>
            <p className="text-muted-foreground max-w-md">From morning paddles to candlelit dinners — reasonably priced for guests and visitors alike.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((a, i) => (
              <motion.article key={a.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: (i % 3) * 0.12, duration: 0.8 }} className="group bg-background rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={a.img} alt={a.name} className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" loading="lazy" />
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-3 mb-3 text-accent">
                    {(() => { const Icon = ICONS[a.iconKey] ?? Sailboat; return <Icon className="w-5 h-5" strokeWidth={1.5} />; })()}
                    <span className="text-xs uppercase tracking-[0.25em]">{a.unit}</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-display text-2xl text-primary">{a.name}</h3>
                    <span className="text-accent font-medium">{a.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{a.desc}</p>
                  <button type="button" onClick={() => selectAndScrollToBook("activity", a.name)} className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground py-3 rounded-full text-xs tracking-widest uppercase font-medium hover:bg-accent hover:text-accent-foreground transition">Book Now</button>
                </div>
              </motion.article>
            ))}
          </div>

          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mt-12">
            All bookings via <a href={PHONE_TEL} className="text-accent">{PHONE_DISPLAY}</a>
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16">
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">Gallery</p>
            <h2 className="font-display text-5xl md:text-6xl text-primary leading-[1.05] max-w-2xl">Moments from the garden.</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {gallery.map((src, i) => (
              <motion.button
                type="button"
                onClick={() => setLightbox(i)}
                key={`${src}-${i}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 4) * 0.1, duration: 0.8 }}
                className={`overflow-hidden rounded-sm bg-muted cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-accent ${i === 0 || i === 5 ? "row-span-2 aspect-[3/4] md:aspect-auto" : "aspect-square"}`}
              >
                <img src={src} alt="Palm Garden gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out" loading="lazy" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
              aria-label="Close"
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2"
            ><X className="w-7 h-7" /></button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length)); }}
              aria-label="Previous"
              className="absolute left-3 md:left-8 text-white/70 hover:text-white p-3"
            ><ChevronLeft className="w-8 h-8" /></button>
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? null : (i + 1) % gallery.length)); }}
              aria-label="Next"
              className="absolute right-3 md:right-8 text-white/70 hover:text-white p-3"
            ><ChevronRight className="w-8 h-8" /></button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              src={gallery[lightbox]}
              alt=""
              className="max-w-[92vw] max-h-[88vh] object-contain rounded shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-[0.3em] uppercase">
              {lightbox + 1} / {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOOKING */}
      <BookingSection rooms={rooms} activities={activities} selection={bookingSelection} onSelectionConsumed={() => setBookingSelection(null)} />

      {/* CONTACT */}
      <section id="contact" className="py-32 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">Find Us</p>
            <h2 className="font-display text-5xl md:text-6xl text-primary leading-[1.05] mb-10">Visit Palm Garden.</h2>
            <div className="space-y-6 text-foreground">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent mt-1 shrink-0" />
                <div><p className="font-medium">Address</p><p className="text-muted-foreground">J9RW+RRQ, Kaase, Kumasi, Ghana</p></div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-accent mt-1 shrink-0" />
                <div><p className="font-medium">Reservations</p><a href={PHONE_TEL} className="text-muted-foreground hover:text-accent transition">{PHONE_DISPLAY}</a></div>
              </div>
              <div className="flex items-start gap-4">
                <Star className="w-5 h-5 text-accent mt-1 shrink-0 fill-accent" />
                <div><p className="font-medium">Rated {review.rating} on Google</p><p className="text-muted-foreground">From {review.reviewCount}</p></div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="rounded-sm overflow-hidden aspect-square md:aspect-auto min-h-[400px] shadow-2xl">
            <iframe title="Palm Garden Hotel location" src="https://www.google.com/maps?q=Palm+Garden+Hotel+Kaase+Kumasi&output=embed" className="w-full h-full border-0" loading="lazy" />
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-display text-3xl">Palm Garden Resort</p>
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Palm Garden Resort, Kaase · All rights reserved.
            <Link to="/admin" aria-label="Admin" className="ml-1 text-primary-foreground/30 hover:text-accent transition-colors select-none" title="Admin">.</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function BookingSection({ rooms }: { rooms: { name: string }[] }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    checkin: "",
    checkout: "",
    guests: "2",
    room: rooms[0]?.name ?? "Garden Deluxe",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (rooms[0]?.name && !rooms.some((r) => r.name === form.room)) {
      setForm((f) => ({ ...f, room: rooms[0].name }));
    }
  }, [rooms, form.room]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="book" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${poolDay.url})` }} />
      <div className="absolute inset-0 bg-primary/85" />
      <div className="relative max-w-4xl mx-auto text-primary-foreground">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
          <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">Reserve</p>
          <h2 className="font-display text-5xl md:text-6xl leading-tight">Begin your stay</h2>
          <p className="mt-4 text-primary-foreground/70">Best rates guaranteed when you book direct.</p>
        </motion.div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-background/95 text-foreground rounded-sm p-12 text-center">
            <p className="uppercase tracking-[0.3em] text-xs text-accent mb-4">Thank you, {form.name}</p>
            <h3 className="font-display text-3xl text-primary mb-3">Your request has been received.</h3>
            <p className="text-muted-foreground">Our reservations team will confirm your {form.room} for {form.guests} guest(s) within the hour.</p>
          </motion.div>
        ) : (
          <motion.form variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: 0.15 }} onSubmit={onSubmit} className="bg-background/95 backdrop-blur text-foreground rounded-sm p-8 md:p-12 grid md:grid-cols-2 gap-6 shadow-2xl">
            <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Check-in" type="date" value={form.checkin} onChange={(v) => setForm({ ...form, checkin: v })} required />
            <Field label="Check-out" type="date" value={form.checkout} onChange={(v) => setForm({ ...form, checkout: v })} required />
            <Select label="Guests" value={form.guests} onChange={(v) => setForm({ ...form, guests: v })} options={["1", "2", "3", "4", "5+"]} />
            <Select label="Room" value={form.room} onChange={(v) => setForm({ ...form, room: v })} options={rooms.map((r) => r.name)} />
            <div className="md:col-span-2 mt-4 space-y-3">
              <button type="submit" className="w-full bg-accent text-accent-foreground py-4 rounded-full uppercase tracking-widest text-sm font-medium hover:bg-accent/90 transition">Request Reservation</button>
              <a href={PHONE_TEL} className="block text-center w-full border border-primary-foreground/30 text-foreground py-4 rounded-full uppercase tracking-widest text-sm font-medium hover:bg-primary hover:text-primary-foreground transition">Or call now · {PHONE_DISPLAY}</a>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-0 border-b border-border bg-transparent py-2 focus:outline-none focus:border-accent transition" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-0 border-b border-border bg-transparent py-2 focus:outline-none focus:border-accent transition">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
