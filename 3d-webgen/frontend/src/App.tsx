import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "@/components/auth/PrivateRoute";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <Routes>
        {/* Redireziona la root "/" verso /auth */}
        <Route path="/" element={<Navigate to="/auth" />} />
        {/* Pagina Login/Register */}
        <Route path="/auth" element={<AuthPage />} />
        {/* Pagina protetta, visibile solo se l'utente è loggato */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
          }
        />
        {/* Catch-all per 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
