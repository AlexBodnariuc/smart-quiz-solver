
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/pages/Index';

const RESPELL_API_KEY = 'resp_6841cc306930819cbee23d3a2efe2ebe0e06ca3050f39bc8';

export const useChatService = () => {
  const sendMessage = async (message: string, question: Question, isInitial = false) => {
    const prompt = isInitial ? 
      `Întrebarea: ${question.text}

Variante de răspuns:
${question.variants.map((variant, index) => `${String.fromCharCode(65 + index)}. ${variant}`).join('\n')}

${question.explanation ? `Explicația existentă: ${question.explanation}` : ''}

Te rog explică-mi mai detaliat această întrebare și conceptele din spatele ei.` 
      : message;

    console.log('Sending message via Supabase edge function');

    const { data, error } = await supabase.functions.invoke('chat-with-ai', {
      body: {
        message: prompt,
        apiKey: RESPELL_API_KEY
      }
    });

    console.log('Supabase edge function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Eroare în comunicarea cu serviciul AI');
    }

    if (data?.error) {
      console.error('API error from edge function:', data.error);
      throw new Error(data.error);
    }

    return data?.response || 'Ne pare rău, nu am primit un răspuns valid de la AI.';
  };

  return { sendMessage };
};
