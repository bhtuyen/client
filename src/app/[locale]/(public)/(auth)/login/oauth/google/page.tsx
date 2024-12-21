import { Suspense } from 'react';

import OauthGoogle from '@/app/[locale]/(public)/(auth)/login/oauth/google/oauth-google';

export default function Page() {
  return (
    <Suspense>
      <OauthGoogle />
    </Suspense>
  );
}
