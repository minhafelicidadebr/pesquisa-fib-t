import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import SegmentDeck from "./pages/SegmentDeck.tsx";
import FibiaDemo from "./pages/FibiaDemo.tsx";
import EvidenceBank from "./pages/EvidenceBank.tsx";
import Auth from "./pages/Auth.tsx";
import Profile from "./pages/Profile.tsx";
import Diagnostico from "./pages/Diagnostico.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Academy from "./pages/Academy.tsx";
import Intervencoes from "./pages/Intervencoes.tsx";
import Relatorios from "./pages/Relatorios.tsx";
import NR1Hub from "./pages/NR1Hub.tsx";
import NR1Chat from "./pages/NR1Chat.tsx";
import Matriz from "./pages/Matriz.tsx";
import Apresentacoes from "./pages/Apresentacoes.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apresentacoes" element={<Apresentacoes />} />
            <Route path="/apresentacoes/:segment" element={<SegmentDeck />} />
            <Route path="/matriz" element={<Matriz />} />
            <Route path="/fibia" element={<FibiaDemo />} />
            <Route path="/evidencias" element={<EvidenceBank />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/intervencoes" element={<Intervencoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/nr1" element={<NR1Hub />} />
            <Route path="/nr1/avaliacao" element={<NR1Chat />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
