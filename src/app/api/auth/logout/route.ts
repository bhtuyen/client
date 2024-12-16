import { cookies } from 'next/headers';

import authApiRequest from '@/app/apiRequests/auth';

export async function POST(request: Request) {
  const cookieStore = cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');

  if (!accessToken || !refreshToken) {
    return Response.json({ message: 'Unauthorized from next server' }, { status: 200 });
  }

  try {
    const result = await authApiRequest.sLogout({ accessToken, refreshToken });
    return Response.json(result.payload);
  } catch {
    return Response.json({ message: 'Unauthorized from server backend' }, { status: 200 });
  }
}
