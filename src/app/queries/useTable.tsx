import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateTable } from '@/schemaValidations/table.schema';

import { tableApiRequets } from '@/app/apiRequests/table';

export const useTableListQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tableApiRequets.getAll,
    enabled
  });
};

export const useTableQuery = (id: string) => {
  return useQuery({
    queryKey: ['table', id],
    queryFn: () => tableApiRequets.getById(id)
  });
};

export const useCreateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableApiRequets.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables']
      });
    }
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTable) => tableApiRequets.update(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables']
      });
    }
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tableApiRequets.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables']
      });
    }
  });
};
