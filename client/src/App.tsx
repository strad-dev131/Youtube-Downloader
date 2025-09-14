import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ApiDocs from "@/pages/api-docs";
import TelegramGuide from "@/pages/telegram-guide";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/telegram-guide" component={TelegramGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
