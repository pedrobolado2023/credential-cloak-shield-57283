import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import logoYoc from '@/assets/logo-yoc.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/menu');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await login(email, senha);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Sucesso',
        description: 'Login realizado com sucesso!'
      });
      navigate('/menu');
    } else {
      toast({
        title: 'Erro',
        description: result.error || 'Email ou senha inválidos',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1a3a] to-[#1b2540] p-4">
      <div className="w-full max-w-md bg-[#1b2540] rounded-lg shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src={logoYoc} alt="YOC Inteligência" className="w-3/5 max-w-[220px] h-auto" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-[#00aaff] mb-6">
          Power BI
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

          <div>
            <Label htmlFor="senha" className="text-white font-bold">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 bg-[#2f3e5c] border-none text-white focus:border-[#00aaff] focus:bg-[#364b6e]"
              placeholder="Digite sua senha"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff8c00] hover:bg-[#e07b00] text-white font-semibold"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/reset-senha')}
            className="text-[#00aaff] hover:underline text-sm"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
}
