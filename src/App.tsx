
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import ORD from "./pages/ORD";
import Layouts from "./pages/Layouts";
import Reports from "./pages/Reports";
import PhotoArchive from "./pages/PhotoArchive";
import Parameters from "./pages/Parameters";
import VISS from "./pages/VISS";
import CameraRegistry from "./pages/CameraRegistry";
import AppLayout from "./components/AppLayout";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
          <Route path="/monitoring" element={<AuthenticatedLayout containerClassName="container mx-auto px-0 py-0" permission="monitoring"><Monitoring /></AuthenticatedLayout>} />
          <Route path="/ord" element={<AuthenticatedLayout permission="ord"><ORD /></AuthenticatedLayout>} />
          <Route path="/layouts" element={<AuthenticatedLayout permission="layouts"><Layouts /></AuthenticatedLayout>} />
          <Route path="/reports" element={<AuthenticatedLayout permission="reports"><Reports /></AuthenticatedLayout>} />
          <Route path="/photo-archive" element={<AuthenticatedLayout permission="photoArchive"><PhotoArchive /></AuthenticatedLayout>} />
          <Route path="/parameters" element={<AuthenticatedLayout permission="parameters"><Parameters /></AuthenticatedLayout>} />
          <Route path="/viss" element={<AuthenticatedLayout permission="viss"><VISS /></AuthenticatedLayout>} />
          <Route path="/camera-registry" element={<AuthenticatedLayout permission="cameraRegistry"><CameraRegistry /></AuthenticatedLayout>} />
          <Route path="/old" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;