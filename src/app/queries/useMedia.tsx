import mediaApiRequest from '@/app/apiRequests/media';
import { useMutation } from '@tanstack/react-query';

export const useUploadMediaMutation = () =>
  useMutation({
    mutationFn: mediaApiRequest.upload
  });
