
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, aiId } = await req.json();

    console.log('Received request:', { message: message?.substring(0, 100), aiId });

    const respellApiKey = Deno.env.get('RESPELL_API_KEY');
    
    if (!respellApiKey) {
      console.error('RESPELL_API_KEY not found in environment variables');
      throw new Error('RESPELL_API_KEY not configured');
    }

    console.log('API key found, making request to Respell API...');

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    try {
      // Updated request body format for Respell API
      const requestBody = {
        spellId: aiId,
        inputs: {
          message: message
        }
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Make request to Respell API with updated headers
      const response = await fetch('https://api.respell.ai/v1/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${respellApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Respell API response status:', response.status);
      console.log('Respell API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Respell API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Return a more user-friendly error for different status codes
        if (response.status === 401) {
          throw new Error('Cheie API Respell invalidă. Verificați configurația.');
        } else if (response.status === 429) {
          throw new Error('Prea multe cereri. Încercați din nou într-un minut.');
        } else if (response.status >= 500) {
          throw new Error('Serviciul Respell nu este disponibil momentan.');
        } else {
          throw new Error(`Eroare API Respell: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Respell API Response:', JSON.stringify(data, null, 2));

      // Extract the response from the AI - check multiple possible response paths
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
        console.log('Unexpected response structure:', data);
        aiResponse = 'Ne pare rău, nu am putut genera un răspuns în formatul așteptat.';
      }

      console.log('Extracted AI response:', aiResponse);

      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      console.error('Fetch error details:', {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack
      });
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out');
        throw new Error('Cererea a expirat. Încercați din nou.');
      }
      
      // Check for specific network errors
      if (fetchError.message.includes('error sending request')) {
        console.error('Network connectivity issue');
        throw new Error('Probleme de conectivitate la serviciul AI. Verificați conexiunea la internet.');
      }
      
      console.error('Network error:', fetchError);
      throw new Error('Nu s-a putut conecta la serviciul AI. Verificați configurația.');
    }

  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Ne pare rău, a apărut o eroare în comunicarea cu AI-ul.',
      details: error.name || 'UnknownError'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
