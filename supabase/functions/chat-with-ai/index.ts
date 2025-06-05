
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

    console.log('Sending message to AI:', { message, aiId });

    // Make request to the specific AI model
    const response = await fetch('https://api.respell.ai/v1/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESPELL_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spellId: aiId,
        inputs: {
          message: message
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', data);

    // Extract the response from the AI
    const aiResponse = data.outputs?.response || data.outputs?.message || 'Ne pare rău, nu am putut genera un răspuns.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: 'Ne pare rău, a apărut o eroare în comunicarea cu AI-ul.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
