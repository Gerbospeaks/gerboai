/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const {GoogleGenerativeAI} = require("@google/generative-ai");

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().google.gemini_key);

// Configure email transporter for Zoho
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: functions.config().zoho.email,
    pass: functions.config().zoho.password,
  },
});

// Gemini-based extraction function
exports.extractInvoiceDataGemini = functions.https.onCall(async (data, context) => {
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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
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
    const jsonData = JSON.parse(response.text());

    return jsonData;
  } catch (error) {
    console.error("Error in extractInvoiceDataGemini:", error);
    throw new functions.https.HttpsError(
        "internal",
        error.message || "An error occurred during extraction",
    );
  }
});

// Send Invoice Email
exports.sendInvoiceEmail = functions.firestore
    .document("users/{userId}/adminInvoices/{invoiceId}")
    .onUpdate(async (change, context) => {
      const newData = change.after.data();
      const previousData = change.before.data();
      const {invoiceId} = context.params;

      if (newData.status === "sent" && previousData.status !== "sent") {
        try {
          console.log("Sending invoice email for:", invoiceId);

          const invoiceNumber = newData.invoiceNumber;
          const clientEmail = newData.clientEmail;
          const clientName = newData.clientName;
          const total = newData.total;
          const dueDate = newData.dueDate.toDate();

          const dueDateFormatted = dueDate.toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const itemsHtml = newData.items.map((item, index) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; text-align: center; color: #6b7280;">${index + 1}</td>
              <td style="padding: 12px;">
                <strong>${item.description}</strong>
                ${item.details ? `<br><small style="color: #6b7280; font-style: italic;">${item.details}</small>` : ""}
              </td>
              <td style="padding: 12px; text-align: center;">${item.quantity}</td>
              <td style="padding: 12px; text-align: right;">R${item.unitPrice.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right;"><strong>R${item.amount.toFixed(2)}</strong></td>
            </tr>
          `).join("");

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 700px;
                  margin: 0 auto;
                  background: #f3f4f6;
                }
                .container {
                  background: white;
                  margin: 20px;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                }
                .content {
                  padding: 30px;
                }
                .invoice-details {
                  background: #f9fafb;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                }
                .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .detail-row:last-child {
                  border-bottom: none;
                }
                .label {
                  font-weight: 600;
                  color: #6b7280;
                }
                .value {
                  font-weight: 700;
                  color: #1f2937;
                }
                .total-amount {
                  font-size: 24px;
                  color: #2563eb;
                }
                .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
                }
                .items-table thead {
                  background: #1e293b;
                  color: white;
                }
                .items-table th {
                  padding: 12px;
                  text-align: left;
                  font-size: 12px;
                  text-transform: uppercase;
                }
                .items-table td {
                  padding: 12px;
                }
                .bank-details {
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .bank-details h3 {
                  margin-top: 0;
                  color: #78350f;
                }
                .bank-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 10px;
                  margin-top: 15px;
                }
                .bank-info-item {
                  margin: 5px 0;
                }
                .bank-info-item strong {
                  color: #92400e;
                }
                .footer {
                  padding: 20px 30px;
                  text-align: center;
                  background: #f9fafb;
                  color: #6b7280;
                  font-size: 14px;
                  border-top: 1px solid #e5e7eb;
                }
                .totals {
                  background: #f9fafb;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .totals-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                }
                .totals-row.total {
                  border-top: 2px solid #2563eb;
                  padding-top: 12px;
                  margin-top: 8px;
                  font-size: 20px;
                  font-weight: 700;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📄 Invoice from SolidFlo</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your business!</p>
                </div>
                
                <div class="content">
                  <p>Dear <strong>${clientName}</strong>,</p>
                  <p>Please find your invoice details below. Payment is due by <strong>${dueDateFormatted}</strong>.</p>
                  
                  <div class="invoice-details">
                    <div class="detail-row">
                      <span class="label">Invoice Number:</span>
                      <span class="value">${invoiceNumber}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Issue Date:</span>
                      <span class="value">${new Date(newData.issueDate.toDate()).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Due Date:</span>
                      <span class="value">${dueDateFormatted}</span>
                    </div>
                  </div>

                  <h3 style="color: #1f2937; margin-top: 30px;">Invoice Items</h3>
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th style="width: 50px; text-align: center;">No.</th>
                        <th>Description</th>
                        <th style="width: 80px; text-align: center;">Qty</th>
                        <th style="width: 100px; text-align: right;">Unit Price</th>
                        <th style="width: 100px; text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <div class="totals">
                    <div class="totals-row">
                      <span>Subtotal:</span>
                      <span>R${newData.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="totals-row">
                      <span>VAT (15%):</span>
                      <span>R${newData.tax.toFixed(2)}</span>
                    </div>
                    <div class="totals-row total">
                      <span>Total Amount Due:</span>
                      <span class="total-amount">R${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div class="bank-details">
                    <h3>💳 Banking Details for Payment</h3>
                    <div class="bank-info">
                      <div class="bank-info-item">
                        <strong>Bank Name:</strong><br>
                        ACCESS BANK
                      </div>
                      <div class="bank-info-item">
                        <strong>Account Name:</strong><br>
                        Sovereign Designs
                      </div>
                      <div class="bank-info-item">
                        <strong>Account Number:</strong><br>
                        51559563935
                      </div>
                      <div class="bank-info-item">
                        <strong>Branch Code:</strong><br>
                        410506
                      </div>
                    </div>
                    <p style="margin: 15px 0 0 0; font-style: italic; color: #92400e;">
                      <strong>Important:</strong> Please use invoice number <strong>${invoiceNumber}</strong> as your payment reference.
                    </p>
                  </div>

                  ${newData.notes ? `
                    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <strong style="color: #1e40af;">Additional Notes:</strong><br>
                      ${newData.notes}
                    </div>
                  ` : ""}

                  <p style="margin-top: 30px;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
                  
                  <p>Best regards,<br>
                  <strong>SolidFlo Team</strong><br>
                  📧 accounts@solidflo.co.za<br>
                  📞 +27 68 488 7039</p>
                </div>
                
                <div class="footer">
                  <p style="margin: 5px 0;">This is an automated message from SolidFlo</p>
                  <p style="margin: 5px 0;">58 Minuet Crescent, Olivienhoutbosch, South Africa</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const mailOptions = {
            from: `SolidFlo <${functions.config().zoho.email}>`,
            to: clientEmail,
            subject: `Invoice ${invoiceNumber} from SolidFlo - Payment Due ${dueDateFormatted}`,
            html: emailHtml,
          };

          await transporter.sendMail(mailOptions);
          console.log("Invoice email sent successfully to:", clientEmail);

          await change.after.ref.update({
            emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return null;
        } catch (error) {
          console.error("Error sending invoice email:", error);
          return null;
        }
      }

      return null;
    });

// Send Quote Email
exports.sendQuoteEmail = functions.firestore
    .document("users/{userId}/adminQuotes/{quoteId}")
    .onUpdate(async (change, context) => {
      const newData = change.after.data();
      const previousData = change.before.data();

      if (newData.status === "sent" && previousData.status !== "sent") {
        try {
          const quoteNumber = newData.quoteNumber;
          const clientEmail = newData.clientEmail;
          const clientName = newData.clientName;
          const total = newData.total;
          const validUntil = newData.validUntil.toDate();

          const validUntilFormatted = validUntil.toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const itemsHtml = newData.items.map((item, index) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px; text-align: center; color: #6b7280;">${index + 1}</td>
              <td style="padding: 12px;">
                <strong>${item.description}</strong>
                ${item.details ? `<br><small style="color: #6b7280; font-style: italic;">${item.details}</small>` : ""}
              </td>
              <td style="padding: 12px; text-align: center;">${item.quantity}</td>
              <td style="padding: 12px; text-align: right;">R${item.unitPrice.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right;"><strong>R${item.amount.toFixed(2)}</strong></td>
            </tr>
          `).join("");

          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 700px;
                  margin: 0 auto;
                  background: #f3f4f6;
                }
                .container {
                  background: white;
                  margin: 20px;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                }
                .content {
                  padding: 30px;
                }
                .quote-details {
                  background: #f9fafb;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                }
                .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .detail-row:last-child {
                  border-bottom: none;
                }
                .label {
                  font-weight: 600;
                  color: #6b7280;
                }
                .value {
                  font-weight: 700;
                  color: #1f2937;
                }
                .total-amount {
                  font-size: 24px;
                  color: #2563eb;
                }
                .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
                }
                .items-table thead {
                  background: #1e293b;
                  color: white;
                }
                .items-table th {
                  padding: 12px;
                  text-align: left;
                  font-size: 12px;
                  text-transform: uppercase;
                }
                .items-table td {
                  padding: 12px;
                }
                .footer {
                  padding: 20px 30px;
                  text-align: center;
                  background: #f9fafb;
                  color: #6b7280;
                  font-size: 14px;
                  border-top: 1px solid #e5e7eb;
                }
                .validity-notice {
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .totals {
                  background: #f9fafb;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .totals-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                }
                .totals-row.total {
                  border-top: 2px solid #2563eb;
                  padding-top: 12px;
                  margin-top: 8px;
                  font-size: 20px;
                  font-weight: 700;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💼 Quote from SolidFlo</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Your custom quotation</p>
                </div>
                
                <div class="content">
                  <p>Dear <strong>${clientName}</strong>,</p>
                  <p>Thank you for your interest in our services. Please find your quotation details below:</p>
                  
                  <div class="quote-details">
                    <div class="detail-row">
                      <span class="label">Quote Number:</span>
                      <span class="value">${quoteNumber}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Issue Date:</span>
                      <span class="value">${new Date(newData.issueDate.toDate()).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Valid Until:</span>
                      <span class="value">${validUntilFormatted}</span>
                    </div>
                  </div>

                  <h3 style="color: #1f2937; margin-top: 30px;">Quoted Items</h3>
                  <table class="items-table">
                    <thead>
                      <tr>
                        <th style="width: 50px; text-align: center;">No.</th>
                        <th>Description</th>
                        <th style="width: 80px; text-align: center;">Qty</th>
                        <th style="width: 100px; text-align: right;">Unit Price</th>
                        <th style="width: 100px; text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <div class="totals">
                    <div class="totals-row">
                      <span>Subtotal:</span>
                      <span>R${newData.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="totals-row">
                      <span>VAT (15%):</span>
                      <span>R${newData.tax.toFixed(2)}</span>
                    </div>
                    <div class="totals-row total">
                      <span>Total Quote Amount:</span>
                      <span class="total-amount">R${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div class="validity-notice">
                    <strong style="color: #92400e;">⚠️ Important Notice:</strong><br>
                    <p style="margin: 10px 0 0 0; color: #78350f;">
                      This quotation is valid until <strong>${validUntilFormatted}</strong>. 
                      Please confirm your order before this date to secure these prices and availability.
                    </p>
                  </div>

                  ${newData.notes ? `
                    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <strong style="color: #1e40af;">Additional Notes:</strong><br>
                      ${newData.notes}
                    </div>
                  ` : ""}

                  <p style="margin-top: 30px;">If you would like to proceed with this quote or have any questions, please don't hesitate to contact us.</p>
                  
                  <p>Best regards,<br>
                  <strong>SolidFlo Team</strong><br>
                  📧 accounts@solidflo.co.za<br>
                  📞 +27 68 488 7039</p>
                </div>
                
                <div class="footer">
                  <p style="margin: 5px 0;">This is an automated message from SolidFlo</p>
                  <p style="margin: 5px 0;">58 Minuet Crescent, Olivienhoutbosch, South Africa</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const mailOptions = {
            from: `SolidFlo <${functions.config().zoho.email}>`,
            to: clientEmail,
            subject: `Quote ${quoteNumber} from SolidFlo - Valid Until ${validUntilFormatted}`,
            html: emailHtml,
          };

          await transporter.sendMail(mailOptions);
          console.log("Quote email sent successfully to:", clientEmail);

          await change.after.ref.update({
            emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return null;
        } catch (error) {
          console.error("Error sending quote email:", error);
          return null;
        }
      }

      return null;
    });
