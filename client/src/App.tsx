import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PapersPage from "@/pages/papers-page";
import UploadPaper from "@/pages/upload-paper";
import AllPapersPage from "@/pages/all-papers";
import PaperGuidePage from "@/pages/paper-guide";
import ProfessorDashboard from "@/pages/professor-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { Footer } from "@/components/footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/papers/all" component={AllPapersPage} />
        <Route path="/guide" component={PaperGuidePage} />
        <ProtectedRoute path="/papers" component={PapersPage} />
        <ProtectedRoute path="/upload" component={UploadPaper} />
        <ProtectedRoute path="/professor" component={ProfessorDashboard} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;