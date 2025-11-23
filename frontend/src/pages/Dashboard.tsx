import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useFeePayments } from "@/hooks/useFeePayments";
import { useStudents } from "@/hooks/useStudents";

const Dashboard = () => {
  const { role } = useUserRole();
  const { data: payments = [], isLoading: paymentsLoading } = useFeePayments();
  const { data: students = [], isLoading: studentsLoading } = useStudents();

  // Calculate stats from real data
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
    },
    {
      title: "Total Collection",
      value: `₹${totalCollection.toLocaleString()}`,
      change: "+8.2%",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Students",
      value: students.length.toString(),
      change: `${payments.length} paid`,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Recent Transactions",
      value: payments.length.toString(),
      change: `${todayPayments.length} today`,
      icon: AlertCircle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  if (paymentsLoading || studentsLoading) {
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
          <p className="text-muted-foreground capitalize">Welcome back, {role || "user"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{payment.students?.full_name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.students?.class}-{payment.students?.section} • {payment.fee_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{Number(payment.amount).toLocaleString()}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                        Paid
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors">
                <DollarSign className="h-5 w-5 text-primary mb-2" />
                <p className="font-medium text-sm">Collect Fee</p>
              </button>
              <button className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg text-left transition-colors">
                <DollarSign className="h-5 w-5 text-accent mb-2" />
                <p className="font-medium text-sm">Add Expense</p>
              </button>
              <button className="p-4 bg-warning/10 hover:bg-warning/20 rounded-lg text-left transition-colors">
                <AlertCircle className="h-5 w-5 text-warning mb-2" />
                <p className="font-medium text-sm">View Dues</p>
              </button>
              <button className="p-4 bg-muted hover:bg-muted/80 rounded-lg text-left transition-colors">
                <CheckCircle className="h-5 w-5 text-foreground mb-2" />
                <p className="font-medium text-sm">Generate Report</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
