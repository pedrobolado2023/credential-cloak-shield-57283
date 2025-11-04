import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Search, UserPlus, Edit, Trash2 } from 'lucide-react';

interface Usuario {
  id: number;
  email: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  hoteis: string[];
}

export default function GerenciarUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('listar-usuarios');
      
      if (error) throw error;
      
      if (data.success) {
        setUsuarios(data.usuarios);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(u => 
    u.email.toLowerCase().includes(busca.toLowerCase()) ||
    u.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const hoteisList = ['hotel-nacional', 'hotel-enjoy', 'hotel-viver', 'hotel-nacional-ocupacao', 'rds-hotel-nacional'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f3f5] to-[#d9e2ec] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#333]">Gerenciar Usuários</h1>
          <Button
            onClick={() => navigate('/menu')}
            variant="outline"
            className="bg-[#444] text-white hover:bg-[#555]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por email ou nome..."
              className="pl-10"
            />
          </div>
          <Button className="bg-[#2a7f62] hover:bg-[#248159]">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#2a7f62] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Hotéis</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">{usuario.email}</td>
                    <td className="px-4 py-3">{usuario.nome || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        usuario.tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {usuario.hoteis?.map(hotel => (
                          <span key={hotel} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {hotel}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
