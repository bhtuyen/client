import PublicLayout from '@/app/[locale]/(public)/layout';
import { defaultLocale } from '@/config';
import { unstable_setRequestLocale } from 'next-intl/server';

export default function GuestLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: {
    locale: string;
  };
}>) {
  unstable_setRequestLocale(locale);
  return (
    <PublicLayout modal={null} params={{ locale: defaultLocale }}>
      {children}
    </PublicLayout>
  );
}
