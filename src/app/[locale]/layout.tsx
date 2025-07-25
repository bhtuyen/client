import '@/app/globals.css';
import { Inter as FontSans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';

import type { Locale } from '@/config';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import AppProvider from '@/components/app-provider';
import TAlterDialog from '@/components/t-alert-dialog';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { baseOpenGraph } from '@/shared-metadata';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
});

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'brand' });

  return {
    title: {
      template: `%s | ${t('title')}`,
      default: t('description')
    },
    openGraph: {
      ...baseOpenGraph
    }
  };
}
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: ReactNode;
  params: {
    locale: string;
  };
}>) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const message = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn('h-lvh bg-background font-sans antialiased overflow-hidden', fontSans.variable)}>
        <NextTopLoader />
        <NextIntlClientProvider messages={message}>
          <AppProvider>
            <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
              <TAlterDialog />
            </ThemeProvider>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
