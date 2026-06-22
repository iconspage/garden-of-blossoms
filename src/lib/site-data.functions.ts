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
