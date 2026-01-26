import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const AIInvoiceExtractor = ({ onDataExtracted, businessInfo, documentType = 'invoice' }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

const extractInvoiceData = async () => {
  if (!input.trim()) {
    setError('Please enter some information to extract');
    return;
  }

  setLoading(true);
  setError('');
  setSuccess(false);

  try {
    const prompt = `You are an AI assistant that extracts invoice/quote data from natural language input.

Business Context:
- Business Name: ${businessInfo?.businessName || 'Not provided'}
- Document Type: ${documentType}

User Input:
"${input}"

Extract the following information and return ONLY a JSON object with no markdown formatting, no backticks, no explanation - just pure JSON:

{
  "customer": {
    "name": "customer name or empty string",
    "email": "customer email or empty string",
    "phone": "customer phone or empty string",
    "address": "customer address or empty string",
    "merchant_code": "customer ID/code or empty string"
  },
  "billTo": {
    "name": "billing name (default to customer name) or empty string",
    "email": "billing email (default to customer email) or empty string",
    "phone": "billing phone (default to customer phone) or empty string",
    "address": "billing address (default to customer address) or empty string"
  },
  "vehicle": {
    "make": "vehicle make or empty string",
    "model": "vehicle model or empty string",
    "year": "vehicle year or empty string",
    "registration": "registration/license plate or empty string",
    "vin": "VIN number or empty string",
    "mileage": "mileage or empty string",
    "preAuth": "pre-authorization code or empty string",
    "authCode": "authorization code or empty string"
  },
  "items": [
    {
      "description": "service/part description",
      "type": "Labor or Parts",
      "rate": number,
      "qty": number,
      "amount": number (rate * qty)
    }
  ]
}

Rules:
- Extract all information you can find
- Use empty strings for missing data
- For items, calculate amount = rate × qty
- Infer reasonable defaults (e.g., if "oil change" mentioned, type is "Labor")
- If billing info not specified, copy from customer info
- Be smart about detecting vehicle info, customer details, and line items
- Return ONLY valid JSON, absolutely no other text, no markdown code blocks`;

    console.log('Calling Netlify function...');
    
    const response = await fetch('/.netlify/functions/extractInvoiceData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Function not found. Make sure you are running "netlify dev"');
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Full API Response:', data);
    
    // Check if there's an error in the response
    if (!data) {
      throw new Error('Empty response from API');
    }

    if (data.error) {
      throw new Error(data.error.message || data.error || 'API returned an error');
    }

    // Check for content array
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from API');
    }

    // Get the first content block
    const firstContent = data.content[0];
    console.log('First content block:', firstContent);

    if (!firstContent || firstContent.type !== 'text') {
      throw new Error('Expected text content but got: ' + (firstContent?.type || 'unknown'));
    }

    // ✅ FIXED: Declare text variable here with let
    let text = firstContent.text;
    console.log('Raw text response:', text);
    
    // Clean the response
    text = text.trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    console.log('Cleaned text:', text);
    
    // ✅ FIXED: Declare extractedData with let
    let extractedData;
    try {
      extractedData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse text:', text);
      throw new Error('AI returned invalid JSON. Please try again with clearer information.');
    }
    
    console.log('Parsed extracted data:', extractedData);
    
    // Validate the structure
    if (!extractedData.customer || !extractedData.vehicle || !extractedData.items) {
      console.error('Missing required fields in:', extractedData);
      throw new Error('Extracted data is missing required fields (customer, vehicle, or items)');
    }
    
    // ✅ Pass data to parent component
    onDataExtracted(extractedData);
    setSuccess(true);
    setInput('');
    
    setTimeout(() => setSuccess(false), 3000);
    
  } catch (err) {
    console.error('Extraction error:', err);
    setError(err.message || 'Failed to extract data. Please check your input and try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-white rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          AI Assistant - Just describe your {documentType}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your {documentType} in plain English
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Example: "Create an invoice for John Smith, email john@email.com, phone 082 123 4567, address 123 Main St Pretoria. Vehicle is a 2020 Toyota Hilux, reg ABC123GP, 45000km. Services: oil change R500, brake pads R1200 (2 sets), labor 3 hours at R450/hour"`}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
            rows={4}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Include customer details, vehicle info, and services/parts. The AI will organize everything for you!
          </p>
        </div>

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
          <div className="flex items-center gap-2 text-green-600 bg-gray-50 px-4 py-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">✅ Data extracted and populated successfully!</span>
          </div>
        )}

        <button
          onClick={extractInvoiceData}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-gray-600">
          <strong>What the AI can extract:</strong> Customer name, email, phone, address, customer ID, 
          vehicle make/model/year/registration/VIN/mileage, service items, parts, quantities, prices, 
          labor hours, and more. Just describe it naturally!
        </p>
      </div>
    </div>
  );
};

export default AIInvoiceExtractor;