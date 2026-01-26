const functions = require("firebase-functions");

exports.extractInvoiceData = functions
    .runWith({secrets: ["ANTHROPIC_API_KEY"]})
    .https.onCall(async (data, context) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;

      // Now use the key with Anthropic's SDK
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{role: "user", content: "Extract invoice data..."}],
        }),
      });

      return await response.json();
    }
  );
