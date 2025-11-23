// src/hooks/usePayroll.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export const usePayroll = () => {
  return useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const data = await apiFetch('/payroll');
      return data;
    },
  });
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPayroll: any) => apiFetch('/payroll', {
      method: 'POST',
      body: JSON.stringify(newPayroll),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create payroll record');
    },
  });
};

export const useUpdatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => apiFetch(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payroll record');
    },
  });
};

export const useDeletePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/payroll/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payroll record');
    },
  });
};

export const useProcessBulkPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => apiFetch('/payroll/bulk', {
      method: 'POST',
      body: JSON.stringify({ month }),
    }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success(`Payroll processed: ${data.created} records created`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process bulk payroll');
    },
  });
};