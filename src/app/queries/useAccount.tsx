import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import accountApiRequest from '@/app/apiRequests/account';

export const useAccountMeQuery = () =>
  useQuery({
    queryKey: ['account-me'],
    queryFn: accountApiRequest.getMe
  });

export const useUpdateMeMutation = () =>
  useMutation({
    mutationFn: accountApiRequest.updateMe
  });

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: accountApiRequest.changePassword
  });

export const useAccountListQuery = () =>
  useQuery({
    queryKey: ['accounts'],
    queryFn: accountApiRequest.list
  });

export const useAccountQuery = (id: string) =>
  useQuery({
    queryKey: ['account', id],
    queryFn: () => accountApiRequest.getEmployee(id)
  });

export const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.addEmployee,
    // Invalidate and refetch the data after the mutation
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts']
      });
    }
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts']
      });
    }
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.updateEmployee,
    // Invalidate and refetch the data after the mutation
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts']
      });
    }
  });
};
