import { stringify } from 'querystring';

import type { Period } from '@/schemaValidations/common.schema';
import type { DashboardIndicatorRes } from '@/schemaValidations/indicator.schema';

import http from '@/lib/http';

const prefix = '/indicators';

export const indicatorApiRequest = {
  getDashboardIndicators: ({ fromDate = new Date(), toDate = new Date() }: Period) =>
    http.get<DashboardIndicatorRes>(`${prefix}/dashboard?` + stringify({ fromDate: fromDate.toISOString(), toDate: toDate.toISOString() }))
};
