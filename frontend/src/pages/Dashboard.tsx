// src/pages/Dashboard.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, CheckCircle, Users, UserCheck, FileText } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useFeePayments } from "@/hooks/useFeePayments";
import { useStudents } from "@/hooks/useStudents";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { role } = useUserRole();
  const { permissions, loading: permLoading } = usePermissions();
  const { data: payments = [], isLoading: paymentsLoading } = useFeePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const navigate = useNavigate();

  // Calculate stats
  const totalCollection = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const todayPayments = payments.filter(p => {
    const paymentDate = new Date(p.payment_date || p.created_at);
    const today = new Date();
    return paymentDate.toDateString() === today.toDateString();
  });
  const todayCollection = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const stats = [
    {
      title: "Today's Collection",
      value: `₹${todayCollection.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
      show: permissions.canManageFees,
    },
    {
      title: "Total Collection",
      value: `₹${totalCollection.toLocaleString()}`,
      change: "+8.2%",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      show: permissions.canManageFees,
    },
    {
      title: "Total Students",
      value: students.length.toString(),
      change: `${students.length} active`,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
      show: permissions.canViewStudents,
    },
    {
      title: "Recent Transactions",
      value: payments.length.toString(),
      change: `${todayPayments.length} today`,
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      show: permissions.canManageFees,
    },
  ];

  const quickActions = [
    {
      title: "Collect Fee",
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10 hover:bg-primary/20",
      onClick: () => navigate("/fees"),
      show: permissions.canManageFees,
    },
    {
      title: "Add Expense",
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10 hover:bg-accent/20",
      onClick: () => navigate("/expenses"),
      show: permissions.canManageExpenses,
    },
    {
      title: "View Students",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100 hover:bg-blue-200",
      onClick: () => navigate("/students"),
      show: permissions.canViewStudents,
    },
    {
      title: "View Staff",
      icon: UserCheck,
      color: "text-purple-600",
      bg: "bg-purple-100 hover:bg-purple-200",
      onClick: () => navigate("/staff"),
      show: permissions.canViewStaff,
    },
    {
      title: "View Dues",
      icon: AlertCircle,
      color: "text-warning",
      bg: "bg-warning/10 hover:bg-warning/20",
      onClick: () => navigate("/fees"),
      show: permissions.canManageFees,
    },
    {
      title: "Generate Report",
      icon: FileText,
      color: "text-foreground",
      bg: "bg-muted hover:bg-muted/80",
      onClick: () => navigate("/reports"),
      show: permissions.canViewReports,
    },
  ];

  if (paymentsLoading || studentsLoading || permLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground capitalize">
            Welcome back, {role || "user"}
          </p>
        </div>

        {/* Stats Cards - Only show if user has permission */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.filter(s => s.show).map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.color} flex items-center gap-1 mt-1`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions - Only for users with fee access */}
          {permissions.canManageFees && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No transactions yet
                    </p>
                  ) : (
                    payments.slice(0, 5).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {payment.students?.full_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.students?.class}-{payment.students?.section} • {payment.fee_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            ₹{Number(payment.amount).toLocaleString()}
                          </p>
                          <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions - Permission-based */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions
                  .filter(action => action.show)
                  .map((action) => (
                    <button
                      key={action.title}
                      onClick={action.onClick}
                      className={`p-6 ${action.bg} rounded-lg text-left transition-all transform hover:scale-105 cursor-pointer flex flex-col items-start`}
                    >
                      <action.icon className={`h-6 w-6 ${action.color} mb-3`} />
                      <p className="font-medium text-sm">{action.title}</p>
                    </button>
                  ))}
              </div>

              {/* Fallback if no actions (should never happen) */}
              {quickActions.filter(a => a.show).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No quick actions available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;