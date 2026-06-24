import { createServerFn } from "@tanstack/react-start";

const ADMIN_PASSWORD = "palm@12GH";

type SavePayload = {
  password: string;
  payload: unknown;
};

export const saveSiteContent = createServerFn({ method: "POST" })
  .inputValidator((d: SavePayload) => {
    if (!d || typeof d.password !== "string") throw new Error("Invalid request");
    return d;
  })
  .handler(async ({ data }) => {
    if (data.password !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin password");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ id: "main", data: data.payload as never, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type BookingRow = {
  id: string;
  kind: string;
  item_name: string;
  name: string;
  email: string;
  phone: string;
  checkin: string | null;
  checkout: string | null;
  guests: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export const listBookings = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => {
    if (!d || typeof d.password !== "string") throw new Error("Invalid request");
    return d;
  })
  .handler(async ({ data }): Promise<BookingRow[]> => {
    if (data.password !== ADMIN_PASSWORD) throw new Error("Invalid admin password");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []) as BookingRow[];
  });

export const deleteBooking = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => {
    if (!d || typeof d.password !== "string" || typeof d.id !== "string") throw new Error("Invalid request");
    return d;
  })
  .handler(async ({ data }) => {
    if (data.password !== ADMIN_PASSWORD) throw new Error("Invalid admin password");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
