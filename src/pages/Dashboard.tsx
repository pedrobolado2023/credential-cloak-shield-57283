import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const dashboardUrls: Record<string, string> = {
  'hotel-nacional': 'https://app.powerbi.com/view?r=eyJrIjoiZTZmMDU1NDEtODBhMi00MGU0LThlMmMtM2YxZjlmZDQ3MmQ3IiwidCI6IjFkZWI2YjIxLTNlYjktNGNiZC05NmFhLTExMWM0NTMyZjI3MCJ9',
  'hotel-enjoy': 'https://app.powerbi.com/view?r=eyJrIjoiMTFkYzQ3ZTItMmQ5MC00OTM4LWI2NmQtYzVhOGQ1NGJiMjQ0IiwidCI6IjFkZWI2YjIxLTNlYjktNGNiZC05NmFhLTExMWM0NTMyZjI3MCJ9',
  'hotel-viver': 'https://app.powerbi.com/view?r=eyJrIjoiNTIzOTdkMjgtYzNiYS00YWE3LWE2YzQtZmM0MTc3MDI3MmMxIiwidCI6IjFkZWI2YjIxLTNlYjktNGNiZC05NmFhLTExMWM0NTMyZjI3MCJ9',
  'hotel-nacional-ocupacao': 'https://app.powerbi.com/view?r=eyJrIjoiNTIzOTdkMjgtYzNiYS00YWE3LWE2YzQtZmM0MTc3MDI3MmMxIiwidCI6IjFkZWI2YjIxLTNlYjktNGNiZC05NmFhLTExMWM0NTMyZjI3MCJ9',
  'rds-hotel-nacional': 'https://app.powerbi.com/view?r=eyJrIjoiYjY5OWJlMDctN2UwZC00OTExLTkwNDMtZTM4OTg5ZGIzMzliIiwidCI6IjFkZWI2YjIxLTNlYjktNGNiZC05NmFhLTExMWM0NTMyZjI3MCJ9'
};

export default function Dashboard() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { user, isAdmin } = useAuth();

  if (!hotelId || !dashboardUrls[hotelId]) {
    return <Navigate to="/menu" replace />;
  }

  const hasPermission = isAdmin || user?.hoteis?.includes(hotelId);

  if (!hasPermission) {
    return <Navigate to="/menu" replace />;
  }

  return (
    <div className="w-full h-screen">
      <iframe
        src={dashboardUrls[hotelId]}
        className="w-full h-full border-none"
        allowFullScreen
        title={`Dashboard ${hotelId}`}
      />
    </div>
  );
}
