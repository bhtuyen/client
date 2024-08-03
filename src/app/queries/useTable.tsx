import { tableApiRequets } from '@/app/apiRequests/table';
import { UpdateTableBodyType } from '@/schemaValidations/table.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useTableListQuery = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tableApiRequets.getAll
  });
};

export const useTableQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['table', id],
    queryFn: () => tableApiRequets.getById(id),
    enabled
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
    mutationFn: ({ id, ...body }: UpdateTableBodyType & { id: number }) => tableApiRequets.update(id, body),
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
