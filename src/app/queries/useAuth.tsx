import authApiRequest from "@/app/apiRequests/auth";
import { useMutation } from "@tanstack/react-query";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: authApiRequest.login,
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: authApiRequest.logout,
  });
