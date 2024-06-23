import accountApiRequest from "@/app/apiRequests/account";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAccountMeQuery = () =>
  useQuery({
    queryKey: ["account-me"],
    queryFn: accountApiRequest.getMe,
  });

export const useUpdateMeMutation = () =>
  useMutation({
    mutationFn: accountApiRequest.updateMe,
  });
