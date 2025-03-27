import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MwdSurvey from "@/pages/mwd-survey";
import WitsParameters from "@/pages/wits-parameters";
import DirectionalDrilling from "@/pages/directional-drilling";
import EmailAutomation from "@/pages/email-automation";
import WellInfo from "@/pages/well-info";
import WitsMappingPage from "@/pages/wits-mapping";
import AIOptimization from "@/pages/ai-optimization";
import AppHeader from "@/components/layout/AppHeader";
import AppNav from "@/components/layout/AppNav";
import { WellProvider } from "@/context/WellContext";
import { WitsProvider } from "@/context/WitsContext";
import { SurveyProvider } from "@/context/SurveyContext";
import { AIPredictionProvider } from "@/context/AIPredictionContext";
import { useEffect, useState } from "react";
import { witsClient } from "./lib/wits-client";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-background flex flex-col">
      <AppHeader />
      <AppNav />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={MwdSurvey} />
        <Route path="/wits-parameters" component={WitsParameters} />
        <Route path="/directional-drilling" component={DirectionalDrilling} />
        <Route path="/email-automation" component={EmailAutomation} />
        <Route path="/well-info" component={WellInfo} />
        <Route path="/wits-mapping" component={WitsMappingPage} />
        <Route path="/ai-optimization" component={AIOptimization} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket when the app loads
    witsClient.connect()
      .then(() => {
        setIsConnected(true);
      })
      .catch((error) => {
        console.error("Failed to connect to WebSocket:", error);
      });

    // Cleanup on unmount
    return () => {
      witsClient.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WellProvider>
        <WitsProvider>
          <SurveyProvider>
            <AIPredictionProvider>
              <Router />
              <Toaster />
            </AIPredictionProvider>
          </SurveyProvider>
        </WitsProvider>
      </WellProvider>
    </QueryClientProvider>
  );
}

export default App;
