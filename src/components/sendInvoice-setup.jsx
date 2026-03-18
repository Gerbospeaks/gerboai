// ════════════════════════════════════════════════════════════════════════════
// EMAIL SEND FEATURE — Integration Guide
// ════════════════════════════════════════════════════════════════════════════


// ── FILE PLACEMENT ────────────────────────────────────────────────────────────
//
//  functions/
//    index.js                 ← REPLACE with functions_index.js (from outputs)
//    package.json             ← add nodemailer (see Step 1 below)
//
//  src/components/
//    SendInvoiceModal.jsx     ← NEW (from outputs)


// ── STEP 1 — Install nodemailer in functions ──────────────────────────────────
//
//  cd functions
//  npm install nodemailer
//  cd ..


// ── STEP 2 — Set your email provider config ───────────────────────────────────
//
//  OPTION A: Gmail (quickest — use an App Password, NOT your real password)
//    1. Enable 2FA on your Google account
//    2. Go to myaccount.google.com → Security → App passwords
//    3. Generate a password for "Mail"
//    4. Run:
//       firebase functions:config:set email.user="you@gmail.com" email.pass="abcd efgh ijkl mnop"
//
//  OPTION B: SendGrid (recommended for production)
//    1. Create account at sendgrid.com
//    2. Settings → API Keys → Create Key (Full Access)
//    3. Run:
//       firebase functions:config:set sendgrid.key="SG.xxxxxxxxxxxxxxxxxxxxxx"
//    4. Verify your sender domain in SendGrid (required for delivery)
//
//  OPTION C: Custom SMTP (Mailtrap, Mailgun, AWS SES, etc.)
//    firebase functions:config:set smtp.host="smtp.mailtrap.io" smtp.port="587" smtp.user="..." smtp.pass="..."


// ── STEP 3 — Deploy the function ─────────────────────────────────────────────
//
//  firebase deploy --only functions
//
//  After deploy, your function will appear in Firebase Console → Functions


// ── STEP 4 — Wire SendInvoiceModal into AccountingDashboard.jsx ──────────────

// Add the import:
import SendInvoiceModal from "../../components/SendInvoiceModal";

// Add state (near your other useState declarations):
const [showSendModal, setShowSendModal] = useState(false);
const [invoiceToSend, setInvoiceToSend] = useState(null);

// Add a handler:
const handleSendInvoice = async (invoiceId) => {
  // Load the full invoice if we only have a partial object
  if (!invoiceId && !invoiceToSend) return;
  setShowSendModal(true);
};

// Update the "Send" button in headerActions to actually open the modal:
// FIND this in your headerActions array:
{ label: "Send", icon: Send, className: "..." }

// REPLACE with:
{
  label: "Send",
  icon: Send,
  onClick: async () => {
    // Save first if no invoiceId
    if (!invoiceId) {
      await handleSaveInvoice();
    }
    // Load the latest invoice data
    if (user?.uid && invoiceId) {
      const db   = getFirestore();
      const col  = documentType === "estimate" ? "estimates" : "invoices";
      const snap = await getDoc(doc(db, "users", user.uid, col, invoiceId));
      if (snap.exists()) {
        setInvoiceToSend({ id: snap.id, ...snap.data() });
        setShowSendModal(true);
      }
    }
  },
  className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
},

// Add the modal to your JSX (alongside your other modals):
{showSendModal && invoiceToSend && (
  <SendInvoiceModal
    invoice={invoiceToSend}
    businessInfo={businessInfo}
    onClose={() => { setShowSendModal(false); setInvoiceToSend(null); }}
    onSent={() => { loadSavedInvoices(); setShowSendModal(false); setInvoiceToSend(null); }}
  />
)}


// ── STEP 5 — Wire Send button in the invoice list modal ──────────────────────
//
// In your savedInvoices.map() rows, add a Send button:

<button
  onClick={(e) => {
    e.stopPropagation();
    setInvoiceToSend(inv);
    setShowSendModal(true);
  }}
  className="flex items-center gap-1 px-2.5 py-1 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] text-xs font-medium rounded-lg transition-colors"
>
  <Send className="w-3 h-3" />Send
</button>


// ── STEP 6 — Optional: Trigger bulk reminders ─────────────────────────────────
//
// Add a "Send Reminders" button anywhere in your dashboard:

import { getFunctions, httpsCallable } from "firebase/functions";

const sendBulkReminders = async () => {
  if (!window.confirm("Send payment reminders to all overdue invoices?")) return;
  const functions  = getFunctions();
  const fn         = httpsCallable(functions, "sendBulkReminders");
  const result     = await fn();
  alert(`Reminders sent: ${result.data.sent} · Failed: ${result.data.failed}`);
};


// ── WHAT GETS SENT ────────────────────────────────────────────────────────────
//
//  The email contains:
//  ✓ Dark-themed professional HTML email matching your dashboard aesthetic
//  ✓ Business name, VAT number, contact details in the header
//  ✓ Client name, email, and address
//  ✓ Invoice date and due date
//  ✓ Full line items table (description, qty, rate, VAT, total)
//  ✓ Subtotal, VAT, Total — and Balance Due if partially paid
//  ✓ Banking details section (pulled from businessInfo)
//  ✓ Your personal message to the client
//  ✓ Plain text fallback for email clients that don't render HTML
//  ✓ PAID / PARTIALLY PAID badge if applicable
//
//  After sending:
//  ✓ Invoice document updated with lastSentAt, lastSentTo, sentCount
//  ✓ Send logged to users/{uid}/emailLog collection
//  ✓ Modal shows success animation then auto-closes


// ── FIRESTORE RULES — add to firestore.rules ──────────────────────────────────

/*
  match /users/{uid}/emailLog/{logId} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
  }
*/


// ── businessInfo fields used by the email template ───────────────────────────
//
//  businessInfo.businessName       → Header title + From name
//  businessInfo.email              → Contact email in header
//  businessInfo.primaryPhone       → Contact phone in header
//  businessInfo.vatNumber          → VAT registration number
//  businessInfo.registrationNumber → Company reg number in footer
//  businessInfo.addressLine1       → Address in footer
//  businessInfo.city               → City in footer
//  businessInfo.postalCode         → Postal code in footer
//  businessInfo.bankName           → Banking details section
//  businessInfo.accountNumber      → Banking details section
//  businessInfo.branchCode         → Banking details section
//  businessInfo.accountType        → Banking details section
//
//  All of these are already stored by your BusinessSettingsModal — no changes needed.