import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    console.log('Solicitação de reset de senha para:', email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se usuário existe
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (!usuario) {
      // Por segurança, não informar se email existe ou não
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Se o email existir, você receberá instruções' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Gerar token
    const token = generateToken();
    const expiraEm = new Date(Date.now() + 3600000); // 1 hora

    // Inserir token
    await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        token,
        expira_em: expiraEm.toISOString()
      });

    console.log('Token de reset gerado para:', email);

    // Em produção, envie o email aqui
    // Por enquanto, apenas logue o token (NÃO FAÇA ISSO EM PRODUÇÃO!)
    console.log('Token de reset:', token);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Instruções enviadas para o email',
        // REMOVER EM PRODUÇÃO:
        token 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao solicitar reset:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
