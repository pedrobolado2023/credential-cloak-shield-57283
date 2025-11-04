import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

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
    const { query, params } = await req.json();

    // Log configuration (sem expor senha)
    const host = Deno.env.get('POSTGRES_HOST');
    const port = Deno.env.get('POSTGRES_PORT');
    const database = Deno.env.get('POSTGRES_DATABASE');
    const user = Deno.env.get('POSTGRES_USER');
    
    console.log('Tentando conectar ao PostgreSQL...');
    console.log(`Host: ${host}, Port: ${port}, Database: ${database}, User: ${user}`);

    if (!host || !database || !user) {
      throw new Error('Configuração de conexão incompleta. Verifique os secrets: POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER');
    }
    
    // Conecta ao PostgreSQL externo usando secrets
    const client = new Client({
      hostname: host,
      port: parseInt(port || '5432'),
      database: database,
      user: user,
      password: Deno.env.get('POSTGRES_PASSWORD'),
      tls: {
        enabled: true, // Habilitado por padrão para conexões externas
        caCertificates: undefined
      }
    });

    await client.connect();
    console.log('Connected to PostgreSQL successfully');

    // Executa a query
    const result = await client.queryObject(query, params || []);
    
    await client.end();
    console.log('Query executed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: result.rows,
        rowCount: result.rowCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in query-postgres function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
