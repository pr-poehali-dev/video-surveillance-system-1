
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><Dashboard /></div></>} />
          <Route path="/monitoring" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><Monitoring /></div></>} />
          <Route path="/ord" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><ORD /></div></>} />
          <Route path="/layouts" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><Layouts /></div></>} />
          <Route path="/reports" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><Reports /></div></>} />
          <Route path="/photo-archive" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><PhotoArchive /></div></>} />
          <Route path="/parameters" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><Parameters /></div></>} />
          <Route path="/viss" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><VISS /></div></>} />
          <Route path="/camera-registry" element={<><Header /><Navigation /><div className="container mx-auto px-4 py-6"><CameraRegistry /></div></>} />
          <Route path="/old" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;