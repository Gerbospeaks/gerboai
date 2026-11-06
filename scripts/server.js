/**
 * scripts/server.js
 * ─────────────────────────────────────────────────────────────────
 * Local admin-only Express server.
 * Exposes seed endpoints that the AdminDashboard.jsx calls.
 *
 * USAGE:
 *   node scripts/server.js
 *
 * REQUIRES:
 *   npm install express cors firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS set to your service account JSON
 * ─────────────────────────────────────────────────────────────────
 */

import express    from "express";
import cors       from "cors";
import admin      from "firebase-admin";
import { fileURLToPath } from "url";
import { createAccountsFromEmails } from "./emailAccountCreator.js";
import { seedListings }             from "./seedListings.js";

// ── Init Firebase Admin ───────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db   = admin.firestore();
const auth = admin.auth();

// ── Express setup ─────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" })); // ← your Vite dev URL
app.use(express.json());

// ── Middleware: verify Firebase ID token + Firestore isAdmin ──────
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const idToken    = authHeader.replace("Bearer ", "").trim();

  if (!idToken) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const userDoc = await db.doc(`users/${decoded.uid}`).get();

    if (!userDoc.exists || userDoc.data()?.isAdmin !== true) {
      return res.status(403).json({ error: "Forbidden — not an admin." });
    }

    req.adminUid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: `Invalid token: ${err.message}` });
  }
}

// ── Helper: capture console output and stream via SSE ─────────────
function buildLogger(res) {
  return (message) => {
    const line = typeof message === "string" ? message : JSON.stringify(message);
    res.write(`data: ${line}\n\n`);
  };
}

function sseStart(res) {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();
}
app.get("/", (_req, res) => {
  res.json({ 
    status: "GerboAI seed server running",
    endpoints: ["/ping", "/auto-seed", "/create-accounts", "/seed-listings"]
  });
});
// ── Route: health check ───────────────────────────────────────────
app.get("/ping", (_req, res) => res.json({ ok: true }));

// ── Route: seed listings only (pass existing UIDs) ────────────────
// POST /seed-listings  { ownerIds: string[], total: number }
app.post("/seed-listings", requireAdmin, async (req, res) => {
  sseStart(res);
  const log = buildLogger(res);

  const { ownerIds = [], total = 100 } = req.body;

  if (!ownerIds.length) {
    log("❌ No ownerIds provided.");
    return res.end();
  }

  const _log = console.log;
  console.log = log;

  try {
    await seedListings(ownerIds, total);
    log(`✅ Done — ${total} listings seeded.`);
  } catch (err) {
    log(`❌ Error: ${err.message}`);
  } finally {
    console.log = _log;
    res.end();
  }
});

// ── Route: create accounts + auto-seed listings ───────────────────
// POST /create-accounts  { emails: string[], total: number, password: string }
app.post("/create-accounts", requireAdmin, async (req, res) => {
  sseStart(res);
  const log = buildLogger(res);

  const {
    emails   = [],
    total    = 100,
    password = "TempPass@2025!",
  } = req.body;

  if (!emails.length) {
    log("❌ No emails provided.");
    return res.end();
  }

  const _log = console.log;
  console.log = log;

  try {
    await createAccountsFromEmails(emails, {
      defaultPassword:  password,
      sendVerification: false, // test accounts — skip email
    });
    log(`✅ Accounts created and listings seeded.`);
  } catch (err) {
    log(`❌ Error: ${err.message}`);
  } finally {
    console.log = _log;
    res.end();
  }
});

// ── Route: generate emails programmatically + seed ────────────────
// POST /auto-seed  { industries: string[], perIndustry: number, listingsTotal: number }
app.post("/auto-seed", requireAdmin, async (req, res) => {
  sseStart(res);
  const log = buildLogger(res);

  const {
    industries    = ["mechanic","plumber","electrician","cleaner","security","restaurant","clinic","lawyer","accountant","solar"],
    perIndustry   = 5,
    listingsTotal = 100,
    password      = "TempPass@2025!",
  } = req.body;

  const emails = industries.flatMap((industry) =>
    Array.from({ length: perIndustry }, (_, j) => ({
      email:       `${industry}${j + 1}@seed.dev`,
      displayName: `${industry} ${j + 1}`,
    }))
  );

  log(`📋 Generated ${emails.length} test emails across ${industries.length} industries.`);

  const _log = console.log;
  console.log = log;

  try {
    await createAccountsFromEmails(emails, {
      defaultPassword:  password,
      sendVerification: false,
    });
    log(`✅ Auto-seed complete — ${listingsTotal} listings created.`);
  } catch (err) {
    log(`❌ Error: ${err.message}`);
  } finally {
    console.log = _log;
    res.end();
  }
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Admin seed server running at http://localhost:${PORT}`);
  console.log(`   Waiting for requests from AdminDashboard...\n`);
});