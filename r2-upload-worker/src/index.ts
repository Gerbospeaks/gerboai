export interface Env {
  LOGOS_BUCKET: R2Bucket;
  R2_PUBLIC_DOMAIN: string;
  OPENAI_API_KEY: string; // Add this
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Route to different handlers based on path
    if (url.pathname === "/upload-logo" || url.pathname === "/") {
      return handleLogoUpload(request, env, corsHeaders);
    } else if (url.pathname === "/chat") {
      return handleChat(request, env, corsHeaders);
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};

// Logo upload handler (your existing code)
async function handleLogoUpload(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
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
}

// NEW: Chat handler
async function handleChat(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { messages } = await request.json() as { messages: Array<{ role: string; content: string }> };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for SolidFlo, an invoicing SaaS platform.
            
            About SolidFlo:
            - Automates invoice creation and sending
            - Tracks payments and sends automated reminders
            - Provides client portal for easy payment
            - Integrates with popular accounting software like QuickBooks, Xero
            - Mobile app available for iOS and Android
            
            Pricing:
            - Starter: $15/month - Up to 50 invoices
            - Professional: $35/month - Unlimited invoices
            - Enterprise: Custom pricing
            
            Be concise (under 100 words), friendly, and helpful.
            If asked about demos, tell users to click the "Book a Demo" button on the website.
            If you don't know something specific, offer to connect them with the team.`,
          },
          ...messages,
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(data.error.message);
    }

    return new Response(
      JSON.stringify({
        message: data.choices[0].message.content,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (err: any) {
    console.error("Chat error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Failed to get response",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}

export default worker;