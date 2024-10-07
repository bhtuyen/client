import http from '@/lib/http';
import { DashboardIndicatorQueryParamsType, DashboardIndicatorResType } from '@/schemaValidations/indicator.schema';
import { stringify } from 'querystring';

const prefix = '/indicators';

export const indicatorApiRequest = {
  getDashboardIndicators: ({ fromDate, toDate }: DashboardIndicatorQueryParamsType) =>
    http.get<DashboardIndicatorResType>(
      `${prefix}/dashboard?` + stringify({ fromDate: fromDate.toISOString(), toDate: toDate.toISOString() })
    )
};
