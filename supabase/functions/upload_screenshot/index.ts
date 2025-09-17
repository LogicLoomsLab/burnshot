import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const { fileName, fileContent } = await req.json();
    if (!fileName || !fileContent) {
      return new Response(JSON.stringify({ error: "Missing fileName or fileContent" }), { status: 400 });
    }

    const filePath = `screenshots/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(filePath, new TextEncoder().encode(fileContent), {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Insert metadata
    const { error: dbError } = await supabase.from("screenshots").insert({
      file_path: filePath,
    });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ status: "success", filePath }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(
      JSON.stringify({ status: "error", message: String(err) }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});