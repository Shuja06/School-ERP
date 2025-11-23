// src/components/layout/DashboardLayout.tsx
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  // Simple localStorage-based auth check (no Supabase, no hooks needed)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const role = user ? JSON.parse(user).role : null;

  useEffect(() => {
    if (!token || !user) {
      navigate("/auth", { replace: true });
    }
  }, [token, user, navigate]);

  // Show loading spinner while checking localStorage (only on first render)
  if (token === null || user === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If no token/user → redirect was already triggered in useEffect
  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border flex-shrink-0 hidden md:block">
        <Sidebar userRole={role || "accountant"} />
      </aside>

      {/* Mobile sidebar would go here if you have one */}

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;