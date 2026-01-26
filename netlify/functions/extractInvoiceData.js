require('dotenv').config();
exports.handler = async (event, context) => {
  console.log('=== Function Started ===');
  console.log('Method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    console.log('Prompt received, length:', prompt?.length);
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('API key not found in environment');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'API key not configured. Please set ANTHROPIC_API_KEY in Netlify environment variables.' })
      };
    }

    console.log('Calling Anthropic API...');
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      }),
    });

    console.log('Anthropic response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
      }
      
      throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Anthropic response received successfully');
    console.log('Response keys:', Object.keys(data));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('=== Function Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};