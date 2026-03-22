import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, DollarSign, BookOpen } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery();

  // Sample data for charts
  const attendanceData = [
    { month: "Jan", percentage: 85 },
    { month: "Feb", percentage: 88 },
    { month: "Mar", percentage: 82 },
    { month: "Apr", percentage: 90 },
    { month: "May", percentage: 87 },
    { month: "Jun", percentage: 92 },
  ];

  const feeData = [
    { month: "Jan", paid: 45000, pending: 15000 },
    { month: "Feb", paid: 48000, pending: 12000 },
    { month: "Mar", paid: 50000, pending: 10000 },
    { month: "Apr", paid: 52000, pending: 8000 },
    { month: "May", paid: 55000, pending: 5000 },
    { month: "Jun", paid: 58000, pending: 2000 },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-accent"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here's your school's performance overview.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <Card className="stat-card stat-card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Paid Fees */}
          <Card className="stat-card stat-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fees Collected</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  ₹{(stats?.paidFeesAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Pending Fees */}
          <Card className="stat-card stat-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Fees</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats?.pendingFeesCount || 0}
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>

          {/* Total Exams */}
          <Card className="stat-card stat-card-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exams Conducted</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats?.totalExams || 0}
                </p>
              </div>
              <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                <BookOpen className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Trend */}
          <Card className="p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Fee Collection */}
          <Card className="p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">
              Fee Collection Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="paid" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-foreground">
            Quick Summary
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total Fees</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {stats?.totalFees || 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Paid Fees</p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.paidFeesCount || 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalFees
                  ? Math.round((stats.paidFeesCount / stats.totalFees) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
