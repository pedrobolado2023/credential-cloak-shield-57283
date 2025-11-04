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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os usuários
    const { data: queryData, error: queryError } = await supabase.functions.invoke('query-postgres', {
      body: {
        query: 'SELECT id, email, nome, tipo, ativo FROM usuarios ORDER BY email',
        params: []
      }
    });

    if (queryError) throw queryError;

    if (!queryData.success) {
      throw new Error(queryData.error || 'Erro ao buscar usuários');
    }

    const usuarios = queryData.data;

    // Buscar hotéis de cada usuário
    const usuariosComHoteis = await Promise.all(
      usuarios.map(async (usuario: any) => {
        const { data: hoteisData } = await supabase.functions.invoke('query-postgres', {
          body: {
            query: 'SELECT hotel FROM usuario_hoteis WHERE usuario_id = $1',
            params: [usuario.id]
          }
        });

        const hoteis = hoteisData?.success ? hoteisData.data.map((h: any) => h.hotel) : [];

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
