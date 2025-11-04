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
    console.log('Listando usuários...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar todos os usuários
    const { data: usuarios, error: queryError } = await supabase
      .from('usuarios')
      .select('id, email, nome, tipo, ativo')
      .order('email');

    if (queryError) throw queryError;

    // Buscar hotéis de cada usuário
    const usuariosComHoteis = await Promise.all(
      (usuarios || []).map(async (usuario: any) => {
        const { data: hoteisData } = await supabase
          .from('usuario_hoteis')
          .select('hotel')
          .eq('usuario_id', usuario.id);

        const hoteis = hoteisData?.map((h: any) => h.hotel) || [];

        return {
          ...usuario,
          hoteis
        };
      })
    );

    console.log(`${usuariosComHoteis.length} usuários encontrados`);

    return new Response(
      JSON.stringify({ success: true, usuarios: usuariosComHoteis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
