import { createServerFn } from "@tanstack/react-start";

const ADMIN_PASSWORD = "palm@12GH";

type SavePayload = {
  password: string;
  payload: unknown;
};

type UploadPayload = {
  password: string;
  filename: string;
  contentType: string;
  base64: string;
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

export const uploadSiteImage = createServerFn({ method: "POST" })
  .inputValidator((d: UploadPayload) => {
    if (!d || typeof d.password !== "string") throw new Error("Invalid request");
    if (!d.filename || !d.base64 || !d.contentType) throw new Error("Missing file");
    return d;
  })
  .handler(async ({ data }) => {
    if (data.password !== ADMIN_PASSWORD) throw new Error("Invalid admin password");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cleanName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${cleanName}`;
    const buf = Buffer.from(data.base64, "base64");
    const { error } = await supabaseAdmin.storage
      .from("site-images")
      .upload(key, buf, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    return { ok: true, url: `/api/public/site-image/${key}` };
  });
