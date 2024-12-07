import http from '@/lib/http';
import { UploadImageRes } from '@/schemaValidations/media.schema';

const mediaApiRequest = {
  upload: (formData: FormData) => http.post<UploadImageRes>('/media/upload', formData)
};

export default mediaApiRequest;
