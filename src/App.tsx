import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "./pages/NotFound";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AppLayout = lazy(() => import("./pages/AppLayout"));
const EditorLayout = lazy(() => import("./components/editor/EditorLayout"));
const ToolsBrowserPage = lazy(() => import("./pages/ToolsBrowserPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

// Dynamic tool loader
import { DynamicToolLoader } from "@/components/DynamicToolLoader";

const queryClient = new QueryClient();

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/editor" element={<EditorLayout />} />
              <Route path="/tools" element={<ToolsBrowserPage />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/trim" replace />} />
                <Route path=":toolId" element={<DynamicToolLoader />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
