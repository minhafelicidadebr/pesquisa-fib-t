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
            <Route path="/apresentacoes" element={<Index />} />
            <Route path="/apresentacoes/:segment" element={<SegmentDeck />} />
            <Route path="/fibia" element={<FibiaDemo />} />
            <Route path="/evidencias" element={<EvidenceBank />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/intervencoes" element={<Intervencoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
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
