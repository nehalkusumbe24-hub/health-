import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert Ayurvedic health advisor assistant. Your role is to:
1. Provide accurate information about Ayurvedic principles, doshas (Vata, Pitta, Kapha), and natural remedies
2. Answer questions about diet, lifestyle, yoga, and pranayama practices
3. Offer general wellness advice based on Ayurvedic wisdom
4. Be compassionate, supportive, and culturally sensitive
5. Always remind users that for serious health concerns, they should consult with a qualified Ayurvedic doctor

Important guidelines:
- Never diagnose medical conditions
- Provide general guidance only
- Encourage users to take assessments or consult doctors for personalized advice
- Use simple, accessible language
- Be warm and encouraging

If a user asks about serious symptoms or complex health issues, politely suggest they:
1. Complete a health assessment in the app
2. Consult with one of our verified Ayurvedic doctors for personalized guidance`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    const shouldEscalate = aiResponse.toLowerCase().includes('consult') || 
                          aiResponse.toLowerCase().includes('doctor') ||
                          message.toLowerCase().includes('serious') ||
                          message.toLowerCase().includes('pain') ||
                          message.toLowerCase().includes('emergency');

    return new Response(
      JSON.stringify({
        response: aiResponse,
        message: aiResponse,
        shouldEscalate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
