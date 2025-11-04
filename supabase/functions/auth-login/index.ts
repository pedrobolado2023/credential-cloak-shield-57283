import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, senha } = await req.json();

    console.log('Tentando login para:', email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuário
    const { data: usuarios, error: queryError } = await supabase
      .from('usuarios')
      .select('id, email, senha, nome, tipo, ativo')
      .eq('email', email)
      .single();

    if (queryError || !usuarios) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (!usuarios.ativo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário inativo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Comparação direta de senha (em produção, use bcrypt)
    if (usuarios.senha !== senha) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha incorreta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Buscar hotéis do usuário
    const { data: hoteisData } = await supabase
      .from('usuario_hoteis')
      .select('hotel')
      .eq('usuario_id', usuarios.id);

    const hoteis = hoteisData?.map((h) => h.hotel) || [];

    const userData = {
      id: usuarios.id,
      email: usuarios.email,
      nome: usuarios.nome,
      tipo: usuarios.tipo,
      hoteis
    };

    console.log('Login bem-sucedido para:', email);

    return new Response(
      JSON.stringify({ success: true, user: userData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Erro no login:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
