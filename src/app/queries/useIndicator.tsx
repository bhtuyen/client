import { indicatorApiRequest } from '@/app/apiRequests/indicator';
import { DashboardIndicatorQueryParamsType } from '@/schemaValidations/indicator.schema';
import { useQuery } from '@tanstack/react-query';

export const useIndicatorQuery = (queryParam: DashboardIndicatorQueryParamsType) =>
  useQuery({
    queryKey: ['indicators', queryParam],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParam)
  });
