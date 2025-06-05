
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Edge function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, apiKey } = requestBody;

    console.log('Received request with message length:', message?.length);
    console.log('API key provided:', !!apiKey);

    // Validate inputs
    if (!message) {
      console.error('No message provided');
      return new Response(JSON.stringify({ 
        error: 'Mesajul este necesar' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!apiKey) {
      console.error('No API key provided');
      return new Response(JSON.stringify({ 
        error: 'Cheia API este necesară' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Preparing request to Respell API...');

    // Create the request body for Respell API
    const respellRequestBody = {
      spellId: 'resp_6841cc306930819cbee23d3a2efe2ebe0e06ca3050f39bc8',
      inputs: {
        message: message
      }
    };

    console.log('Request body prepared, making API call...');

    // Make request to Respell API with proper headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await fetch('https://api.respell.ai/v1/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify(respellRequestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Network error calling Respell API:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({ 
          error: 'Cererea a expirat. Încercați din nou.' 
        }), {
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Eroare de rețea. Verificați conexiunea și încercați din nou.' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Respell API response status:', response.status);
    console.log('Respell API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Respell API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      let errorMessage = 'Eroare necunoscută de la serviciul AI.';
      
      if (response.status === 401) {
        errorMessage = 'Cheie API Respell invalidă. Verificați configurația.';
      } else if (response.status === 429) {
        errorMessage = 'Prea multe cereri. Încercați din nou într-un minut.';
      } else if (response.status >= 500) {
        errorMessage = 'Serviciul Respell nu este disponibil momentan.';
      } else if (response.status === 400) {
        errorMessage = 'Cerere invalidă către serviciul AI.';
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse response
    let data;
    try {
      data = await response.json();
      console.log('Respell API Response parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse Respell API response:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Răspuns invalid de la serviciul AI.' 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the response from the AI
    let aiResponse = '';
    
    if (data.outputs?.response) {
      aiResponse = data.outputs.response;
    } else if (data.outputs?.message) {
      aiResponse = data.outputs.message;
    } else if (data.response) {
      aiResponse = data.response;
    } else if (data.message) {
      aiResponse = data.message;
    } else if (data.result) {
      aiResponse = data.result;
    } else if (typeof data === 'string') {
      aiResponse = data;
    } else {
      console.log('Unexpected response structure:', JSON.stringify(data, null, 2));
      aiResponse = 'Ne pare rău, nu am putut genera un răspuns în formatul așteptat.';
    }

    console.log('AI response extracted successfully, length:', aiResponse.length);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error in chat-with-ai function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Ne pare rău, a apărut o eroare neașteptată. Încercați din nou.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
