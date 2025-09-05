import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import Index from "./pages/Index";
import ClientManagement from "./pages/ClientManagement";
import StaffManagement from "./pages/StaffManagement";
import Schedule from "./pages/Schedule";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Lazy load customer profile page
const CustomerProfile = lazy(() => import("./features/customers/pages/CustomerProfile"));

// Lazy load config pages
const ConfigLayout = lazy(() => import("./features/config/ConfigLayout"));
const ProceduresPage = lazy(() => import("./features/config/pages/ProceduresPage"));
const MatrixPage = lazy(() => import("./features/config/pages/MatrixPage"));
const PaymentsPage = lazy(() => import("./features/config/pages/PaymentsPage"));
const CombosPage = lazy(() => import("./features/config/pages/CombosPage"));
const OperationPage = lazy(() => import("./features/config/pages/OperationPage"));
const PermissionsPage = lazy(() => import("./features/config/pages/PermissionsPage"));

// Skeleton page component for Suspense
const SkeletonPage = () => (
  <div className="min-h-screen bg-gradient-background">
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-32 mb-6"></div>
        <div className="bg-card rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
              <div className="h-3 bg-muted rounded w-36"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded w-64"></div>
          <div className="bg-card rounded-lg p-6 h-64"></div>
        </div>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/clientes/:id" element={
              <Suspense fallback={<SkeletonPage />}>
                <CustomerProfile />
              </Suspense>
            } />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Config routes */}
            <Route path="/config" element={
              <Suspense fallback={<SkeletonPage />}>
                <ConfigLayout />
              </Suspense>
            }>
              <Route index element={<Navigate to="procedimentos" replace />} />
              <Route path="procedimentos" element={
                <Suspense fallback={<SkeletonPage />}>
                  <ProceduresPage />
                </Suspense>
              } />
              <Route path="matriz" element={
                <Suspense fallback={<SkeletonPage />}>
                  <MatrixPage />
                </Suspense>
              } />
              <Route path="pagamentos" element={
                <Suspense fallback={<SkeletonPage />}>
                  <PaymentsPage />
                </Suspense>
              } />
              <Route path="combos" element={
                <Suspense fallback={<SkeletonPage />}>
                  <CombosPage />
                </Suspense>
              } />
              <Route path="operacao" element={
                <Suspense fallback={<SkeletonPage />}>
                  <OperationPage />
                </Suspense>
              } />
              <Route path="permissoes" element={
                <Suspense fallback={<SkeletonPage />}>
                  <PermissionsPage />
                </Suspense>
              } />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
