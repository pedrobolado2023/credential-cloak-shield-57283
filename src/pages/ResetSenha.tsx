import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logoYoc from '@/assets/logo-yoc.jpg';

export default function ResetSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Erro',
        description: 'Digite seu email',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('solicitar-reset-senha', {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Instruções enviadas para seu email!'
        });
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao solicitar reset de senha',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao solicitar reset de senha',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1a3a] to-[#1b2540] p-4">
      <div className="w-full max-w-md bg-[#1b2540] rounded-lg shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src={logoYoc} alt="YOC Inteligência" className="w-3/5 max-w-[220px] h-auto" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-[#00aaff] mb-6">
          Redefinir Senha
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white font-bold">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-[#2f3e5c] border-none text-white focus:border-[#00aaff] focus:bg-[#364b6e]"
              placeholder="Digite seu email"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff8c00] hover:bg-[#e07b00] text-white font-semibold"
          >
            {loading ? 'Enviando...' : 'Enviar Instruções'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#00aaff] hover:underline text-sm"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}
