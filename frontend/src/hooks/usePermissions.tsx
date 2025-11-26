// src/hooks/usePermissions.tsx
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

export type UserRole = "admin" | "accountant" | "teacher" | "principal";

interface Permissions {
  // Students
  canViewStudents: boolean;
  canAddStudents: boolean;
  canEditStudents: boolean;
  canDeleteStudents: boolean;
  
  // Staff
  canViewStaff: boolean;
  canAddStaff: boolean;
  canEditStaff: boolean;
  canDeleteStaff: boolean;
  
  // Financial
  canManageFees: boolean;
  canManageBilling: boolean;
  canManageExpenses: boolean;
  canManagePayroll: boolean;
  
  // Reports & Settings
  canViewReports: boolean;
  canViewFinancialReports: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
}

export const usePermissions = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setRole(response.data.data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const getPermissions = (): Permissions => {
    if (!role) {
      return {
        canViewStudents: false,
        canAddStudents: false,
        canEditStudents: false,
        canDeleteStudents: false,
        canViewStaff: false,
        canAddStaff: false,
        canEditStaff: false,
        canDeleteStaff: false,
        canManageFees: false,
        canManageBilling: false,
        canManageExpenses: false,
        canManagePayroll: false,
        canViewReports: false,
        canViewFinancialReports: false,
        canManageSettings: false,
        canManageUsers: false,
      };
    }

    switch (role) {
      case "admin":
        return {
          canViewStudents: true,
          canAddStudents: true,
          canEditStudents: true,
          canDeleteStudents: true,
          canViewStaff: true,
          canAddStaff: true,
          canEditStaff: true,
          canDeleteStaff: true,
          canManageFees: true,
          canManageBilling: true,
          canManageExpenses: true,
          canManagePayroll: true,
          canViewReports: true,
          canViewFinancialReports: true,
          canManageSettings: true,
          canManageUsers: true,
        };

      case "principal":
        return {
          canViewStudents: true,
          canAddStudents: true,
          canEditStudents: true,
          canDeleteStudents: false, // Principal cannot delete
          canViewStaff: true,
          canAddStaff: true,
          canEditStaff: true,
          canDeleteStaff: false, // Principal cannot delete
          canManageFees: false, // View only
          canManageBilling: false, // View only
          canManageExpenses: false, // View only
          canManagePayroll: false, // View only
          canViewReports: true,
          canViewFinancialReports: true, // Can view but not modify
          canManageSettings: false,
          canManageUsers: false,
        };

      case "accountant":
        return {
          canViewStudents: true, // View only for fees
          canAddStudents: false,
          canEditStudents: false,
          canDeleteStudents: false,
          canViewStaff: true, // View only for payroll
          canAddStaff: false,
          canEditStaff: false,
          canDeleteStaff: false,
          canManageFees: true,
          canManageBilling: true,
          canManageExpenses: true,
          canManagePayroll: true,
          canViewReports: true,
          canViewFinancialReports: true,
          canManageSettings: false,
          canManageUsers: false,
        };

      case "teacher":
        return {
          canViewStudents: true, // Own classes only
          canAddStudents: false,
          canEditStudents: false,
          canDeleteStudents: false,
          canViewStaff: false,
          canAddStaff: false,
          canEditStaff: false,
          canDeleteStaff: false,
          canManageFees: false,
          canManageBilling: false,
          canManageExpenses: false,
          canManagePayroll: false,
          canViewReports: true, // Student reports only
          canViewFinancialReports: false,
          canManageSettings: false,
          canManageUsers: false,
        };

      default:
        return {
          canViewStudents: false,
          canAddStudents: false,
          canEditStudents: false,
          canDeleteStudents: false,
          canViewStaff: false,
          canAddStaff: false,
          canEditStaff: false,
          canDeleteStaff: false,
          canManageFees: false,
          canManageBilling: false,
          canManageExpenses: false,
          canManagePayroll: false,
          canViewReports: false,
          canViewFinancialReports: false,
          canManageSettings: false,
          canManageUsers: false,
        };
    }
  };

  return {
    role,
    loading,
    permissions: getPermissions(),
  };
};