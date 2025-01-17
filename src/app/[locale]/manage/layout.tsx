import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import ManageHeader from '@/app/[locale]/manage/manage-header';
import { ManageSidebar } from '@/app/[locale]/manage/manage-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { baseOpenGraph } from '@/shared-metadata';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'manage' });

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

export default function Layout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ManageSidebar />
      <SidebarInset className='h-screen overflow-hidden'>
        <ManageHeader />
        <main className='flex flex-col overflow-hidden h-full p-2 pr-0'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
