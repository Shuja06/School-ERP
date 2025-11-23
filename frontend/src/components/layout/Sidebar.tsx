import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  TrendingDown,
  Users,
  BarChart3,
  Settings,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SidebarProps {
  userRole: string;
}

const Sidebar = ({ userRole }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "accountant", "cashier", "auditor"] },
    { name: "Students", href: "/students", icon: GraduationCap, roles: ["admin", "accountant"] },
    { name: "Staff", href: "/staff", icon: Users, roles: ["admin", "accountant"] },
    { name: "Fee Management", href: "/fees", icon: DollarSign, roles: ["admin", "accountant", "cashier"] },
    { name: "Billing & Invoices", href: "/billing", icon: FileText, roles: ["admin", "accountant"] },
    { name: "Expenses", href: "/expenses", icon: TrendingDown, roles: ["admin", "accountant"] },
    { name: "Payroll", href: "/payroll", icon: Users, roles: ["admin", "accountant"] },
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ["admin", "accountant", "auditor"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">School ERP</h2>
            <p className="text-xs text-sidebar-foreground/60">Accounts Module</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3 px-3">
          <p className="text-xs font-medium text-sidebar-foreground/60">Logged in as</p>
          <p className="text-sm font-medium truncate">{localStorage.getItem("userEmail")}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
