import { dishApiRequets } from '@/app/apiRequests/dish';
import { UpdateDish } from '@/schemaValidations/dish.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useDishListQuery = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: dishApiRequets.getAll
  });
};

export const useDishQuery = ({ id, enabled }: { id: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['dish', id],
    queryFn: () => dishApiRequets.getById(id),
    enabled
  });
};

export const useCreateDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishApiRequets.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes']
      });
    }
  });
};

export const useUpdateDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDish & { id: string }) => dishApiRequets.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes']
      });
    }
  });
};

export const useDeleteDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishApiRequets.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dishes']
      });
    }
  });
};

export const useDishGroupQuery = () => {
  return useQuery({
    queryKey: ['dish-groups'],
    queryFn: dishApiRequets.getGroups
  });
};

export const useCreateDishGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishApiRequets.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dish-groups']
      });
    }
  });
};
