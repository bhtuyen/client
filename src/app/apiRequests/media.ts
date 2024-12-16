import type { UploadImageRes } from '@/schemaValidations/media.schema';

import http from '@/lib/http';

const mediaApiRequest = {
  upload: (formData: FormData) => http.post<UploadImageRes>('/media/upload', formData)
};

export default mediaApiRequest;
