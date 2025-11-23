// src/hooks/useFeeStructures.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export const useFeeStructures = () => {
  return useQuery({
    queryKey: ['fee_structures'],
    queryFn: async () => {
      const data = await apiFetch('/fees/structures');
      return data;
    },
  });
};

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newFee: any) => apiFetch('/fees/structures', {
      method: 'POST',
      body: JSON.stringify(newFee),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_structures'] });
      toast.success('Fee structure added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add fee structure');
    },
  });
};

export const useUpdateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => apiFetch(`/fees/structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_structures'] });
      toast.success('Fee structure updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update fee structure');
    },
  });
};

export const useDeleteFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/fees/structures/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee_structures'] });
      toast.success('Fee structure deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete fee structure');
    },
  });
};