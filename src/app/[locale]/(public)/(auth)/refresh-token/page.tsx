import { Suspense } from 'react';

import RefreshToken from '@/app/[locale]/(public)/(auth)/refresh-token/refresh-token';

export default function page() {
  return (
    <Suspense>
      <RefreshToken />
    </Suspense>
  );
}
