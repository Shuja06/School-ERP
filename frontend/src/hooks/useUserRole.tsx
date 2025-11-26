// src/hooks/useUserRole.tsx - REPLACE ENTIRE FILE
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

export type UserRole = "admin" | "accountant" | "teacher" | "principal" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
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
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { role, loading };
};