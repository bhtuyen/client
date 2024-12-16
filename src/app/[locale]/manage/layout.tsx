import type { ReactNode } from 'react';

import ManageHeader from '@/app/[locale]/manage/manage-header';
import { ManageSidebar } from '@/app/[locale]/manage/manage-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

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
        <main className='flex flex-col overflow-hidden p-2 h-full space-y-2'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
