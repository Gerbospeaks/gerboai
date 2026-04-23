/**
 * emailAccountCreator.js
 * ─────────────────────────────────────────────────────────────────
 * 1. Creates Firebase Auth accounts from your email list
 * 2. Sends verification links
 * 3. Automatically passes the created UIDs into seedListings()
 *    — no manual copy-pasting required.
 *
 * USAGE (standalone):
 *   node emailAccountCreator.js
 *
 * USAGE (imported into register.js):
 *   import { createAccountsFromEmails, createSingleAccount } from './emailAccountCreator';
 *
 * REQUIRES:
 *   npm install firebase-admin
 *   Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON
 * ─────────────────────────────────────────────────────────────────
 */

import admin from "firebase-admin";
import { seedListings } from "./seedListings.js";

// ── Init guard (safe to call multiple times) ──────────────────────
function getAdminApp() {
  if (admin.apps.length) return admin.apps[0];
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // OR: credential: admin.credential.cert(require('./serviceAccountKey.json')),
  });
}

// ─────────────────────────────────────────────────────────────────
// createSingleAccount
// Creates one Firebase Auth user and sends a verification link.
// Returns: { uid, email, alreadyExists }
// ─────────────────────────────────────────────────────────────────
export async function createSingleAccount(
  email,
  {
    defaultPassword = "TempPass@2025!",
    displayName = "",
    sendVerification = true,
    actionCodeSettings = null,
  } = {}
) {
  const auth = admin.auth(getAdminApp());
  let uid;
  let alreadyExists = false;

  try {
    const userRecord = await auth.createUser({
      email,
      password: defaultPassword,
      displayName: (displayName || email.split("@")[0]).trim(),
      emailVerified: true,
    });
    uid = userRecord.uid;
    console.log(`✅ Created : ${email}  →  uid: ${uid}`);
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
      alreadyExists = true;
      console.log(`⚠️  Exists  : ${email}  →  uid: ${uid}`);
    } else {
      console.error(`❌ Failed  : ${email} —`, err.message);
      throw err;
    }
  }

  if (sendVerification && !alreadyExists) {
    try {
      const link = await auth.generateEmailVerificationLink(
        email,
        actionCodeSettings ?? undefined
      );
      console.log(`   📧 Verify : ${link}`);
      // TODO: plug in your email provider (SendGrid, Resend, Nodemailer…)
      // await sendEmail({ to: email, subject: "Verify your account", body: link });
    } catch (e) {
      console.warn(`   ⚠️  Could not generate verification link: ${e.message}`);
    }
  }

  return { uid, email, alreadyExists };
}

// ─────────────────────────────────────────────────────────────────
// createAccountsFromEmails
// Creates all accounts, then feeds their UIDs directly into
// seedListings — no manual step needed.
// Returns: { results, errors }
// ─────────────────────────────────────────────────────────────────
export async function createAccountsFromEmails(emails = [], options = {}) {
  if (!emails.length) throw new Error("No emails provided.");

  const results = [];
  const errors  = [];

  for (const entry of emails) {
    const email       = typeof entry === "string" ? entry : entry.email;
    const displayName = typeof entry === "object"  ? entry.displayName ?? "" : "";
    try {
      const result = await createSingleAccount(email, { ...options, displayName });
      results.push(result);
    } catch (err) {
      errors.push({ email, error: err.message });
    }
  }

  console.log("\n─────────────────────────────────────");
  console.log(`✅ Accounts ready : ${results.length}`);
  console.log(`❌ Errors          : ${errors.length}`);
  if (errors.length) console.table(errors);

  // ── Auto-feed the created UIDs straight into the seeder ───────
  const uids = results.map((r) => r.uid);

  if (uids.length > 0) {
    console.log("\n🌱 Accounts created — seeding listings automatically...\n");
    await seedListings(uids, 100);
  } else {
    console.warn("⚠️  No UIDs available — skipping seed.");
  }

  return { results, errors };
}

// ─────────────────────────────────────────────────────────────────
// resendVerification
// ─────────────────────────────────────────────────────────────────
export async function resendVerification(email, actionCodeSettings = null) {
  const auth = admin.auth(getAdminApp());
  const link = await auth.generateEmailVerificationLink(
    email,
    actionCodeSettings ?? undefined
  );
  console.log(`📧 Re-sent verification link for ${email}:\n   ${link}`);
  return link;
}
const industries = [
  "mechanic", "plumber", "electrician", "cleaner", "security",
  "restaurant", "clinic", "lawyer", "accountant", "solar"
];
// ─────────────────────────────────────────────────────────────────
// ✏️  EDIT EMAIL_LIST below, then run:  node emailAccountCreator.js
// ─────────────────────────────────────────────────────────────────
if (process.argv[1].includes("emailAccountCreator")) {
 const EMAIL_LIST = industries.flatMap((industry, i) =>
  Array.from({ length: 10 }, (_, j) => ({
    email: `${industry}${j + 1}@seed.dev`,
    displayName: `${industry} ${j + 1}`,
  }))
);

  createAccountsFromEmails(EMAIL_LIST, {
    defaultPassword:  "TempPass@2025!",
    sendVerification: false,
  })
    .then(({ results }) => {
      console.log("\n📋 Final summary:");
      results.forEach((r) =>
        console.log(`  ${r.email}  →  ${r.uid}${r.alreadyExists ? "  (existing)" : ""}`)
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}