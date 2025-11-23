// src/hooks/useReports.tsx
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export const useDashboardReport = () => {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const data = await apiFetch('/reports/dashboard');
      return data;
    },
  });
};

export const useFeeCollectionReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'fee-collection', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const data = await apiFetch(`/reports/fee-collection?${params.toString()}`);
      return data;
    },
    enabled: !!startDate && !!endDate, // Only fetch when dates are provided
  });
};

export const useOutstandingDuesReport = () => {
  return useQuery({
    queryKey: ['reports', 'outstanding-dues'],
    queryFn: async () => {
      const data = await apiFetch('/reports/outstanding-dues');
      return data;
    },
  });
};

export const useExpenseReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'expenses', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const data = await apiFetch(`/reports/expenses?${params.toString()}`);
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const usePayrollReport = (month?: string) => {
  return useQuery({
    queryKey: ['reports', 'payroll', month],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      const data = await apiFetch(`/reports/payroll?${params.toString()}`);
      return data;
    },
  });
};

export const useIncomeExpenseReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['reports', 'income-expense', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const data = await apiFetch(`/reports/income-expense?${params.toString()}`);
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
};