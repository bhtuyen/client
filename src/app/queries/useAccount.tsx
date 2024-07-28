import accountApiRequest from "@/app/apiRequests/account";
import { UpdateEmployeeAccountBodyType } from "@/schemaValidations/account.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAccountMeQuery = () =>
  useQuery({
    queryKey: ["account-me"],
    queryFn: accountApiRequest.getMe,
  });

export const useUpdateMeMutation = () =>
  useMutation({
    mutationFn: accountApiRequest.updateMe,
  });

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: accountApiRequest.changePassword,
  });

export const useAccountListQuery = () =>
  useQuery({
    queryKey: ["accounts"],
    queryFn: accountApiRequest.list,
  });

export const useAccountQuery = (id: number) => {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => accountApiRequest.getEmployee(id),
  });
};

export const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountApiRequest.addEmployee,
    // Invalidate and refetch the data after the mutation
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
};
export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequest.updateEmployee(id, body),
    // Invalidate and refetch the data after the mutation
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
};
