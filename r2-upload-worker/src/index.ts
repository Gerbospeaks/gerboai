
export interface Env {
	LOGOS_BUCKET: R2Bucket;
	DOCUMENTS_BUCKET: R2Bucket;
	R2_PUBLIC_DOMAIN: string;
	DOCUMENTS_PUBLIC_DOMAIN: string;
	AI: Ai;
	CLEANUP_SECRET: string;
	FIREBASE_PROJECT_ID: string;
	FIREBASE_CLIENT_EMAIL: string;
	FIREBASE_PRIVATE_KEY_B64: string;
	MYBROWSER: Fetcher; 
	CREDENTIAL_ENCRYPTION_KEY: string;
}

const DOC_CONFIG: Record<string, { prefix: string; folder: string }> = {
  // ── GENERAL (your originals) ──────────────────────────────────────
  invoice:                    { prefix: 'Inv', folder: 'invoices' },
  quote:                      { prefix: 'QT',  folder: 'quotes' },
  purchase_order:             { prefix: 'PO',  folder: 'purchase_orders' },
  sick_note:                  { prefix: 'SN',  folder: 'sick_notes' },
  jobcard:                    { prefix: 'JC',  folder: 'jobcards' },
  waybill:                    { prefix: 'WB',  folder: 'waybills' },

  // ── AUTOMOTIVE ───────────────────────────────────────────────────
  vehicle_service_record:     { prefix: 'VSR', folder: 'vehicle_service_records' },
  vehicle_inspection:         { prefix: 'VI',  folder: 'vehicle_inspections' },
  roadworthy_certificate:     { prefix: 'RWC', folder: 'roadworthy_certificates' },

  // ── CONSTRUCTION ─────────────────────────────────────────────────
  building_contract:          { prefix: 'BC',  folder: 'building_contracts' },
  site_inspection:            { prefix: 'SI',  folder: 'site_inspections' },
  variation_order:            { prefix: 'VO',  folder: 'variation_orders' },
  completion_certificate:     { prefix: 'CC',  folder: 'completion_certificates' },

  // ── ELECTRICAL / PLUMBING ────────────────────────────────────────
  coc:                        { prefix: 'COC', folder: 'certificates_of_compliance' },
  plumbing_certificate:       { prefix: 'PC',  folder: 'plumbing_certificates' },
  plumbing_report:            { prefix: 'PR',  folder: 'plumbing_reports' },

  // ── MEDICAL ──────────────────────────────────────────────────────
  prescription:               { prefix: 'RX',  folder: 'prescriptions' },
  referral_letter:            { prefix: 'RL',  folder: 'referral_letters' },
  patient_consent:            { prefix: 'PCF', folder: 'patient_consent_forms' },

  // ── LEGAL ────────────────────────────────────────────────────────
  nda:                        { prefix: 'NDA', folder: 'ndas' },
  power_of_attorney:          { prefix: 'POA', folder: 'powers_of_attorney' },
  affidavit:                  { prefix: 'AFF', folder: 'affidavits' },

  // ── REAL ESTATE ──────────────────────────────────────────────────
  lease_agreement:            { prefix: 'LA',  folder: 'lease_agreements' },
  property_inspection:        { prefix: 'PI',  folder: 'property_inspections' },
  offer_to_purchase:          { prefix: 'OTP', folder: 'offers_to_purchase' },

  // ── FINANCE / HR ─────────────────────────────────────────────────
  statement_of_account:       { prefix: 'SOA', folder: 'statements_of_account' },
  remittance_advice:          { prefix: 'RA',  folder: 'remittance_advices' },
  employment_contract:        { prefix: 'EC',  folder: 'employment_contracts' },
  warning_letter:             { prefix: 'WL',  folder: 'warning_letters' },
  leave_application:          { prefix: 'LEA', folder: 'leave_applications' },

  // ── LOGISTICS ────────────────────────────────────────────────────
  delivery_note:              { prefix: 'DN',  folder: 'delivery_notes' },
  packing_list:               { prefix: 'PL',  folder: 'packing_lists' },
  freight_invoice:            { prefix: 'FI',  folder: 'freight_invoices' },

  // ... etc
};
const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-File-Name, x-sf-industry, x-sf-uid',
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
		if (url.pathname === '/upload-listing-image') {
			return handleListingImageUpload(request, env, corsHeaders);
		}
     if (url.pathname === '/upload-menu-image') {
   return handleMenuItemImageUpload(request, env, corsHeaders);
 }
		if (url.pathname === '/ai') {
			return handleAI(request, env, corsHeaders);
		}
		if (url.pathname === '/cleanup-expired') {
			return handleCleanupExpired(request, env, corsHeaders);
		}
		// ── NEW ──
		if (url.pathname === '/generate-pdf') {
			return handleGeneratePdf(request, env, corsHeaders);
		}
		if (url.pathname === '/invoice-extract') {
      return handleInvoiceExtract(request, env, corsHeaders);
}
 if (url.pathname === '/ai-agent') {
      return handleAIAgent(request, env, corsHeaders);
    }
    if (url.pathname === '/transcribe') {
  return handleTranscribe(request, env, corsHeaders);
}
if (url.pathname === '/save-gateway-credentials') {
      return handleSaveGatewayCredentials(request, env, corsHeaders);
    }

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},
};


