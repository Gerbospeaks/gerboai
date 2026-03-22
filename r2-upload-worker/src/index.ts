export interface Env {
  LOGOS_BUCKET: R2Bucket;
  R2_PUBLIC_DOMAIN: string;
  AI: Ai;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/upload-logo" || url.pathname === "/") {
      return handleLogoUpload(request, env, corsHeaders);
    }

    // 👇 ADD THIS BLOCK
    if (url.pathname === "/ai") {
      return handleAI(request, env, corsHeaders);
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};

// ── your existing logo upload handler — UNTOUCHED ──
async function handleLogoUpload(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const payload = JSON.parse(atob(idToken.split(".")[1]));
    const userId = payload.user_id;
    if (!userId) {
      return new Response("Invalid token", { status: 401, headers: corsHeaders });
    }
    const contentType = request.headers.get("Content-Type") || "application/octet-stream";
    const fileBuffer = await request.arrayBuffer();
    const timestamp = Date.now();
    const extension = contentType.split("/")[1] || "bin";
    const fileName = `logos/${userId}/${timestamp}.${extension}`;
    await env.LOGOS_BUCKET.put(fileName, fileBuffer, {
      httpMetadata: { contentType },
    });
    const publicUrl = `https://${env.R2_PUBLIC_DOMAIN}/${fileName}`;
    return new Response(JSON.stringify({ publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Worker error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

async function handleAI(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
  try {
    // 👇 add this interface and cast
    interface AIRequestBody {
      system: string;
      messages: { role: string; content: string }[];
      max_tokens?: number;
    }

    const { system, messages, max_tokens = 1000 } = await request.json() as AIRequestBody;

    const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
      max_tokens,
    });

    const text = typeof aiResponse === "string" 
  ? aiResponse 
  : (aiResponse as any).response ?? JSON.stringify(aiResponse);

return new Response(JSON.stringify({ text }), {
  status: 200,
  headers: { "Content-Type": "application/json", ...corsHeaders },
});
  } catch (err: any) {
    console.error("AI Worker error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export default worker;