/* eslint-disable max-len */
const functions = require("firebase-functions");
const {GoogleGenerativeAI} = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().google.gemini_key);

// Gemini-based extraction function
exports.extractInvoiceDataGemini = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
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
