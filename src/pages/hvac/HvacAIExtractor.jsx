import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image,
  X,
} from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";

const HvacAIExtractor = ({
  onDataExtracted,
  businessInfo,
  documentType = "invoice",
}) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload an image (JPG, PNG, WebP) or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError("");

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("");
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview("");
  };

  const extractFromImage = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Convert file to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mediaType = file.type;

      // Prepare the message content
      const content = [
        {
          type: file.type === "application/pdf" ? "document" : "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        },
        {
          type: "text",
          text: `Extract ${documentType} information from this document. Return ONLY a JSON object with this exact structure (no markdown, no explanation):

{
  "customer": {
    "name": "",
    "email": "",
    "phone": "",
    "address": "",
    "customerId": ""
  },
  "system": {
    "type": "",
    "brand": "",
    "model": "",
    "serialNumber": "",
    "capacity": "",
    "location": ""
  },
  "items": [
    {
      "description": "",
      "type": "Service",
      "rate": 0,
      "qty": 1,
      "amount": 0
    }
  ]
}

Extract all available information. Use empty strings for missing text fields, empty arrays for missing lists, and 0 for missing numbers. 

For system.type, use values like: "Split Air Conditioner", "Central Air System", "Heat Pump", "VRV/VRF System", "Chiller", "Package Unit", "Ductless Mini-Split", etc.

For system.capacity, include both kW and BTU if available (e.g., "3.5kW / 12000 BTU").

For system.location, specify where the unit is installed (e.g., "Main Office - Reception Area").

For items, type should be one of: "Service", "Parts", "Refrigerant", or "Materials".`,
        },
      ];

      // Call Claude API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: content,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Extract text from response
      const textContent = data.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      // Clean and parse JSON
      let cleanedText = textContent.trim();
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      const extractedData = JSON.parse(cleanedText);

      // Validate the structure
      if (
        !extractedData.customer ||
        !extractedData.vehicle ||
        !extractedData.items
      ) {
        throw new Error("Extracted data is missing required fields");
      }

      // Pass data to parent component
      onDataExtracted(extractedData);
      setSuccess(true);
      setFile(null);
      setPreview("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Extraction error:", err);
      setError(
        err.message || "Failed to extract data from image. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const extractInvoiceData = async () => {
    if (!input.trim()) {
      setError("Please enter some information to extract");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // ✅ CALL FIREBASE FUNCTION INSTEAD OF NETLIFY
      const functions = getFunctions();
      const extractData = httpsCallable(functions, "extractInvoiceDataGemini");

      console.log("Calling Firebase function...");

      const result = await extractData({
        input: input,
        businessInfo: businessInfo,
        documentType: documentType,
      });

      console.log("Function Response:", result.data);

      const extractedData = result.data;

      // Validate the structure
      if (
        !extractedData.customer ||
        !extractedData.vehicle ||
        !extractedData.items
      ) {
        console.error("Missing required fields in:", extractedData);
        throw new Error("Extracted data is missing required fields");
      }

      // Pass data to parent component
      onDataExtracted(extractedData);
      setSuccess(true);
      setInput("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Extraction error:", err);

      if (err.code === "unauthenticated") {
        setError("You must be logged in to use AI extraction.");
      } else if (err.code === "functions/internal") {
        setError("AI service error. Please try again.");
      } else {
        setError(err.message || "Failed to extract data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-white rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          AI Mode - Just describe your {documentType}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your {documentType} in plain English
          </label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Example: "Create an invoice for John Smith, email john@email.com, phone 082 123 4567, address 123 Main St Pretoria. Vehicle is a 2020 Toyota Hilux, reg ABC123GP, 45000km. Services: oil change R500, brake pads R1200 (2 sets), labor 3 hours at R450/hour"`}
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              rows={4}
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="invoice-file-upload"
                disabled={loading}
              />
              <label
                htmlFor="invoice-file-upload"
                className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors ${
                  loading
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
                title="Upload invoice image or PDF"
              >
                <Image className="w-4 h-4 text-gray-800" />
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Type your invoice details OR click the image icon to upload
            a document
          </p>
        </div>

        {file && (
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                disabled={loading}
                className="text-gray-400 hover:text-red-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-contain bg-gray-50 rounded-lg mb-2"
              />
            )}

            <button
              onClick={extractFromImage}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting from image...</span>
                </>
              ) : (
                <>
                  <Image className="w-4 h-4" />
                  <span>Extract from Image</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              ✅ Data extracted and populated successfully!
            </span>
          </div>
        )}

        <button
          onClick={extractInvoiceData}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-900 text-gray-800 rounded-lg hover:from-gray-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting data with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract & Fill Form with AI</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>What the AI can extract:</strong> Customer name, email, phone,
          address, customer ID, vehicle
          make/model/year/registration/VIN/mileage, service items, parts,
          quantities, prices, labor hours, and more. Just describe it naturally
          or upload an image!
        </p>
      </div>
    </div>
  );
};

export default HvacAIExtractor;
