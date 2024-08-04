import http from '@/lib/http';

const revalidateApiRequest = {
  revalidateTag: (tag: string) =>
    http.get(`/api/revalidate?tag=${tag}`, {
      baseUrl: ''
    })
};

export default revalidateApiRequest;
