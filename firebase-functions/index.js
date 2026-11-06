/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const functions = require("firebase-functions");
const {defineString, defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const {SendMailClient} = require("zeptomail");

// ─── Params ───────────────────────────────────────────────────────────────────
const geminiKey = defineSecret("GOOGLE_GEMINI_KEY");
const zeptoToken = defineSecret("ZEPTO_TOKEN");
const zeptoFromEmail = defineString("ZEPTO_FROM_EMAIL");

// ─── Initialize ───────────────────────────────────────────────────────────────
admin.initializeApp();

const APP_NAME = "GerboAI";
const APP_ADDRESS = "58 Minuet Crescent, Olivienhoutbosch, South Africa";
const APP_PHONE = "+27 68 488 7039";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INDUSTRY_COLLECTIONS = {
  "accounting": {invoice: "invoices", estimate: "estimates"},
  "mechanics": {
    invoice: "invoices",
    estimate: "estimates",
    jobcard: "jobcards",
  },
  "healthcare": {invoice: "invoices", estimate: "quotes"},
  "electrical": {invoice: "invoices", estimate: "estimates"},
  "plumbing": {invoice: "invoices", estimate: "estimates"},
  "construction": {invoice: "invoices", estimate: "estimates"},
  "cleaning": {invoice: "invoices", estimate: "quotes"},
  "security": {invoice: "invoices", estimate: "estimates"},
  "restaurant": {invoice: "invoices", estimate: "estimates"},
  "legal": {invoice: "invoices", estimate: "quotes"},
  "landscaping": {invoice: "invoices", estimate: "estimates"},
  "logistics": {invoice: "invoices", estimate: "quotes"},
  "photography": {invoice: "invoices", estimate: "quotes"},
  "realestate": {invoice: "invoices", estimate: "quotes"},
  "flooring": {invoice: "invoices", estimate: "estimates"},
  "hvac": {invoice: "invoices", estimate: "estimates"},
  "painting": {invoice: "invoices", estimate: "estimates"},
  "retail": {invoice: "invoices", estimate: "quotes"},
  "hotel": {invoice: "invoices", estimate: "quotes"},
  "education": {invoice: "invoices", estimate: "quotes"},
  "carpentry": {invoice: "invoices", estimate: "estimates"},
  "solar": {invoice: "invoices", estimate: "estimates"},
  "towing": {invoice: "invoices", estimate: "estimates"},
  "welding": {invoice: "invoices", estimate: "estimates"},
  "pest-control": {invoice: "invoices", estimate: "estimates"},
  "pool-services": {invoice: "invoices", estimate: "estimates"},
  "window-repair": {invoice: "invoices", estimate: "estimates"},
  "general": {invoice: "invoices", estimate: "estimates"},
};

const DOC_LABELS = {
  mechanics: {
    invoice: "Job Card / Invoice",
    estimate: "Quote",
    jobcard: "Job Card",
  },
  healthcare: {invoice: "Tax Invoice", estimate: "Quote"},
  legal: {invoice: "Fee Note", estimate: "Proposal"},
  realestate: {invoice: "Invoice", estimate: "Proposal"},
  default: {invoice: "Invoice", estimate: "Estimate"},
};

function resolveCollection(industry, documentType, override) {
  if (override) return override;
  const map = INDUSTRY_COLLECTIONS[industry] || INDUSTRY_COLLECTIONS["general"];
  return map[documentType] || "invoices";
}

function resolveDocLabel(industry, documentType) {
  const map = DOC_LABELS[industry] || DOC_LABELS["default"];
  return (
    map[documentType] || (documentType === "estimate" ? "Estimate" : "Invoice")
  );
}

async function sendViaZepto(
    {fromName, toEmail, toName, replyTo, subject, htmlBody, attachments = []},
    appEmail,
    zeptoClientInstance,
) {
  return zeptoClientInstance.sendMail({
    from: {address: appEmail, name: fromName},
    to: [{email_address: {address: toEmail, name: toName || ""}}],
    reply_to: [{address: replyTo || appEmail, name: fromName}],
    subject,
    htmlbody: htmlBody,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}

function buildInvoiceEmailHtml({
  fromName,
  recipientName,
  docLabel,
  invoiceNumber,
  total,
  pdfBase64,
  bankName,
  accountName,
  accountNo,
  branchCode,
  signatureHtml,
  appEmail,
  appAddress,
  appName,
}) {
  const bankingSection = bankName ?
    `
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:20px 0;border-radius:4px;">
      <h3 style="margin-top:0;color:#78350f;">Banking Details for Payment</h3>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tr>
          <td style="padding:6px 0;color:#92400e;font-weight:600;width:150px;">Bank Name:</td>
          <td style="padding:6px 0;color:#1f2937;">${bankName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#92400e;font-weight:600;">Account Name:</td>
          <td style="padding:6px 0;color:#1f2937;">${accountName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#92400e;font-weight:600;">Account Number:</td>
          <td style="padding:6px 0;color:#1f2937;">${accountNo}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#92400e;font-weight:600;">Branch Code:</td>
          <td style="padding:6px 0;color:#1f2937;">${branchCode}</td>
        </tr>
      </table>
      <p style="margin:15px 0 0;font-style:italic;color:#92400e;">
        <strong>Reference:</strong> Please use <strong>${invoiceNumber}</strong> as your payment reference.
      </p>
    </div>` :
    "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:700px;margin:0 auto;background:#f3f4f6;}
    .container{background:white;margin:20px;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);}
    .header{background:#1a2332;color:white;padding:28px 32px;display:flex;justify-content:space-between;align-items:center;}
    .content{padding:28px 32px;}
    .detail-box{background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;}
    .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;}
    .detail-row:last-child{border-bottom:none;}
    .footer{padding:18px 32px;text-align:center;background:#f9fafb;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span style="font-size:20px;font-weight:700;">${fromName}</span>
      <span style="font-size:12px;color:#94a3b8;">via ${appName}</span>
    </div>
    <div class="content">
      <p>Dear <strong>${recipientName || "Client"}</strong>,</p>
      <p>Please find your <strong>${docLabel}</strong> <strong>${invoiceNumber}</strong> ${pdfBase64 ? "attached." : "below."}</p>
      <div class="detail-box">
        <div class="detail-row">
          <span style="color:#6b7280;font-weight:600;">Document</span>
          <span style="font-weight:700;">${invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span style="color:#6b7280;font-weight:600;">Amount Due</span>
          <span style="font-weight:700;color:#2563eb;font-size:18px;">R${Number(total || 0).toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span style="color:#6b7280;font-weight:600;">Payment Terms</span>
          <span style="font-weight:700;">Net 30 Days</span>
        </div>
      </div>
      ${bankingSection}
      <p style="margin-top:24px;">Please reply to this email if you have any questions.</p>
      <p style="line-height:1.8;">${signatureHtml}</p>
    </div>
    <div class="footer">
      <p style="margin:4px 0;">Sent via ${appName} &bull; ${appAddress}</p>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminEmailHtml({
  title,
  subtitle,
  detailsHtml,
  itemsHtml,
  totalsHtml,
  extraHtml,
  notes,
  appName,
  appAddress,
  appPhone,
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:700px;margin:0 auto;background:#f3f4f6;}
    .container{background:white;margin:20px;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);}
    .header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px 30px;text-align:center;}
    .header h1{margin:0;font-size:28px;}
    .content{padding:30px;}
    .section-box{background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;}
    .detail-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb;}
    .detail-row:last-child{border-bottom:none;}
    .label{font-weight:600;color:#6b7280;}
    .value{font-weight:700;color:#1f2937;}
    .items-table{width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:8px;overflow:hidden;}
    .items-table thead{background:#1e293b;color:white;}
    .items-table th{padding:12px;text-align:left;font-size:12px;text-transform:uppercase;}
    .items-table td{padding:12px;}
    .totals-row{display:flex;justify-content:space-between;padding:8px 0;}
    .totals-row.total{border-top:2px solid #2563eb;padding-top:12px;margin-top:8px;font-size:20px;font-weight:700;}
    .total-amount{font-size:24px;color:#2563eb;}
    .footer{padding:20px 30px;text-align:center;background:#f9fafb;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p style="margin:10px 0 0;opacity:.9;">${subtitle}</p>
    </div>
    <div class="content">
      ${detailsHtml}
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:50px;text-align:center;">No.</th>
            <th>Description</th>
            <th style="width:80px;text-align:center;">Qty</th>
            <th style="width:100px;text-align:right;">Unit Price</th>
            <th style="width:100px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="section-box">${totalsHtml}</div>
      ${extraHtml || ""}
      ${
        notes ?
          `
        <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:15px;margin:20px 0;border-radius:4px;">
          <strong style="color:#1e40af;">Additional Notes:</strong><br>${notes}
        </div>` :
          ""
}
      <p style="margin-top:30px;">If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>
        <strong>${appName} Team</strong><br>
        📧 accounts@gerboai.com<br>
        📞 ${appPhone}
      </p>
    </div>
    <div class="footer">
      <p style="margin:5px 0;">This is an automated message from ${appName}</p>
      <p style="margin:5px 0;">${appAddress}</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── 1. AI EXTRACTION ─────────────────────────────────────────────────────────

exports.extractInvoiceDataGemini = functions
    .runWith({secrets: [geminiKey]})
    .https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User must be authenticated to use AI extraction",
        );
      }

      const {input, businessInfo, documentType} = data;

      if (!input || !input.trim()) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Input text is required",
        );
      }

      try {
        const genAI = new GoogleGenerativeAI(geminiKey.value());
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {responseMimeType: "application/json"},
        });

        const prompt = `Extract invoice data from this description and return ONLY valid JSON:

"${input}"

Business: ${businessInfo?.businessName}
Document Type: ${documentType}

JSON structure:
{
  "customer": {"name": "", "email": "", "phone": "", "address": "", "merchant_code": ""},
  "billTo": {"name": "", "email": "", "phone": "", "address": ""},
  "vehicle": {"make": "", "model": "", "year": "", "registration": "", "vin": "", "mileage": "", "preAuth": "", "authCode": ""},
  "items": [{"description": "", "type": "Labor or Parts", "rate": 0, "qty": 0, "amount": 0}]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
      } catch (error) {
        console.error("Error in extractInvoiceDataGemini:", error);
        throw new functions.https.HttpsError(
            "internal",
            error.message || "An error occurred during extraction",
        );
      }
    });

// ─── 2. UNIVERSAL SEND — all industry dashboards call this ────────────────────

exports.sendInvoiceEmail = functions
    .runWith({secrets: [zeptoToken]})
    .https.onCall(async (data, context) => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Must be signed in",
        );
      }

      const appEmail = zeptoFromEmail.value();
      const zeptoClient = new SendMailClient({
        url: "api.zeptomail.com/",
        token: zeptoToken.value(),
      });

      const uid = context.auth.uid;
      const {
        invoiceId,
        documentType = "invoice",
        recipientEmail,
        recipientName,
        invoiceNumber,
        total,
        industry = "general",
        collectionName,
        pdfBase64,
      } = data;

      if (!recipientEmail || !invoiceNumber) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required fields: recipientEmail and invoiceNumber",
        );
      }

      const [configSnap, bizSnap] = await Promise.all([
        admin.firestore().doc(`users/${uid}/settings/emailConfig`).get(),
        admin.firestore().doc(`users/${uid}/settings/businessInfo`).get(),
      ]);

      const emailConfig = configSnap.exists ? configSnap.data() : {};
      const businessInfo = bizSnap.exists ? bizSnap.data() : {};

      const fromName =
      emailConfig.fromName || businessInfo.businessName || APP_NAME;
      const replyTo = emailConfig.replyTo || businessInfo.email || appEmail;
      const signature = emailConfig.signature || `Kind regards,\n${fromName}`;
      const sendCopy = emailConfig.sendCopyToSelf ?? true;

      const signatureHtml = signature
          .split("\n")
          .map((l) => `<span>${l}</span>`)
          .join("<br/>");

      const docLabel = resolveDocLabel(industry, documentType);
      const subject = `${docLabel} ${invoiceNumber} from ${fromName}`;

      const htmlBody = buildInvoiceEmailHtml({
        fromName,
        recipientName,
        docLabel,
        invoiceNumber,
        total,
        pdfBase64,
        bankName: businessInfo.bankName || "",
        accountName: businessInfo.accountName || fromName,
        accountNo: businessInfo.accountNo || "",
        branchCode: businessInfo.branchCode || "",
        signatureHtml,
        appEmail,
        appAddress: APP_ADDRESS,
        appName: APP_NAME,
      });

      const attachments = pdfBase64 ?
      [
        {
          name: `${invoiceNumber}.pdf`,
          content: pdfBase64,
          mime_type: "application/pdf",
        },
      ] :
      [];

      await sendViaZepto(
          {
            fromName,
            toEmail: recipientEmail,
            toName: recipientName,
            replyTo,
            subject,
            htmlBody,
            attachments,
          },
          appEmail,
          zeptoClient,
      );

      if (sendCopy && replyTo && replyTo !== appEmail) {
        await sendViaZepto(
            {
              fromName,
              toEmail: replyTo,
              toName: fromName,
              replyTo,
              subject: `[Copy] ${subject}`,
              htmlBody,
              attachments,
            },
            appEmail,
            zeptoClient,
        );
      }

      const col = resolveCollection(industry, documentType, collectionName);
      try {
        await admin.firestore().doc(`users/${uid}/${col}/${invoiceId}`).update({
          status: "sent",
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentTo: recipientEmail,
        });
      } catch (e) {
        console.warn("Could not update document status:", e.message);
      }

      return {success: true};
    });

// ─── 3. FIRESTORE TRIGGER — admin invoice ─────────────────────────────────────

exports.sendInvoiceEmail_firestore = functions
    .runWith({secrets: [zeptoToken]})
    .firestore.document("users/{userId}/adminInvoices/{invoiceId}")
    .onUpdate(async (change, context) => {
      const newData = change.after.data();
      const previousData = change.before.data();

      if (newData.status !== "sent" || previousData.status === "sent") {
        return null;
      }

      const appEmail = zeptoFromEmail.value();
      const zeptoClient = new SendMailClient({
        url: "api.zeptomail.com/",
        token: zeptoToken.value(),
      });

      try {
        const {
          invoiceNumber,
          clientEmail,
          clientName,
          total,
          subtotal,
          tax,
          notes,
          items,
        } = newData;
        const dueDate = newData.dueDate.toDate();
        const issueDate = newData.issueDate.toDate();

        const dueDateFormatted = dueDate.toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const issueDateFormatted = issueDate.toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const itemsHtml = items
            .map(
                (item, i) => `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px;text-align:center;color:#6b7280;">${i + 1}</td>
            <td style="padding:12px;">
              <strong>${item.description}</strong>
              ${item.details ? `<br><small style="color:#6b7280;font-style:italic;">${item.details}</small>` : ""}
            </td>
            <td style="padding:12px;text-align:center;">${item.quantity}</td>
            <td style="padding:12px;text-align:right;">R${Number(item.unitPrice).toFixed(2)}</td>
            <td style="padding:12px;text-align:right;"><strong>R${Number(item.amount).toFixed(2)}</strong></td>
          </tr>`,
            )
            .join("");

        const detailsHtml = `
          <p>Dear <strong>${clientName}</strong>,</p>
          <p>Please find your invoice details below. Payment is due by <strong>${dueDateFormatted}</strong>.</p>
          <div class="section-box">
            <div class="detail-row"><span class="label">Invoice Number:</span><span class="value">${invoiceNumber}</span></div>
            <div class="detail-row"><span class="label">Issue Date:</span><span class="value">${issueDateFormatted}</span></div>
            <div class="detail-row"><span class="label">Due Date:</span><span class="value">${dueDateFormatted}</span></div>
          </div>
          <h3 style="color:#1f2937;margin-top:30px;">Invoice Items</h3>`;

        const totalsHtml = `
          <div class="totals-row"><span>Subtotal:</span><span>R${Number(subtotal).toFixed(2)}</span></div>
          <div class="totals-row"><span>VAT (15%):</span><span>R${Number(tax).toFixed(2)}</span></div>
          <div class="totals-row total"><span>Total Amount Due:</span><span class="total-amount">R${Number(total).toFixed(2)}</span></div>`;

        const extraHtml = `
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:20px 0;border-radius:4px;">
            <h3 style="margin-top:0;color:#78350f;">Banking Details for Payment</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px;">
              <div><strong style="color:#92400e;">Bank Name:</strong><br>ACCESS BANK</div>
              <div><strong style="color:#92400e;">Account Name:</strong><br>Sovereign Designs</div>
              <div><strong style="color:#92400e;">Account Number:</strong><br>51559563935</div>
              <div><strong style="color:#92400e;">Branch Code:</strong><br>410506</div>
            </div>
            <p style="margin:15px 0 0;font-style:italic;color:#92400e;">
              <strong>Important:</strong> Please use <strong>${invoiceNumber}</strong> as your payment reference.
            </p>
          </div>`;

        const htmlBody = buildAdminEmailHtml({
          title: "Invoice from GerboAI",
          subtitle: "Thank you for your business!",
          detailsHtml,
          itemsHtml,
          totalsHtml,
          extraHtml,
          notes,
          appName: APP_NAME,
          appAddress: APP_ADDRESS,
          appPhone: APP_PHONE,
        });

        await sendViaZepto(
            {
              fromName: APP_NAME,
              toEmail: clientEmail,
              toName: clientName,
              replyTo: appEmail,
              subject: `Invoice ${invoiceNumber} from ${APP_NAME} - Payment Due ${dueDateFormatted}`,
              htmlBody,
            },
            appEmail,
            zeptoClient,
        );

        console.log("Admin invoice email sent to:", clientEmail);
        await change.after.ref.update({
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Error sending admin invoice email:", error);
      }

      return null;
    });

// ─── 4. FIRESTORE TRIGGER — admin quote ───────────────────────────────────────

exports.sendQuoteEmail = functions
    .runWith({secrets: [zeptoToken]})
    .firestore.document("users/{userId}/adminQuotes/{quoteId}")
    .onUpdate(async (change, context) => {
      const newData = change.after.data();
      const previousData = change.before.data();

      if (newData.status !== "sent" || previousData.status === "sent") {
        return null;
      }

      const appEmail = zeptoFromEmail.value();
      const zeptoClient = new SendMailClient({
        url: "api.zeptomail.com/",
        token: zeptoToken.value(),
      });

      try {
        const {
          quoteNumber,
          clientEmail,
          clientName,
          total,
          subtotal,
          tax,
          notes,
          items,
        } = newData;
        const validUntil = newData.validUntil.toDate();
        const issueDate = newData.issueDate.toDate();

        const validUntilFormatted = validUntil.toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const issueDateFormatted = issueDate.toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const itemsHtml = items
            .map(
                (item, i) => `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px;text-align:center;color:#6b7280;">${i + 1}</td>
            <td style="padding:12px;">
              <strong>${item.description}</strong>
              ${item.details ? `<br><small style="color:#6b7280;font-style:italic;">${item.details}</small>` : ""}
            </td>
            <td style="padding:12px;text-align:center;">${item.quantity}</td>
            <td style="padding:12px;text-align:right;">R${Number(item.unitPrice).toFixed(2)}</td>
            <td style="padding:12px;text-align:right;"><strong>R${Number(item.amount).toFixed(2)}</strong></td>
          </tr>`,
            )
            .join("");

        const detailsHtml = `
          <p>Dear <strong>${clientName}</strong>,</p>
          <p>Thank you for your interest. Please find your quotation details below:</p>
          <div class="section-box">
            <div class="detail-row"><span class="label">Quote Number:</span><span class="value">${quoteNumber}</span></div>
            <div class="detail-row"><span class="label">Issue Date:</span><span class="value">${issueDateFormatted}</span></div>
            <div class="detail-row"><span class="label">Valid Until:</span><span class="value">${validUntilFormatted}</span></div>
          </div>
          <h3 style="color:#1f2937;margin-top:30px;">Quoted Items</h3>`;

        const totalsHtml = `
          <div class="totals-row"><span>Subtotal:</span><span>R${Number(subtotal).toFixed(2)}</span></div>
          <div class="totals-row"><span>VAT (15%):</span><span>R${Number(tax).toFixed(2)}</span></div>
          <div class="totals-row total"><span>Total Quote Amount:</span><span class="total-amount">R${Number(total).toFixed(2)}</span></div>`;

        const extraHtml = `
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:20px 0;border-radius:4px;">
            <strong style="color:#92400e;">Important Notice:</strong>
            <p style="margin:10px 0 0;color:#78350f;">
              This quotation is valid until <strong>${validUntilFormatted}</strong>.
              Please confirm before this date to secure these prices and availability.
            </p>
          </div>`;

        const htmlBody = buildAdminEmailHtml({
          title: "Quote from GerboAI",
          subtitle: "Your custom quotation",
          detailsHtml,
          itemsHtml,
          totalsHtml,
          extraHtml,
          notes,
          appName: APP_NAME,
          appAddress: APP_ADDRESS,
          appPhone: APP_PHONE,
        });

        await sendViaZepto(
            {
              fromName: APP_NAME,
              toEmail: clientEmail,
              toName: clientName,
              replyTo: appEmail,
              subject: `Quote ${quoteNumber} from ${APP_NAME} - Valid Until ${validUntilFormatted}`,
              htmlBody,
            },
            appEmail,
            zeptoClient,
        );

        console.log("Quote email sent to:", clientEmail);
        await change.after.ref.update({
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Error sending quote email:", error);
      }

      return null;
    });

// ─── 5. FIRESTORE TRIGGER — incoming service request notification ──────────────

exports.onNewIncomingRequest = functions.firestore
    .document("users/{providerId}/incomingRequests/{requestId}")
    .onCreate(async (snap, context) => {
      const data = snap.data();
      const {providerId} = context.params;

      // Get provider FCM token
      const providerDoc = await admin
          .firestore()
          .doc(`solidfloServiceProviders/${providerId}`)
          .get();
      const fcmToken = providerDoc.data()?.fcmToken;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: "New booking request 📥",
            body: `${data.requesterName} needs your ${data.requesterIndustry} service.`,
          },
          data: {
            type: "incoming_request",
            requestId: data.requestId,
          },
        });
      }

    // Optional: send email via ZeptoMail
    // const zeptoClient = new SendMailClient({ url: "api.zeptomail.com/", token: zeptoToken.value() });
    // await sendViaZepto({ fromName: APP_NAME, toEmail: providerEmail, ... }, zeptoFromEmail.value(), zeptoClient);
    });
