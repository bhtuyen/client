import { indicatorApiRequest } from '@/app/apiRequests/indicator';
import { Period } from '@/schemaValidations/common.schema';
import { useQuery } from '@tanstack/react-query';

export const useIndicatorQuery = (queryParam: Period) =>
  useQuery({
    queryKey: ['indicators', queryParam],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParam)
  });
