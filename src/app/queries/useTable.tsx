import { tablesApiRequets } from '@/app/apiRequests/table';
import { UpdateTableBodyType } from '@/schemaValidations/table.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useTableListQuery = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tablesApiRequets.getAll
  });
};

export const useTableQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['table', id],
    queryFn: () => tablesApiRequets.getById(id),
    enabled
  });
};

export const useCreateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tablesApiRequets.create,
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
    mutationFn: ({ id, ...body }: UpdateTableBodyType & { id: number }) => tablesApiRequets.update(id, body),
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
    mutationFn: tablesApiRequets.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tables']
      });
    }
  });
};
