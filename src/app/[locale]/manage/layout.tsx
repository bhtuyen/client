import ManageHeader from '@/app/[locale]/manage/manage-header';
import { ManageSidebar } from '@/app/[locale]/manage/manage-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

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
        <main className='flex flex-col overflow-hidden h-full'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
