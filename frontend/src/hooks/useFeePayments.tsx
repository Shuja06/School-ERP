// src/hooks/useFeePayments.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export const useFeePayments = () => {
  return useQuery({
    queryKey: ['fee_payments'],
    queryFn: async () => {
      const data = await apiFetch('/fees/payments');
      return data;
    },
  });
};

export const useCreateFeePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPayment: any) => apiFetch('/fees/payments', {
      method: 'POST',
      body: JSON.stringify(newPayment),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_payments'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });
};

export const useUpdateFeePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => apiFetch(`/fees/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_payments'] });
      toast.success('Payment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });
};

export const useDeleteFeePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/fees/payments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_payments'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });
};