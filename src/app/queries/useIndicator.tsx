import { useQuery } from '@tanstack/react-query';

import type { Period } from '@/schemaValidations/common.schema';

import { indicatorApiRequest } from '@/app/apiRequests/indicator';

export const useIndicatorQuery = (queryParam: Period) =>
  useQuery({
    queryKey: ['indicators', queryParam],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParam)
  });
