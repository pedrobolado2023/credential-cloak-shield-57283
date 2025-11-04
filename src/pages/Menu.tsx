import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Menu() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hoteis = [
    { id: 'hotel-nacional', nome: 'Hotel Nacional', color: '#10183f' },
    { id: 'hotel-enjoy', nome: 'Hotel Enjoy', color: '#2a7f62' },
    { id: 'hotel-viver', nome: 'Viver Caldas', color: '#c85a3f' },
    { id: 'hotel-nacional-ocupacao', nome: 'Hotel Nacional Ocupação', color: '#4a5568' },
    { id: 'rds-hotel-nacional', nome: 'RDS Hotel Nacional', color: '#7c3aed' }
  ];

  const hoteisPermitidos = hoteis.filter(hotel => 
    user?.hoteis?.includes(hotel.id) || isAdmin
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f3f5] to-[#d9e2ec] p-4">
      {isAdmin && (
        <div className="absolute top-5 right-5">
          <Button
            onClick={() => navigate('/gerenciar-usuarios')}
            variant="outline"
            className="bg-[#444] text-white hover:bg-[#555] border-none shadow-lg"
          >
            Gerenciar Usuários
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center pt-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-4xl font-bold text-[#333] uppercase tracking-wider">
            Dashboard Power BI
          </h2>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="text-[#444] hover:text-[#e07b00]"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {hoteisPermitidos.map(hotel => (
            <Button
              key={hotel.id}
              onClick={() => navigate(`/dashboard/${hotel.id}`)}
              className="w-64 h-12 text-white font-semibold text-lg shadow-lg hover:transform hover:-translate-y-1 transition-all"
              style={{ backgroundColor: hotel.color }}
            >
              {hotel.nome}
            </Button>
          ))}
        </div>

        {hoteisPermitidos.length === 0 && (
          <p className="text-[#666] mt-8">
            Você não tem permissão para acessar nenhum hotel. Entre em contato com o administrador.
          </p>
        )}
      </div>
    </div>
  );
}
