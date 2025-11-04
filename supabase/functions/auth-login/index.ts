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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar usuário
    const { data: queryData, error: queryError } = await supabase.functions.invoke('query-postgres', {
      body: {
        query: 'SELECT id, email, senha, nome, tipo, ativo FROM usuarios WHERE email = $1',
        params: [email]
      }
    });

    if (queryError) throw queryError;

    if (!queryData.success || !queryData.data || queryData.data.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const usuario = queryData.data[0];

    if (!usuario.ativo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário inativo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Para simplicidade, vamos fazer comparação direta (em produção, use bcrypt)
    if (usuario.senha !== senha) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha incorreta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Buscar hotéis do usuário
    const { data: hoteisData } = await supabase.functions.invoke('query-postgres', {
      body: {
        query: 'SELECT hotel FROM usuario_hoteis WHERE usuario_id = $1',
        params: [usuario.id]
      }
    });

    const hoteis = hoteisData?.success ? hoteisData.data.map((h: any) => h.hotel) : [];

    const userData = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
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
