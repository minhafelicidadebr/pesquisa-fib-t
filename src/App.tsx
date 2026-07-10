import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppSidebarRail } from "@/components/layout/AppSidebarRail";
import Index from "./pages/Index.tsx";
import SegmentDeck from "./pages/SegmentDeck.tsx";
import FibiaDemo from "./pages/FibiaDemo.tsx";
import EvidenceBank from "./pages/EvidenceBank.tsx";
import Auth from "./pages/Auth.tsx";
import Profile from "./pages/Profile.tsx";
import Diagnostico from "./pages/Diagnostico.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NR1Brasil from "./pages/NR1Brasil.tsx";
import Academy from "./pages/Academy.tsx";
import AcademyDriver from "./pages/AcademyDriver.tsx";
import AcademyConstelacao from "./pages/AcademyConstelacao.tsx";
import Intervencoes from "./pages/Intervencoes.tsx";
import Relatorios from "./pages/Relatorios.tsx";
import PdfIntelligence from "./pages/PdfIntelligence.tsx";
import NR1Hub from "./pages/NR1Hub.tsx";
import NR1Chat from "./pages/NR1Chat.tsx";
import Matriz from "./pages/Matriz.tsx";
import Apresentacoes from "./pages/Apresentacoes.tsx";
import EvidenciaCientifica from "./pages/EvidenciaCientifica.tsx";
import EmpresaConfigurar from "./pages/EmpresaConfigurar.tsx";
import EmpresaConvites from "./pages/EmpresaConvites.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Jornada from "./pages/Jornada.tsx";
import Planos from "./pages/Planos.tsx";
import Pesquisa from "./pages/Pesquisa.tsx";
import SeloNR1 from "./pages/SeloNR1.tsx";
import SeloEmbed from "./pages/SeloEmbed.tsx";
import SeloCertificado from "./pages/SeloCertificado.tsx";
import NR1Signatarios from "./pages/NR1Signatarios.tsx";
import NR1Contador from "./pages/NR1Contador.tsx";
import ConsultoriaDashboard from "./pages/ConsultoriaDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppSidebarRail />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apresentacoes" element={<Apresentacoes />} />
            <Route path="/apresentacoes/:segment" element={<SegmentDeck />} />
            <Route path="/matriz" element={<Matriz />} />
            <Route path="/evidencia-cientifica" element={<EvidenciaCientifica />} />
            <Route path="/fibia" element={<FibiaDemo />} />
            <Route path="/evidencias" element={<EvidenceBank />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/academy/constelacao" element={<AcademyConstelacao />} />
            <Route path="/academy/:slug" element={<AcademyDriver />} />
            <Route path="/intervencoes" element={<Intervencoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/relatorios/pdf-intelligence" element={<PdfIntelligence />} />
            <Route path="/nr1" element={<NR1Hub />} />
            <Route path="/nr1-brasil" element={<NR1Brasil />} />
            <Route path="/nr1/avaliacao" element={<NR1Chat />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/pesquisa" element={<Pesquisa />} />
            <Route path="/selo/:id" element={<SeloNR1 />} />
            <Route path="/selo/:id/embed" element={<SeloEmbed />} />
            <Route path="/selo/:id/certificado" element={<SeloCertificado />} />
            <Route path="/nr1-brasil/signatarios" element={<NR1Signatarios />} />
            <Route path="/nr1-brasil/contador/embed" element={<NR1Contador />} />
            <Route path="/consultoria" element={<ConsultoriaDashboard />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jornada"
              element={
                <ProtectedRoute>
                  <Jornada />
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresa/convites"
              element={
                <ProtectedRoute>
                  <EmpresaConvites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/empresa/configurar"
              element={
                <ProtectedRoute>
                  <EmpresaConfigurar />
                </ProtectedRoute>
              }
            />
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
