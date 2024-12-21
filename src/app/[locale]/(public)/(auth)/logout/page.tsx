import { Suspense } from 'react';

import Logout from '@/app/[locale]/(public)/(auth)/logout/Logout';

export default function page() {
  return (
    <Suspense>
      <Logout />
    </Suspense>
  );
}
