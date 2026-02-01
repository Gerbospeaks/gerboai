
export interface Env {
  LOGOS_BUCKET: R2Bucket;
  REACT_APP_CLOUDFLARE_R2_PUBLIC_DOMAIN: string;
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      // Extract Firebase token (optional)
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
      const idToken = authHeader.split("Bearer ")[1];
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      const userId = payload.user_id;
      if (!userId) return new Response("Invalid token", { status: 401 });

      // Upload file
      const contentType = request.headers.get("Content-Type") || "application/octet-stream";
      const fileBuffer = await request.arrayBuffer();
      const timestamp = Date.now();
      const extension = contentType.split("/")[1] || "bin";
      const fileName = `logos/${userId}/${timestamp}.${extension}`;

      await env.LOGOS_BUCKET.put(fileName, fileBuffer, {
        httpMetadata: { contentType },
      });

      const publicUrl = `https://${env.REACT_APP_CLOUDFLARE_R2_PUBLIC_DOMAIN}/${fileName}`;
      return new Response(JSON.stringify({ publicUrl }), { headers: { "Content-Type": "application/json" } });
    } catch (err: any) {
      console.error("Worker error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
