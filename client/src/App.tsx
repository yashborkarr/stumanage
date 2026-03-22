import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import StudentManagement from "./pages/StudentManagement";
import AttendanceManagement from "./pages/AttendanceManagement";
import GradesManagement from "./pages/GradesManagement";
import FeeManagement from "./pages/FeeManagement";
import TimetableManagement from "./pages/TimetableManagement";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { Button } from "./components/ui/button";

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-accent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated and trying to access admin routes
  if (!user && location.startsWith("/admin")) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="mb-6 text-muted-foreground">Please log in to access the admin panel</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {user && (
        <>
          <Route path={"/admin/dashboard"} component={AdminDashboard} />
          <Route path={"/admin/students"} component={StudentManagement} />
          <Route path={"/admin/attendance"} component={AttendanceManagement} />
          <Route path={"/admin/grades"} component={GradesManagement} />
          <Route path={"/admin/fees"} component={FeeManagement} />
          <Route path={"/admin/timetable"} component={TimetableManagement} />
        </>
      )}
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
