import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen, Users, TrendingUp, BarChart3, Clock, DollarSign } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/admin/dashboard");
    }
  }, [user, setLocation]);

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Easily manage student records with complete CRUD operations",
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Mark and monitor daily attendance with percentage calculations",
    },
    {
      icon: BarChart3,
      title: "Grades & Exams",
      description: "Create exams, enter marks, and track student performance",
    },
    {
      icon: DollarSign,
      title: "Fee Management",
      description: "Track payments, manage dues, and view payment history",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "View comprehensive statistics and performance charts",
    },
    {
      icon: BookOpen,
      title: "Timetable Management",
      description: "Create and manage weekly class schedules with ease",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-accent">StuManage</div>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-foreground">
          School Management System
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Streamline your school operations with StuManage - a comprehensive
          solution for managing students, attendance, grades, and fees.
        </p>
        <Button
          size="lg"
          onClick={() => (window.location.href = getLoginUrl())}
          className="gap-2"
        >
          Get Started
        </Button>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Powerful Features
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-background p-6 transition-all hover:shadow-lg"
                >
                  <div className="mb-4 inline-block rounded-lg bg-accent/10 p-3">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h2 className="mb-6 text-3xl font-bold text-foreground">
          Ready to Transform Your School?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join thousands of schools using StuManage to streamline their operations
        </p>
        <Button
          size="lg"
          onClick={() => (window.location.href = getLoginUrl())}
        >
          Start Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2024 StuManage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
