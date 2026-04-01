import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const sendInvoiceEmailFn = httpsCallable(functions, "sendInvoiceEmail");

/**
 * Universal send function — works for every industry dashboard.
 * @param {object} params
 * @param {object} params.user          - Firebase auth user
 * @param {string} params.invoiceId     - Firestore document ID
 * @param {string} params.documentType  - "invoice" | "estimate" | "jobcard" | "quote"
 * @param {string} params.recipientEmail
 * @param {string} params.recipientName
 * @param {string} params.invoiceNumber
 * @param {number} params.total
 * @param {string} params.industry      
 * @param {string} [params.pdfBase64]   
 */
export const sendInvoiceEmail = async ({
  user,
  invoiceId,
  documentType = "invoice",
  recipientEmail,
  recipientName,
  invoiceNumber,
  total,
  industry = "general",
  collectionName,   
  pdfBase64,
}) => {
  if (!user?.uid) throw new Error("Not authenticated");
  if (!recipientEmail) throw new Error("No recipient email address");
  if (!invoiceId) throw new Error("Save the document before sending");

  return sendInvoiceEmailFn({
    invoiceId,
    documentType,
    recipientEmail,
    recipientName,
    invoiceNumber,
    total,
    industry,
    collectionName,
    pdfBase64,
  });
};