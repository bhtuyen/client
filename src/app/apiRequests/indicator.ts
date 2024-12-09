import http from '@/lib/http';
import { Period } from '@/schemaValidations/common.schema';
import { DashboardIndicatorRes } from '@/schemaValidations/indicator.schema';

import { stringify } from 'querystring';

const prefix = '/indicators';

export const indicatorApiRequest = {
  getDashboardIndicators: ({ fromDate = new Date(), toDate = new Date() }: Period) =>
    http.get<DashboardIndicatorRes>(`${prefix}/dashboard?` + stringify({ fromDate: fromDate.toISOString(), toDate: toDate.toISOString() }))
};
