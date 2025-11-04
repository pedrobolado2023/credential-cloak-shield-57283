import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import ResetSenha from "./pages/ResetSenha";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/reset-senha" element={<ResetSenha />} />
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/dashboard/:hotelId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/gerenciar-usuarios" element={<ProtectedRoute requireAdmin><GerenciarUsuarios /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
