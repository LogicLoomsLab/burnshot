// supabase/functions/cleanup/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");

    // 1️⃣ If request is from CRON → must use service role key
    if (authHeader === `Bearer ${supabaseServiceKey}`) {
      console.log("Running cleanup via CRON job");
    } else {
      // 2️⃣ Otherwise → must be an admin user
      if (!authHeader) {
        return new Response(
          JSON.stringify({ status: "error", message: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate user JWT
      const jwt = authHeader.replace("Bearer ", "");
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await supabaseAuth.auth.getUser(jwt);

      if (error || !user) {
        return new Response(
          JSON.stringify({ status: "error", message: "Invalid user" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (user.app_metadata?.role !== "admin") {
        return new Response(
          JSON.stringify({ status: "error", message: "Forbidden" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log(`Running cleanup via manual admin trigger: ${user.email}`);
    }

    // 3️⃣ Delete expired screenshots
    const now = new Date().toISOString();

    const { data: expired, error: selectError } = await supabase
      .from("screenshots")
      .select("id, file_path")
      .lte("expiry_at", now)
      .or("views.gte.max_views");

    if (selectError) {
      console.error("Select error:", selectError);
      throw selectError;
    }

    if (expired && expired.length > 0) {
      // Delete files from storage
      const paths = expired.map((f) => f.file_path);
      const { error: storageError } = await supabase.storage
        .from("screenshots")
        .remove(paths);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        throw storageError;
      }

      // Delete rows from DB
      const ids = expired.map((f) => f.id);
      const { error: deleteError } = await supabase
        .from("screenshots")
        .delete()
        .in("id", ids);

      if (deleteError) {
        console.error("Delete rows error:", deleteError);
        throw deleteError;
      }

      console.log(`✅ Cleaned up ${expired.length} expired screenshots`);
    } else {
      console.log("No expired screenshots found");
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: expired?.length
          ? `Cleaned up ${expired.length} expired screenshots`
          : "No expired screenshots found",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response(
      JSON.stringify({ status: "error", message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});