async function handleGeneratePdf(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
	}

	try {
		// ── 1. Auth (same pattern you already use) ────────────────────────────
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

		// ── 2. Parse body ─────────────────────────────────────────────────────
		interface GeneratePdfBody {
			docType: string;
			docNumber: string;
			data: Record<string, any>;
			metadata?: Record<string, any>;
		}
		const { docType, docNumber, data, metadata = {} } = (await request.json()) as GeneratePdfBody;

		if (!docType || !docNumber || !data) {
			return new Response(JSON.stringify({ error: 'Missing required fields: docType, docNumber, data' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		const config = DOC_CONFIG[docType];
		if (!config) {
			return new Response(JSON.stringify({ error: `Unknown docType. Valid types: ${Object.keys(DOC_CONFIG).join(', ')}` }), {
				status: 400,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}

		// ── 3. Build HTML from template ───────────────────────────────────────
		const htmlContent = buildDocumentHTML(docType, docNumber, data);

		// ── 4. Render to PDF via Puppeteer ────────────────────────────────────
		// @ts-ignore — puppeteer types loaded via @cloudflare/puppeteer
		const puppeteer = await import('@cloudflare/puppeteer');
		const browser = await puppeteer.default.launch(env.MYBROWSER);
		const page = await browser.newPage();
		await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
		});
		await browser.close();

		// ── 5. Save PDF to DOCUMENTS_BUCKET ──────────────────────────────────
		// Stored alongside your existing uploads: users/{uid}/{folder}/{prefix}-{docNumber}.pdf
		const fileName = `${config.prefix}-${docNumber}.pdf`;
		const r2Key = `solidflo/users/${userId}/${config.folder}/${fileName}`;

		await env.DOCUMENTS_BUCKET.put(r2Key, pdfBuffer, {
			httpMetadata: {
				contentType: 'application/pdf',
				contentDisposition: `inline; filename="${fileName}"`,
			},
			customMetadata: {
				userId,
				docType,
				docNumber,
				generatedAt: new Date().toISOString(),
			},
		});

		const downloadUrl = `https://${env.DOCUMENTS_PUBLIC_DOMAIN}/${r2Key}`;

		// ── 6. Save link + metadata to Firestore ──────────────────────────────
		// Path: users/{uid}/{folder}/{docNumber}
		// (Same token helper you already have for cleanup-expired)
		await saveDocumentRecord(env, userId, config.folder, docNumber, {
			fileName,
			downloadUrl,
			r2Key,
			docType,
			docNumber,
			generatedAt: new Date().toISOString(),
			...metadata,
		});

		return new Response(JSON.stringify({ success: true, downloadUrl, fileName }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('generate-pdf error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}
async function handleInvoiceExtract(
    request: Request,
    env: Env,
    corsHeaders: Record<string, string>
): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
        // ── Auth (same pattern as your other handlers) ────────────────────
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }

        // ── Parse prompt from body ────────────────────────────────────────
        const { prompt } = (await request.json()) as { prompt: string };
        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Missing prompt' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // ── Call AI (reuses your existing env.AI binding) ─────────────────
        const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
                {
                    role: 'system',
                    content: `You extract invoice data from natural language descriptions.
Return ONLY valid JSON — no explanation, no markdown, no code fences.
Schema:
{
  "client_name": "string",
  "client_email": "string or null",
  "client_phone": "string or null",
  "client_address": "string or null",
  "line_items": [
    {
      "description": "string",
      "quantity": number,
      "rate": number,
      "amount": number
    }
  ],
  "due_days": number,
  "notes": "string or null"
}
Rules:
- amount = quantity * rate
- If quantity is not mentioned, default to 1
- If due date not mentioned, default due_days to 30
- Extract ALL line items mentioned
- Return null for fields not mentioned`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: 1000,
        });

        // ── Parse JSON from AI response ────────────────────────────────────
        const rawText = typeof aiResponse === 'string'
            ? aiResponse
            : ((aiResponse as any).response ?? '');

        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const invoiceData = JSON.parse(cleaned);

        return new Response(JSON.stringify(invoiceData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (err: any) {
        console.error('invoice-extract error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
async function handleAIAgent(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }
 
  try {
    // ── Auth (same pattern as all your other handlers) ──────────────────────
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
 
    // ── Parse body ──────────────────────────────────────────────────────────
    interface AgentBody {
      messages: { role: string; content: string }[];
      industry: string;
      context?: {
        clients?: { name: string; email?: string; phone?: string }[];
        materials?: { name: string; price: number; unit?: string }[];
        recentInvoices?: { clientName: string; total: number; status: string; number?: string }[];
      };
    }
 
    const { messages, industry, context = {} } = (await request.json()) as AgentBody;
 
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
 
    // ── Rate limit: 30 requests per user per minute (uses KV if available) ──
    // Simple approach — you can add KV rate limiting later if needed.
    // For now we cap at 20 history messages to control token usage.
    const trimmedMessages = messages.slice(-20);
 
    // ── Build system prompt with real user context ──────────────────────────
    const systemPrompt = buildAgentSystemPrompt(industry, context);
 
    // ── Call Anthropic API (reuses your existing ANTHROPIC_API_KEY secret) ──
    // NOTE: Add ANTHROPIC_API_KEY to your Worker secrets in the CF dashboard:
    //   wrangler secret put ANTHROPIC_API_KEY
  const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: systemPrompt },
        ...trimmedMessages,
      ],
      max_tokens: 1024,
    });

    const replyText = typeof aiResponse === 'string'
      ? aiResponse
      : (aiResponse as any).response ?? '';

    return new Response(JSON.stringify({
      content: [{ type: 'text', text: replyText }]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err: any) {
    console.error('ai-agent error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
 async function handleTranscribe(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { audio, mimeType } = await request.json() as {
      audio: string;       // base64-encoded audio
      mimeType: string;    // e.g. "audio/webm" or "audio/mp4"
    };

    if (!audio) {
      return Response.json({ error: 'Missing audio' }, { status: 400, headers: corsHeaders });
    }

    // Decode base64 back to bytes
    const binaryStr = atob(audio);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Run Whisper — returns { text: "..." }
    const result = await env.AI.run('@cf/openai/whisper', {
      audio: [...bytes],   // Whisper binding expects a plain number array
    });

    return Response.json(
      { transcript: result.text ?? '' },
      { headers: corsHeaders }
    );

  } catch (err: any) {
    console.error('transcribe error:', err);
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

function buildAgentSystemPrompt(
  industry: string,
  context: {
    clients?: { name: string; email?: string; phone?: string }[];
    materials?: { name: string; price: number; unit?: string }[];
    recentInvoices?: { clientName: string; total: number; status: string; number?: string }[];
  }
): string {
  const { clients = [], materials = [], recentInvoices = [] } = context;
 
  // Format saved clients for the prompt
  const clientList = clients.length
    ? clients
        .map((c) => `  - ${c.name}${c.email ? ' (' + c.email + ')' : ''}${c.phone ? ' | ' + c.phone : ''}`)
        .join('\n')
    : '  No clients saved yet.';
 
  // Format materials / price list
  const materialList = materials.length
    ? materials
        .map((m) => `  - ${m.name}: R${m.price} per ${m.unit ?? 'unit'}`)
        .join('\n')
    : '  No materials saved yet.';
 
  // Format recent invoices
  const invoiceList = recentInvoices.length
    ? recentInvoices
        .map((i) => `  - ${i.number ? 'INV-' + i.number + ' | ' : ''}${i.clientName} | R${i.total} | ${i.status}`)
        .join('\n')
    : '  No recent invoices.';
 
  return `You are the SolidFlo AI assistant — embedded inside SolidFlo (solidflo.co.za), an African multi-industry SaaS for small businesses.
 
CURRENT USER:
Industry: ${industry}
Currency: US Dollar ($ / USD)
VAT Rate: 15%
Today: ${new Date().toLocaleDateString('en-ZA')}
 
SAVED CLIENTS:
${clientList}
 
MATERIALS / PRICE LIST:
${materialList}
 
RECENT INVOICES:
${invoiceList}
 
YOUR CAPABILITIES:
1. Create invoices — gather client, line items, quantities, prices, VAT (15%), discount, due date
2. Create quotes — same as invoices but type="quote"
3. Save clients — name, email, phone, address, company
4. Add materials/services to price list — name, unit, price
5. Look up saved clients or materials from the lists above
6. Check outstanding invoices
7. Convert quotes to invoices
8. General business advice for ${industry} businesses in South Africa
 
RESPONSE RULES:
- Be concise, friendly, practical. Under 100 words unless outputting a document.
- Always use South African context (Rand, 15% VAT, SA addresses).
- When creating an invoice/quote: gather ALL required info first. Ask ONE question at a time if info is missing.
- Required fields: client name, at least one line item (description + qty + unit price), due date.
- When you have all info, output the document using EXACTLY this format:
 
[DOCUMENT type="invoice"]
client: Client Name
clientEmail: email@domain.com
clientPhone: 082 000 0000
date: ${new Date().toLocaleDateString('en-ZA')}
dueDate: DD/MM/YYYY
items:
  - description: Labour | qty: 2 | unitPrice: 500 | total: 1000
  - description: Materials | qty: 1 | unitPrice: 300 | total: 300
subtotal: 1300
vat: 195
discount: 0
total: 1495
notes: Payment due within 30 days.
[/DOCUMENT]
 
[ACTIONS]
Save & Send|primary
Save as Draft|secondary
Edit|secondary
[/ACTIONS]
 
- For saving a client:
[CLIENT]
name: Full Name
email: email@domain.com
phone: 082 000 0000
address: 12 Street, City, Province, 0001
company: Company Name
[/CLIENT]
 
[ACTIONS]
Save Client|primary
Cancel|secondary
[/ACTIONS]
 
- For adding a material/service:
[MATERIAL]
name: Item name
price: 100
unit: hour
category: labour
[/MATERIAL]
 
[ACTIONS]
Add to Price List|primary
[/ACTIONS]
 
- Use type="quote" for quotes, type="invoice" for invoices.
- Only use client details from the SAVED CLIENTS list above, or details the user provides.
- Never invent client info, prices, or document numbers.
- Document numbers are assigned by the system — never include them in [DOCUMENT] blocks.`;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// Firestore: write document record under users/{uid}/{folder}/{docNumber}
// ─────────────────────────────────────────────────────────────────────────────
async function saveDocumentRecord(env: Env, uid: string, folder: string, docNumber: string, data: Record<string, any>): Promise<void> {
	const projectId = env.FIREBASE_PROJECT_ID;
	const firestoreUrl =
		`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents` + `/solidflo/users/${uid}/${folder}/${docNumber}`;

	// Convert plain object → Firestore field map
	const fields: Record<string, any> = {};
	for (const [k, v] of Object.entries(data)) {
		if (v === null || v === undefined) continue;
		if (typeof v === 'string') fields[k] = { stringValue: v };
		if (typeof v === 'number') fields[k] = { doubleValue: v };
		if (typeof v === 'boolean') fields[k] = { booleanValue: v };
	}

	const token = await getFirebaseToken(env); // reuse your existing helper

	const res = await fetch(firestoreUrl, {
		method: 'PATCH', // upsert
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ fields }),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Firestore write failed: ${text}`);
	}
}
async function handleSaveGatewayCredentials(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // ── Auth (same pattern as all your other handlers) ────────────────
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

    // ── Parse body ────────────────────────────────────────────────────
    const { gatewayId, fields } = await request.json() as {
      gatewayId: string;
      fields: Record<string, any>;
    };

    if (!gatewayId || !fields) {
      return Response.json(
        { error: 'Missing gatewayId or fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Sensitive fields to encrypt ───────────────────────────────────
    const SENSITIVE = [
      'merchant_key',
      'passphrase',
      'secret_key',
      'client_secret',
      'webhook_secret',
    ];

    const encryptedFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'string' && value && SENSITIVE.includes(key)) {
        encryptedFields[key] = await encryptValue(value, env.CREDENTIAL_ENCRYPTION_KEY);
      } else {
        encryptedFields[key] = value;
      }
    }

    // ── Build Firestore field map ──────────────────────────────────────
    const innerFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(encryptedFields)) {
      if (typeof value === 'boolean') {
        innerFields[key] = { booleanValue: value };
      } else if (typeof value === 'number') {
        innerFields[key] = { integerValue: value };
      } else {
        innerFields[key] = { stringValue: String(value) };
      }
    }

    // ── Save to Firestore (reuses your existing getFirebaseToken) ─────
    const projectId = env.FIREBASE_PROJECT_ID;
    const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}/settings/paymentGateways`;

    const token = await getFirebaseToken(env); // ← your existing helper

    const body = {
      fields: {
        [gatewayId]: {
          mapValue: { fields: innerFields }
        }
      }
    };

    const fieldPaths = Object.keys(innerFields)
      .map(k => `fields.${gatewayId}.mapValue.fields.${k}`)
      .join('&updateMask.fieldPaths=');

    const fsRes = await fetch(`${docUrl}?updateMask.fieldPaths=${fieldPaths}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!fsRes.ok) {
      const err = await fsRes.text();
      throw new Error(`Firestore write failed: ${err}`);
    }

    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );

  } catch (err: any) {
    console.error('save-gateway-credentials error:', err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}


// ─── AES-256-CBC encrypt using Web Crypto (built into CF Workers) ─────────────
async function encryptValue(plainText: string, base64Key: string): Promise<string> {
  const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encoded = new TextEncoder().encode(plainText);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    encoded
  );

  const ivHex        = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const encryptedHex = Array.from(new Uint8Array(encrypted))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return `${ivHex}:${encryptedHex}`;
}


// ─── AES-256-CBC decrypt (used when building PayFast URLs server-side) ────────
async function decryptValue(encryptedString: string, base64Key: string): Promise<string> {
  const [ivHex, encryptedHex] = encryptedString.split(':');
  const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encrypted = new Uint8Array(encryptedHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}
// ─────────────────────────────────────────────────────────────────────────────
// HTML TEMPLATES — one per doc type
// All styles are inlined so Puppeteer has no external deps to fetch.
// ─────────────────────────────────────────────────────────────────────────────
function buildDocumentHTML(docType: string, docNumber: string, data: Record<string, any>): string {
	switch (docType) {
		case 'invoice':
			return buildInvoiceHTML(docNumber, data);
		case 'quote':
			return buildQuoteHTML(docNumber, data);
		case 'purchase_order':
			return buildPurchaseOrderHTML(docNumber, data);
		case 'sick_note':
			return buildSickNoteHTML(docNumber, data);
		case 'jobcard':
			return buildJobcardHTML(docNumber, data);
		case 'waybill':
			return buildWaybillHTML(docNumber, data);
		default:
			return `<html><body><h1>Unknown docType</h1></body></html>`;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmtCurrency(n: number): string {
	return 'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string): string {
	return d ? new Date(d).toLocaleDateString('en-ZA') : new Date().toLocaleDateString('en-ZA');
}

// ── Shared CSS — amber/carpentry theme matching ProfessionalTemplate ──────────
// Uses the same amber-600 (#d97706), amber-50 (#fffbeb), amber-800 (#92400e)
// colour palette as the React component so the PDF looks identical to the preview.
const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a;
         padding: 5mm 10mm; background: #fff; }

  /* ── Header bar ── */
  .top-bar { display: flex; justify-content: space-between; align-items: flex-start;
             border-bottom: 2px solid #d97706; padding-bottom: 14px; margin-bottom: 14px; }
  .logo { width: 56px; height: 56px; object-fit: contain; }
  .logo-placeholder { width: 48px; height: 48px; background: #fef3c7; border-radius: 4px;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 22px; }
  .company-name { font-size: 18px; font-weight: 700; color: #b45309; }
  .company-tagline { font-size: 11px; font-weight: 600; color: #6b7280; margin-top: 2px; }
  .company-sub { font-size: 10px; color: #6b7280; margin-top: 6px; line-height: 1.7; }
  .doc-title { font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 10px; }
  .meta-row { display: flex; justify-content: space-between; gap: 24px;
              font-size: 10px; margin-bottom: 2px; }
  .meta-label { font-weight: 600; color: #6b7280; }
  .meta-val   { color: #92400e; }

  /* ── Info cards (client + project) ── */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .info-card { background: #fffbeb; padding: 12px; border-radius: 4px; }
  .info-card-title { font-size: 10px; font-weight: 700; color: #92400e;
                     text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .info-card p { font-size: 10px; color: #374151; line-height: 1.8; }
  .info-card .name { font-weight: 600; }
  .info-row { display: flex; justify-content: space-between; font-size: 10px;
              color: #374151; margin-top: 4px; }
  .info-row span:first-child { font-weight: 600; }

  /* ── Items table ── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10px; }
  thead tr { background: #d97706; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 700; color: #92400e; }
  thead th.center { text-align: center; }
  thead th.right  { text-align: right; }
  tbody tr { border-bottom: 1px solid #e5e7eb; }
  tbody td { padding: 8px 10px; color: #1a1a1a; }
  tbody td.center { text-align: center; }
  tbody td.right  { text-align: right; font-weight: 600; }

  /* ── Totals ── */
  .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 14px; }
  .totals { width: 220px; font-size: 11px; }
  .totals tr td { padding: 3px 0; }
  .totals tr td:last-child { text-align: right; }
  .totals .grand td { font-weight: 700; font-size: 12px;
                      border-top: 2px solid #d97706; padding-top: 6px; }

  /* ── Banking / payment / guarantee strip ── */
  .bottom-strip { display: grid; grid-template-columns: 1fr 1fr 1fr;
                  gap: 12px; margin-top: 12px; }
  .strip-card { background: #fffbeb; padding: 10px; border-radius: 4px; }
  .strip-title { font-size: 9px; font-weight: 700; color: #92400e;
                 text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
  .strip-body  { font-size: 9px; color: #374151; line-height: 1.8; }

  /* ── Stamp ── */
  .stamp-wrap { display: flex; justify-content: flex-end; margin-top: 6px; }
  .stamp { display: inline-block; padding: 4px 14px; border-radius: 4px;
           font-size: 16px; font-weight: 700; letter-spacing: 2px;
           transform: rotate(-8deg); opacity: 0.75; }

  /* ── Notes / terms ── */
  .notes { padding: 10px 12px; background: #fffbeb; border-left: 4px solid #d97706;
           border-radius: 2px; font-size: 10px; color: #6b7280; margin-top: 12px; }

  /* ── Signature area (job card) ── */
  .sig-row { display: flex; justify-content: space-between; margin-top: 32px; }
  .sig-line { border-top: 1px solid #374151; width: 170px;
              padding-top: 4px; font-size: 9px; color: #6b7280; }

  /* ── Footer ── */
  .footer { margin-top: 28px; text-align: center; font-size: 9px; color: #9ca3af; }

  /* ── Non-invoice shared ── */
  .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 16px; }
  .field { display: flex; flex-direction: column; }
  .field label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;
                 color: #9ca3af; margin-bottom: 2px; }
  .field span { font-size: 11px; }
`;

// ── Shell used by invoice + quote (full amber header) ─────────────────────────
function carpentryShell(docType: string, docNumber: string, d: Record<string, any>, body: string): string {
	const isInvoice = docType === 'invoice';
	const label = isInvoice ? 'INVOICE' : 'QUOTE';
	const numLabel = isInvoice ? 'Invoice No.' : 'Quote No.';
	const numVal = isInvoice ? `Inv-${docNumber}` : `QT-${docNumber}`;
	const b = d.businessInfo ?? d.company ?? {};
	const logoHtml = b.logoUrl ? `<img class="logo" src="${b.logoUrl}" alt="logo"/>` : `<div class="logo-placeholder">🪵</div>`;

	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>${BASE_CSS}</style></head><body>

<div class="top-bar">
  <div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      ${logoHtml}
      <div>
        <div class="company-name">${b.businessName ?? b.companyName ?? b.name ?? ''}</div>
        <div class="company-tagline">Professional Carpentry Services</div>
      </div>
    </div>
    <div class="company-sub">
      ${b.addressLine1 ?? b.address ?? ''}<br/>
      ${b.addressLine2 ? b.addressLine2 + '<br/>' : ''}
      ${b.city ?? ''} ${b.postalCode ?? ''}<br/>
      Tel: ${b.primaryPhone ?? b.phone ?? ''}${b.secondaryPhone ? ' | ' + b.secondaryPhone : ''}<br/>
      ${b.registrationNumber ? 'Reg: ' + b.registrationNumber + '<br/>' : ''}
      ${b.vatNumber ? 'VAT: ' + b.vatNumber : ''}
    </div>
  </div>

  <div style="text-align:right">
    <div class="doc-title">${label}</div>
    <div class="meta-row"><span class="meta-label">${numLabel}</span><span class="meta-val">${numVal}</span></div>
    <div class="meta-row"><span class="meta-label">Date</span><span class="meta-val">${fmtDate(d.date)}</span></div>
    ${d.woodType ? `<div class="meta-row"><span class="meta-label">Wood Type</span><span class="meta-val">${d.woodType}</span></div>` : ''}
    ${d.finishType ? `<div class="meta-row"><span class="meta-label">Finish</span><span class="meta-val">${d.finishType}</span></div>` : ''}
    ${isInvoice && d.dueDate ? `<div class="meta-row"><span class="meta-label">Due</span><span class="meta-val">${fmtDate(d.dueDate)}</span></div>` : ''}
    ${!isInvoice && d.validUntil ? `<div class="meta-row"><span class="meta-label">Valid until</span><span class="meta-val">${fmtDate(d.validUntil)}</span></div>` : ''}
  </div>
</div>

${body}
</body></html>`;
}

// ── Items table matching ProfessionalTemplate columns ─────────────────────────
// item fields: description, workCategory | type, qty, rate, amount
// Falls back to unitPrice if rate/amount not pre-calculated.
function carpentryItemsTable(items: any[]): string {
	const rows = items
		.map((item: any) => {
			const rate = item.rate ?? item.unitPrice ?? 0;
			const qty = item.qty ?? 1;
			const amount = item.amount ?? rate * qty;
			return `<tr>
      <td>${item.description ?? ''}</td>
      <td class="center">${item.workCategory ?? item.type ?? 'Custom Work'}</td>
      <td class="center">${qty}</td>
      <td class="right">R ${Number(rate).toFixed(2)}</td>
      <td class="right">R ${Number(amount).toFixed(2)}</td>
    </tr>`;
		})
		.join('');
	return `<table>
    <thead><tr>
      <th>Description</th>
      <th class="center">Category</th>
      <th class="center">Qty</th>
      <th class="right">Rate</th>
      <th class="right">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// Totals block — accepts pre-calculated subtotal/vat/total OR recalculates from items
function carpentryTotals(d: Record<string, any>): string {
	const items = d.items ?? d.lineItems ?? [];
	const subtotal =
		d.subtotal ??
		items.reduce((s: number, i: any) => {
			const rate = i.rate ?? i.unitPrice ?? 0;
			return s + (i.amount ?? rate * (i.qty ?? 1));
		}, 0);
	const vatAmt = d.vat ?? subtotal * ((d.taxRate ?? 0) / 100);
	const total = d.total ?? subtotal + vatAmt;
	return `<div class="totals-wrap"><table class="totals">
    <tr><td>Subtotal</td><td>${fmtCurrency(subtotal)}</td></tr>
    ${vatAmt > 0 ? `<tr><td>VAT (${d.taxRate ?? ''}%)</td><td>${fmtCurrency(vatAmt)}</td></tr>` : ''}
    <tr class="grand"><td>Total</td><td>${fmtCurrency(total)}</td></tr>
  </table></div>`;
}

// Banking / payment / guarantee strip shown at the bottom of invoice + quote
function bottomStrip(d: Record<string, any>): string {
	const b = d.businessInfo ?? d.company ?? {};
	const banking = b.banking ?? {};
	return `<div class="bottom-strip">
    <div class="strip-card">
      <div class="strip-title">Banking Details</div>
      <div class="strip-body">
        ${banking.bankName ? `Bank: ${banking.bankName}<br/>` : ''}
        ${banking.accountName ? `Name: ${banking.accountName}<br/>` : ''}
        ${banking.accountNumber ? `Acc: ${banking.accountNumber}<br/>` : ''}
        ${banking.branchCode ? `Branch: ${banking.branchCode}` : ''}
      </div>
    </div>
    <div class="strip-card">
      <div class="strip-title">Payment</div>
      <div class="strip-body">
        Method: ${d.paymentMethod ?? 'Bank Transfer/EFT'}<br/>
        Terms: ${d.paymentTerms ?? '50% Deposit, Balance on Completion'}
      </div>
    </div>
    <div class="strip-card">
      <div class="strip-title">Service Guarantee</div>
      <div class="strip-body">${d.serviceGuarantee ?? '12 Months Craftsmanship Warranty'}</div>
    </div>
  </div>`;
}

// ── INVOICE ───────────────────────────────────────────────────────────────────
// data mirrors ProfessionalTemplate props:
//   businessInfo, customerName, customerCompany, customerEmail, customerPhone,
//   customerAddress, projectName, projectAddress, projectType, projectSize,
//   woodType, finishType, items, subtotal, vat, total, taxRate,
//   paymentMethod, paymentTerms, serviceGuarantee,
//   showStamp, stampText, stampColor, showStampDate, date, dueDate, notes
function buildInvoiceHTML(docNumber: string, d: Record<string, any>): string {
	const items = d.items ?? d.lineItems ?? [];
	const body = `
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-title">Client Details</div>
        <p>
          <span class="name">${d.customerName ?? ''}</span><br/>
          ${d.customerCompany && d.customerCompany !== d.customerName ? d.customerCompany + '<br/>' : ''}
          ${d.customerAddress ? d.customerAddress + '<br/>' : ''}
          ${d.customerEmail ? d.customerEmail + '<br/>' : ''}
          ${d.customerPhone ?? ''}
        </p>
      </div>
      <div class="info-card">
        <div class="info-card-title">Project Information</div>
        <p>
          <span class="name">${d.projectName ?? ''}</span><br/>
          ${d.projectAddress ? d.projectAddress + '<br/>' : ''}
        </p>
        <div class="info-row"><span>Type:</span><span>${d.projectType ?? 'Custom Carpentry'}</span></div>
        <div class="info-row"><span>Units:</span><span>${d.projectSize ?? 'N/A'} pieces</span></div>
        <div class="info-row"><span>Payment Terms:</span><span>${d.paymentTerms ?? '50% Deposit, Balance on Completion'}</span></div>
      </div>
    </div>

    ${carpentryItemsTable(items)}
    ${carpentryTotals(d)}

    ${
			d.showStamp
				? `<div class="stamp-wrap">
      <div class="stamp" style="border:3px solid ${d.stampColor ?? '#92400e'};color:${d.stampColor ?? '#92400e'}">
        ${d.stampText ?? 'APPROVED'}${d.showStampDate !== false ? '<br/><span style="font-size:9px">' + fmtDate(d.date) + '</span>' : ''}
      </div>
    </div>`
				: ''
		}

    ${bottomStrip(d)}
    ${d.notes ? `<div class="notes"><strong>Notes:</strong> ${d.notes}</div>` : ''}
    <div class="footer">Thank you for your business — ${(d.businessInfo ?? d.company ?? {}).businessName ?? ''}</div>`;
	return carpentryShell('invoice', docNumber, d, body);
}

// ── QUOTE ─────────────────────────────────────────────────────────────────────
// Same props as invoice — documentType="quote" in ProfessionalTemplate.
function buildQuoteHTML(docNumber: string, d: Record<string, any>): string {
	const items = d.items ?? d.lineItems ?? [];
	const body = `
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-title">Prepared For</div>
        <p>
          <span class="name">${d.customerName ?? ''}</span><br/>
          ${d.customerCompany && d.customerCompany !== d.customerName ? d.customerCompany + '<br/>' : ''}
          ${d.customerAddress ? d.customerAddress + '<br/>' : ''}
          ${d.customerEmail ? d.customerEmail + '<br/>' : ''}
          ${d.customerPhone ?? ''}
        </p>
      </div>
      <div class="info-card">
        <div class="info-card-title">Project Information</div>
        <p>
          <span class="name">${d.projectName ?? ''}</span><br/>
          ${d.projectAddress ? d.projectAddress + '<br/>' : ''}
        </p>
        <div class="info-row"><span>Type:</span><span>${d.projectType ?? 'Custom Carpentry'}</span></div>
        <div class="info-row"><span>Units:</span><span>${d.projectSize ?? 'N/A'} pieces</span></div>
        <div class="info-row"><span>Payment Terms:</span><span>${d.paymentTerms ?? '50% Deposit, Balance on Completion'}</span></div>
      </div>
    </div>

    ${carpentryItemsTable(items)}
    ${carpentryTotals(d)}
    ${bottomStrip(d)}
    ${d.notes ? `<div class="notes"><strong>Terms &amp; Conditions:</strong> ${d.notes}</div>` : ''}
    <div class="footer">This quote is valid for 30 days from date of issue — ${(d.businessInfo ?? d.company ?? {}).businessName ?? ''}</div>`;
	return carpentryShell('quote', docNumber, d, body);
}

// ── PURCHASE ORDER ────────────────────────────────────────────────────────────
// data: { company, supplier, lineItems, taxRate, date, deliveryDate, deliveryAddress, notes }
// ── PURCHASE ORDER ────────────────────────────────────────────────────────────
// data: { businessInfo|company, supplier, items|lineItems, taxRate, date, deliveryDate, deliveryAddress, notes }
function buildPurchaseOrderHTML(docNumber: string, d: Record<string, any>): string {
	const b = d.businessInfo ?? d.company ?? {};
	const items = d.items ?? d.lineItems ?? [];
	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>${BASE_CSS}
  .po-header { border-bottom: 2px solid #6e4c1a; padding-bottom: 14px; margin-bottom: 14px; }
  .po-badge  { font-size:22px; font-weight:700; color:#6e4c1a; }
  thead tr   { background:#6e4c1a !important; }
  .totals .grand td { border-top-color:#6e4c1a !important; }
</style></head><body>
<div class="top-bar po-header">
  <div>
    <div class="company-name">${b.businessName ?? b.companyName ?? b.name ?? ''}</div>
    <div class="company-sub">${b.addressLine1 ?? b.address ?? ''}<br/>
    Tel: ${b.primaryPhone ?? b.phone ?? ''}</div>
  </div>
  <div style="text-align:right">
    <div class="po-badge">PURCHASE ORDER</div>
    <div class="meta-row" style="margin-top:8px"><span class="meta-label">PO No.</span><span class="meta-val">PO-${docNumber}</span></div>
    <div class="meta-row"><span class="meta-label">Date</span><span class="meta-val">${fmtDate(d.date)}</span></div>
    ${d.deliveryDate ? `<div class="meta-row"><span class="meta-label">Delivery by</span><span class="meta-val">${fmtDate(d.deliveryDate)}</span></div>` : ''}
  </div>
</div>
<div class="info-grid">
  <div class="info-card">
    <div class="info-card-title">Supplier</div>
    <p><span class="name">${d.supplier?.name ?? ''}</span><br/>
    ${d.supplier?.address ?? ''}<br/>${d.supplier?.email ?? ''}</p>
  </div>
  <div class="info-card">
    <div class="info-card-title">Delivery Address</div>
    <p>${d.deliveryAddress ?? b.addressLine1 ?? b.address ?? ''}</p>
  </div>
</div>
${carpentryItemsTable(items)}
${carpentryTotals(d)}
${d.notes ? `<div class="notes"><strong>Notes:</strong> ${d.notes}</div>` : ''}
<div class="footer">${b.businessName ?? b.name ?? ''} — Authorised Purchase Order</div>
</body></html>`;
}

// ── SICK NOTE ─────────────────────────────────────────────────────────────────
// data: { doctor, patient, fromDate, toDate, diagnosis, date, notes }
function buildSickNoteHTML(docNumber: string, d: Record<string, any>): string {
	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>${BASE_CSS}
  .sn-header { border-bottom: 2px solid #5b2c6f; padding-bottom: 14px; margin-bottom: 14px; }
  .sn-badge  { font-size:22px; font-weight:700; color:#5b2c6f; }
  .cert-text { font-size:11px; line-height:1.9; margin-bottom:16px; }
  .stamp-sn  { display:inline-block; border:3px solid #c00; color:#c00;
               padding:4px 14px; border-radius:4px; font-size:16px; font-weight:700;
               letter-spacing:2px; transform:rotate(-8deg); opacity:0.75; }
</style></head><body>
<div class="top-bar sn-header">
  <div>
    <div class="company-name">${d.doctor?.name ?? 'Medical Practice'}</div>
    <div class="company-sub">${d.doctor?.address ?? ''}<br/>
    Tel: ${d.doctor?.phone ?? ''} | Practice no: ${d.doctor?.practiceNumber ?? ''}</div>
  </div>
  <div style="text-align:right">
    <div class="sn-badge">SICK NOTE</div>
    <div class="meta-row" style="margin-top:8px"><span class="meta-label">Ref</span><span class="meta-val">SN-${docNumber}</span></div>
    <div class="meta-row"><span class="meta-label">Date issued</span><span class="meta-val">${fmtDate(d.date)}</span></div>
  </div>
</div>
<div class="field-grid">
  <div class="field"><label>Patient name</label><span>${d.patient?.name ?? ''}</span></div>
  <div class="field"><label>ID / Passport</label><span>${d.patient?.idNumber ?? ''}</span></div>
  <div class="field"><label>Date of birth</label><span>${fmtDate(d.patient?.dob)}</span></div>
  <div class="field"><label>Employer</label><span>${d.patient?.employer ?? ''}</span></div>
  <div class="field"><label>Unfit from</label><span>${fmtDate(d.fromDate)}</span></div>
  <div class="field"><label>Unfit until</label><span>${fmtDate(d.toDate)}</span></div>
</div>
<div class="field" style="margin-bottom:14px">
  <label>Diagnosis / Reason</label>
  <span style="font-size:12px">${d.diagnosis ?? ''}</span>
</div>
<p class="cert-text">
  This is to certify that the above-named patient was examined and found medically unfit for duty
  from <strong>${fmtDate(d.fromDate)}</strong> to <strong>${fmtDate(d.toDate)}</strong> inclusive.
</p>
${d.notes ? `<div class="notes">${d.notes}</div>` : ''}
<div style="margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end">
  <div class="sig-line" style="width:200px">Signature of attending doctor</div>
  <div><div class="stamp-sn">ORIGINAL</div></div>
</div>
<div class="footer">${d.doctor?.name ?? ''} — ${d.doctor?.address ?? ''}</div>
</body></html>`;
}

// ── JOB CARD ──────────────────────────────────────────────────────────────────
// data: { businessInfo|company, customerName, customerCompany, customerPhone, customerEmail,
//         customerAddress, projectName, projectAddress, projectType, projectSize,
//         woodType, finishType, items|lineItems, subtotal, vat, total, taxRate,
//         technician, status, complaint, paymentMethod, paymentTerms,
//         serviceGuarantee, showStamp, stampText, stampColor, date, notes }
function buildJobcardHTML(docNumber: string, d: Record<string, any>): string {
	const items = d.items ?? d.lineItems ?? [];
	const b = d.businessInfo ?? d.company ?? {};
	const body = `
    <div class="info-grid" style="grid-template-columns:1fr 1fr 1fr">
      <div class="info-card">
        <div class="info-card-title">Customer</div>
        <p>
          <span class="name">${d.customerName ?? ''}</span><br/>
          ${d.customerCompany && d.customerCompany !== d.customerName ? d.customerCompany + '<br/>' : ''}
          ${d.customerPhone ? 'Tel: ' + d.customerPhone + '<br/>' : ''}
          ${d.customerEmail ?? ''}
        </p>
      </div>
      <div class="info-card">
        <div class="info-card-title">Project</div>
        <p>
          <span class="name">${d.projectName ?? ''}</span><br/>
          ${d.projectAddress ? d.projectAddress + '<br/>' : ''}
        </p>
        <div class="info-row"><span>Type:</span><span>${d.projectType ?? 'Custom Carpentry'}</span></div>
        <div class="info-row"><span>Units:</span><span>${d.projectSize ?? 'N/A'} pieces</span></div>
      </div>
      <div class="info-card">
        <div class="info-card-title">Details</div>
        <div class="info-row"><span>Technician:</span><span>${d.technician ?? ''}</span></div>
        <div class="info-row"><span>Status:</span><span>${d.status ?? 'Open'}</span></div>
        <div class="info-row"><span>Wood:</span><span>${d.woodType ?? ''}</span></div>
        <div class="info-row"><span>Finish:</span><span>${d.finishType ?? ''}</span></div>
      </div>
    </div>

    ${d.complaint ? `<div class="notes" style="margin-bottom:12px"><strong>Customer complaint / description:</strong> ${d.complaint}</div>` : ''}

    ${carpentryItemsTable(items)}
    ${carpentryTotals(d)}

    ${
			d.showStamp
				? `<div class="stamp-wrap">
      <div class="stamp" style="border:3px solid ${d.stampColor ?? '#92400e'};color:${d.stampColor ?? '#92400e'}">
        ${d.stampText ?? 'APPROVED'}${d.showStampDate !== false ? '<br/><span style="font-size:9px">' + fmtDate(d.date) + '</span>' : ''}
      </div>
    </div>`
				: ''
		}

    ${bottomStrip(d)}
    ${d.notes ? `<div class="notes"><strong>Workshop notes:</strong> ${d.notes}</div>` : ''}

    <div class="sig-row">
      <div class="sig-line">Customer signature &amp; date</div>
      <div class="sig-line">Technician signature &amp; date</div>
    </div>
    <div class="footer">JC-${docNumber} — ${b.businessName ?? b.name ?? ''}</div>`;
	return carpentryShell('jobcard', docNumber, d, body);
}

// ── WAYBILL ───────────────────────────────────────────────────────────────────
// data: { businessInfo|company, sender, receiver, items, date, driver, vehicleReg, instructions, notes }
function buildWaybillHTML(docNumber: string, d: Record<string, any>): string {
	const b = d.businessInfo ?? d.company ?? {};
	const itemRows = (d.items ?? [])
		.map(
			(item: any) => `
    <tr>
      <td>${item.description ?? ''}</td>
      <td class="center">${item.qty ?? 1}</td>
      <td class="center">${item.weight ?? ''}</td>
      <td>${item.dimensions ?? ''}</td>
    </tr>`,
		)
		.join('');

	return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>${BASE_CSS}
  .wb-header { border-bottom:2px solid #145a32; padding-bottom:14px; margin-bottom:14px; }
  .wb-badge  { font-size:22px; font-weight:700; color:#145a32; }
  thead tr   { background:#145a32 !important; }
</style></head><body>
<div class="top-bar wb-header">
  <div>
    <div class="company-name">${b.businessName ?? b.companyName ?? b.name ?? ''}</div>
    <div class="company-sub">${b.addressLine1 ?? b.address ?? ''}<br/>Tel: ${b.primaryPhone ?? b.phone ?? ''}</div>
  </div>
  <div style="text-align:right">
    <div class="wb-badge">WAYBILL</div>
    <div class="meta-row" style="margin-top:8px"><span class="meta-label">WB No.</span><span class="meta-val">WB-${docNumber}</span></div>
    <div class="meta-row"><span class="meta-label">Date</span><span class="meta-val">${fmtDate(d.date)}</span></div>
  </div>
</div>
<div class="info-grid" style="grid-template-columns:1fr 1fr 1fr">
  <div class="info-card">
    <div class="info-card-title">Sender</div>
    <p><span class="name">${d.sender?.name ?? ''}</span><br/>
    ${d.sender?.address ?? ''}<br/>${d.sender?.phone ?? ''}</p>
  </div>
  <div class="info-card">
    <div class="info-card-title">Receiver</div>
    <p><span class="name">${d.receiver?.name ?? ''}</span><br/>
    ${d.receiver?.address ?? ''}<br/>${d.receiver?.phone ?? ''}</p>
  </div>
  <div class="info-card">
    <div class="info-card-title">Driver / Vehicle</div>
    <p>${d.driver ?? ''}<br/>Reg: ${d.vehicleReg ?? ''}</p>
  </div>
</div>
<table>
  <thead><tr>
    <th>Description</th>
    <th class="center">Qty</th>
    <th class="center">Weight (kg)</th>
    <th>Dimensions</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
${d.instructions ? `<div class="notes"><strong>Delivery instructions:</strong> ${d.instructions}</div>` : ''}
${d.notes ? `<div class="notes" style="margin-top:8px"><strong>Notes:</strong> ${d.notes}</div>` : ''}
<div class="sig-row" style="margin-top:32px">
  <div class="sig-line">Sender signature &amp; date</div>
  <div class="sig-line">Receiver signature &amp; date</div>
  <div class="sig-line">Driver signature &amp; date</div>
</div>
<div class="footer">WB-${docNumber} — ${b.businessName ?? b.name ?? ''}</div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING HANDLERS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

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
		const fileName = `solidflo/logos/${userId}/${timestamp}.${extension}`;
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
		const originalName = request.headers.get('X-File-Name') ?? `${Date.now()}.pdf`;
		const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		const fileBuffer = await request.arrayBuffer();
// AFTER — parse folder from the filename prefix if possible, else fall back:
const folderMap: Record<string, string> = {
  Inv: 'invoices', QT: 'quotes', PO: 'purchase_orders',
  SN: 'sick_notes', JC: 'jobcards', WB: 'waybills',
  
  
};
const prefix = safeName.split('-')[0];
const folder = folderMap[prefix] ?? 'documents';
const key = `solidflo/users/${userId}/${folder}/${safeName}`;
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

async function handleCleanupExpired(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const authHeader = request.headers.get('Authorization');
	if (authHeader !== `Bearer ${env.CLEANUP_SECRET}`) {
		return new Response('Unauthorized', { status: 401, headers: corsHeaders });
	}
	try {
		const projectId = env.FIREBASE_PROJECT_ID;
		const now = new Date().toISOString();
		const queryRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${await getFirebaseToken(env)}`,
			},
			body: JSON.stringify({
				structuredQuery: {
					from: [{ collectionId: 'solidfloServiceProviders' }],
					where: {
						compositeFilter: {
							op: 'AND',
							filters: [
								{ fieldFilter: { field: { fieldPath: 'active' }, op: 'EQUAL', value: { booleanValue: true } } },
								{ fieldFilter: { field: { fieldPath: 'expiresAt' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: now } } },
							],
						},
					},
				},
			}),
		});
		const results = (await queryRes.json()) as any[];
		const expiredDocs = results.filter((r: any) => r.document);
		if (expiredDocs.length === 0) {
			return new Response(JSON.stringify({ message: 'No expired listings found.' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json', ...corsHeaders },
			});
		}
		const token = await getFirebaseToken(env);
		const patchJobs = expiredDocs.map((r: any) => {
			const docName = r.document.name;
			return fetch(`https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=active`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ fields: { active: { booleanValue: false } } }),
			});
		});
		await Promise.all(patchJobs);
		return new Response(JSON.stringify({ message: `Deactivated ${expiredDocs.length} expired listings.` }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('Cleanup error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}

async function handleListingImageUpload(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
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
		if (!contentType.startsWith('image/')) {
			return new Response('Only image files are allowed', { status: 415, headers: corsHeaders });
		}
		const fileBuffer = await request.arrayBuffer();
		const timestamp = Date.now();
		const extension = contentType.split('/')[1] || 'jpg';
		const fileName = `solidflo/listings/${userId}/${timestamp}.${extension}`;
		await env.LOGOS_BUCKET.put(fileName, fileBuffer, { httpMetadata: { contentType } });
		const publicUrl = `https://${env.R2_PUBLIC_DOMAIN}/${fileName}`;
		return new Response(JSON.stringify({ publicUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('Listing image upload error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}
async function handleMenuItemImageUpload(
	request: Request,
	env: Env,
	corsHeaders: Record<string, string>,
): Promise<Response> {
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
		if (!contentType.startsWith('image/')) {
			return new Response('Only image files are allowed', { status: 415, headers: corsHeaders });
		}
		const fileBuffer = await request.arrayBuffer();
		const timestamp = Date.now();
		const extension = contentType.split('/')[1] || 'jpg';
		const fileName = `solidflo/menu-items/${userId}/${timestamp}.${extension}`;
		await env.LOGOS_BUCKET.put(fileName, fileBuffer, { httpMetadata: { contentType } });
		const publicUrl = `https://${env.R2_PUBLIC_DOMAIN}/${fileName}`;
		return new Response(JSON.stringify({ publicUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	} catch (err: any) {
		console.error('Menu item image upload error:', err);
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json', ...corsHeaders },
		});
	}
}
async function getFirebaseToken(env: Env): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		iss: env.FIREBASE_CLIENT_EMAIL,
		sub: env.FIREBASE_CLIENT_EMAIL,
		aud: 'https://oauth2.googleapis.com/token',
		iat: now,
		exp: now + 3600,
		scope: 'https://www.googleapis.com/auth/datastore',
	};
	const key = await crypto.subtle.importKey(
		'pkcs8',
		strToArrayBuffer(atob(env.FIREBASE_PRIVATE_KEY_B64)),
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const body = btoa(JSON.stringify(payload));
	const signing = `${header}.${body}`;
	const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signing));
	const jwt = `${signing}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
	const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
	});
	const tokenData = (await tokenRes.json()) as any;
	return tokenData.access_token;
}

function strToArrayBuffer(str: string): ArrayBuffer {
	const buf = new ArrayBuffer(str.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);
	return buf;
}

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
