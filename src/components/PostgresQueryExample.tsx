import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { usePostgresQuery } from '@/hooks/usePostgresQuery';
import { Loader2 } from 'lucide-react';

export const PostgresQueryExample = () => {
  const [query, setQuery] = useState('SELECT * FROM sua_tabela LIMIT 10');
  const { data, loading, error, executeQuery } = usePostgresQuery();

  const handleExecute = () => {
    executeQuery(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultar PostgreSQL Externo</CardTitle>
        <CardDescription>
          Execute queries seguras no seu banco PostgreSQL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">SQL Query</label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM tabela..."
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        <Button onClick={handleExecute} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Query
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="font-semibold">Erro:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {data && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              {data.length} registros encontrados
            </p>
            <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs font-mono">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
