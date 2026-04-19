export interface Env {
	LOGOS_BUCKET: R2Bucket;
	DOCUMENTS_BUCKET: R2Bucket;
	R2_PUBLIC_DOMAIN: string;
	DOCUMENTS_PUBLIC_DOMAIN: string;
	AI: Ai;
	CLEANUP_SECRET:        string;
  FIREBASE_PROJECT_ID:   string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY_B64: string;
}

const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-File-Name',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		if (url.pathname === '/upload-logo' || url.pathname === '/') {
			return handleLogoUpload(request, env, corsHeaders);
		}

		if (url.pathname === '/upload-pdf') {
			return handlePdfUpload(request, env, corsHeaders);
		}

		if (url.pathname === '/ai') {
			return handleAI(request, env, corsHeaders);
		}
        if (url.pathname === '/cleanup-expired') {
  return handleCleanupExpired(request, env, corsHeaders);
}
		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
};

// ── Logo upload handler ──
async function handleLogoUpload(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
	}
	try {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}
		const idToken = authHeader.split('Bearer ')[1];
		const payload = JSON.parse(atob(idToken.split('.')[1]));
		const userId = payload.user_id;
		if (!userId) {
			return new Response('Invalid token', { status: 401, headers: corsHeaders });
		}
		const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
		const fileBuffer = await request.arrayBuffer();
		const timestamp = Date.now();
		const extension = contentType.split('/')[1] || 'bin';
		const fileName = `logos/${userId}/${timestamp}.${extension}`;
		await env.LOGOS_BUCKET.put(fileName, fileBuffer, {
			httpMetadata: { contentType },
		});
		const publicUrl = `https://${env.R2_PUBLIC_DOMAIN}/${fileName}`;
		return new Response(JSON.stringify({ publicUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('Worker error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}

// ── PDF upload handler ──
async function handlePdfUpload(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
	}
	try {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}
		const idToken = authHeader.split('Bearer ')[1];
		const payload = JSON.parse(atob(idToken.split('.')[1]));
		const userId = payload.user_id;
		if (!userId) {
			return new Response('Invalid token', { status: 401, headers: corsHeaders });
		}

		const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
		if (!contentType.includes('application/pdf')) {
			return new Response('Only PDF files are allowed', { status: 415, headers: corsHeaders });
		}

		// Read the original filename from a custom header if provided, fallback to timestamp
		const originalName = request.headers.get('X-File-Name') ?? `${Date.now()}.pdf`;
		const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');

		const fileBuffer = await request.arrayBuffer();
		const key = `users/${userId}/${Date.now()}-${safeName}`;

		await env.DOCUMENTS_BUCKET.put(key, fileBuffer, {
			httpMetadata: { contentType: 'application/pdf' },
			customMetadata: { userId, originalName },
		});

		const publicUrl = `https://${env.DOCUMENTS_PUBLIC_DOMAIN}/${key}`;

		return new Response(JSON.stringify({ publicUrl, key }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('PDF upload error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}
async function handleCleanupExpired(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Secure it with a secret key so only you can trigger it
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.CLEANUP_SECRET}`) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    // Firestore REST API — no SDK needed in a Worker
    const projectId = env.FIREBASE_PROJECT_ID;
    const now       = new Date().toISOString();

    // Query expired active listings
    const queryRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getFirebaseToken(env)}`,
        },
        body: JSON.stringify({
          structuredQuery: {
            from:  [{ collectionId: 'serviceProviders' }],
            where: {
              compositeFilter: {
                op: 'AND',
                filters: [
                  {
                    fieldFilter: {
                      field:  { fieldPath: 'active' },
                      op:     'EQUAL',
                      value:  { booleanValue: true },
                    },
                  },
                  {
                    fieldFilter: {
                      field:  { fieldPath: 'expiresAt' },
                      op:     'LESS_THAN_OR_EQUAL',
                      value:  { timestampValue: now },
                    },
                  },
                ],
              },
            },
          },
        }),
      }
    );

    const results = await queryRes.json() as any[];

    // Filter out empty results
    const expiredDocs = results.filter((r: any) => r.document);

    if (expiredDocs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No expired listings found.' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Soft-delete each expired doc (set active: false)
    const token    = await getFirebaseToken(env);
    const patchJobs = expiredDocs.map((r: any) => {
      const docName = r.document.name; // full path
      return fetch(
        `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=active`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fields: {
              active: { booleanValue: false },
            },
          }),
        }
      );
    });

    await Promise.all(patchJobs);

    return new Response(
      JSON.stringify({ message: `Deactivated ${expiredDocs.length} expired listings.` }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (err: any) {
    console.error('Cleanup error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

// ── Get a Firebase auth token using a service account ──────────────────────
async function getFirebaseToken(env: Env): Promise<string> {
  const now     = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    sub: env.FIREBASE_CLIENT_EMAIL,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  // Sign JWT with private key
  const key = await crypto.subtle.importKey(
    'pkcs8',
    strToArrayBuffer(atob(env.FIREBASE_PRIVATE_KEY_B64)),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header  = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body    = btoa(JSON.stringify(payload));
  const signing = `${header}.${body}`;

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signing)
  );

  const jwt = `${signing}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json() as any;
  return tokenData.access_token;
}

function strToArrayBuffer(str: string): ArrayBuffer {
  const buf  = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);
  return buf;
}
// ── AI handler ──
async function handleAI(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
	}
	try {
		interface AIRequestBody {
			system: string;
			messages: { role: string; content: string }[];
			max_tokens?: number;
		}

		const { system, messages, max_tokens = 1000 } = (await request.json()) as AIRequestBody;

		const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
			messages: [{ role: 'system', content: system }, ...messages],
			max_tokens,
		});

		const text = typeof aiResponse === 'string' ? aiResponse : ((aiResponse as any).response ?? JSON.stringify(aiResponse));

		return new Response(JSON.stringify({ text }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('AI Worker error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}

export default worker;
