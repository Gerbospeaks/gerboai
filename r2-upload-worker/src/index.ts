export interface Env {
  LOGOS_BUCKET: R2Bucket;
  R2_PUBLIC_DOMAIN: string;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      // Extract Firebase token
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      const userId = payload.user_id;

      if (!userId) {
        return new Response("Invalid token", {
          status: 401,
          headers: corsHeaders,
        });
      }

      // Upload file
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
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (err: any) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  },
};

export default worker;