import { Suspense } from 'react';

import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
