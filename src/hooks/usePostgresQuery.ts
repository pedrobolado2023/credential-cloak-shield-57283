import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface QueryResult {
  data: any[] | null;
  loading: boolean;
  error: string | null;
}

export const usePostgresQuery = () => {
  const [result, setResult] = useState<QueryResult>({
    data: null,
    loading: false,
    error: null
  });

  const executeQuery = async (query: string, params?: any[]) => {
    setResult({ data: null, loading: true, error: null });

    try {
      const { data, error } = await supabase.functions.invoke('query-postgres', {
        body: { query, params }
      });

      if (error) throw error;

      if (data.success) {
        setResult({ data: data.data, loading: false, error: null });
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao executar query';
      setResult({ data: null, loading: false, error: errorMessage });
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  };

  return { ...result, executeQuery };
};
