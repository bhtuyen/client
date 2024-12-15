import { dishApiRequets } from '@/app/apiRequests/dish';
import { DishCategory } from '@/constants/enum';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useDishListQuery = () => {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: dishApiRequets.getAll
  });
};

export const useDishQuery = (id: string) => {
  return useQuery({
    queryKey: ['dish', id],
    queryFn: () => dishApiRequets.getById(id)
  });
};

export const useDishesChooseQuery = (body: { category: DishCategory; ignores?: string[] }, enabled: boolean) => {
  return useQuery({
    queryKey: ['dishes-choose', body],
    queryFn: () => dishApiRequets.getToChoose(body),
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
    mutationFn: dishApiRequets.update,
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
