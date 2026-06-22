import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveSiteContent } from "./site-data.functions";

import img4 from "@/assets/image-4.png.asset.json";
import img5 from "@/assets/image-5.png.asset.json";
import img6 from "@/assets/image-6.png.asset.json";
import img7 from "@/assets/image-7.png.asset.json";

export type Activity = {
  id: string;
  iconKey: "Sailboat" | "Fish" | "Coffee" | "UtensilsCrossed" | "CalendarDays" | "Waves" | "Wind";
  name: string;
  price: string;
  unit: string;
  desc: string;
  img: string;
};

export type Room = {
  id: string;
  name: string;
  price: string;
  img: string;
  desc: string;
  features: string[];
};

export type SiteData = {
  activities: Activity[];
  rooms: Room[];
};

export const DEFAULT_DATA: SiteData = {
  activities: [
    { id: "boat", iconKey: "Sailboat", name: "Boat Riding", price: "₵50", unit: "per person", desc: "Glide across our private pond on a hand-crafted paddle boat — perfect for couples and families.", img: img5.url },
    { id: "fish", iconKey: "Fish", name: "Fish Feeding", price: "₵20", unit: "per visit", desc: "Feed our resident koi and tilapia from the wooden bridges through the water garden.", img: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1200&q=80" },
    { id: "cafe", iconKey: "Coffee", name: "Café Shop", price: "from ₵25", unit: "hot drinks & pastries", desc: "Specialty coffee, fresh juices and pastries served poolside throughout the day.", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80" },
    { id: "restaurant", iconKey: "UtensilsCrossed", name: "Flamingo Restaurant", price: "from ₵80", unit: "à la carte", desc: "Live-grill restaurant and bar serving Ghanaian classics and continental favourites under the lights.", img: img7.url },
    { id: "event", iconKey: "CalendarDays", name: "Event Room", price: "from ₵2,500", unit: "per event", desc: "Outdoor garden pavilion for weddings, birthdays and corporate events — up to 150 guests.", img: img6.url },
    { id: "pool", iconKey: "Waves", name: "Pool Access", price: "₵40", unit: "day pass", desc: "Spend the day at our palm-shaded swimming pool with loungers, towels and bar service.", img: img4.url },
    { id: "swing", iconKey: "Wind", name: "Garden Swing", price: "Free", unit: "for guests", desc: "Unwind on our handcrafted wooden swings nestled among the palms — a quiet favourite of every guest.", img: "https://images.unsplash.com/photo-1502230831726-fe5549140034?w=1200&q=80" },
  ],
  rooms: [
    { id: "deluxe", name: "Garden Deluxe", price: "₵850", img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80", desc: "Spacious king room opening onto private tropical gardens.", features: ["King bed", "Garden terrace", "Rain shower", '55" smart TV'] },
    { id: "suite", name: "Palm Suite", price: "₵1,400", img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80", desc: "A generous suite with separate lounge and views of the palm courtyard.", features: ["Lounge area", "Soaking tub", "Mini bar", "Espresso machine"] },
    { id: "villa", name: "Ashanti Villa", price: "₵2,600", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80", desc: "Our signature standalone villa with plunge pool and personal host.", features: ["Plunge pool", "Private chef", "Two bedrooms", "Outdoor lounge"] },
  ],
};

function normalize(parsed: Partial<SiteData> | null | undefined): SiteData {
  if (!parsed) return DEFAULT_DATA;
  return {
    activities: parsed.activities?.length ? (parsed.activities as Activity[]) : DEFAULT_DATA.activities,
    rooms: parsed.rooms?.length ? (parsed.rooms as Room[]) : DEFAULT_DATA.rooms,
  };
}

export async function loadDataFromCloud(): Promise<SiteData> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    if (error) throw error;
    return normalize(data?.data as Partial<SiteData> | null);
  } catch (e) {
    console.error("loadDataFromCloud", e);
    return DEFAULT_DATA;
  }
}

export async function saveData(data: SiteData, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await saveSiteContent({ data: { password, payload: data } });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("palm-data-updated"));
    }
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Save failed";
    return { ok: false, error: msg };
  }
}

export function useSiteData(): SiteData {
  const [data, setData] = useState<SiteData>(DEFAULT_DATA);
  useEffect(() => {
    let mounted = true;
    const load = () => loadDataFromCloud().then((d) => { if (mounted) setData(d); });
    load();
    const onUpdate = () => load();
    window.addEventListener("palm-data-updated", onUpdate);
    const channel = supabase
      .channel("site_content_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      window.removeEventListener("palm-data-updated", onUpdate);
      supabase.removeChannel(channel);
    };
  }, []);
  return data;
}

// Admin session (client-side flag only; real check happens server-side on save)
const ADMIN_EMAIL = "palmgarden@gmail.com";
const ADMIN_PASS = "palm@12GH";
const AUTH_KEY = "palm_garden_admin_auth";
const PASS_KEY = "palm_garden_admin_pass";

export function adminLogin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
    sessionStorage.setItem(AUTH_KEY, "1");
    sessionStorage.setItem(PASS_KEY, password);
    return true;
  }
  return false;
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function adminPassword(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PASS_KEY) ?? "";
}

export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(PASS_KEY);
}
