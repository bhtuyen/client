import guestApiRequest from '@/app/apiRequests/guest';
import { cookies } from 'next/headers';

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
    const result = await guestApiRequest.sLogout({ accessToken, refreshToken });
    return Response.json(result.payload);
  } catch (error) {
    return Response.json({ message: 'Unauthorized from server backend' }, { status: 200 });
  }
}
