import { Package2 } from 'lucide-react';
import { unstable_setRequestLocale } from 'next-intl/server';

import type { ReactNode } from 'react';

import NavItems from '@/app/[locale]/(public)/nav-items';
import NavigationMenu from '@/app/[locale]/(public)/navigation-menu';
import DarkModeToggle from '@/components/dark-mode-toggle';
import { SwitchLanguage } from '@/components/switch-language';
import { Link } from '@/i18n/routing';

export default function PublicLayout({
  children,
  modal,
  params: { locale }
}: Readonly<{
  children: ReactNode;
  modal: ReactNode;
  params: {
    locale: string;
  };
}>) {
  unstable_setRequestLocale(locale);
  return (
    <div className='flex min-h-screen w-full flex-col relative'>
      <header className='sticky z-10 top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6'>
        <nav className='hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
          <Link href='/' className='flex items-center gap-2 text-lg font-semibold md:text-base'>
            <Package2 className='h-6 w-6' />
            <span className='sr-only'>Big boy</span>
          </Link>
          <NavItems className='text-muted-foreground transition-colors hover:text-foreground flex-shrink-0' />
        </nav>
        <NavigationMenu />
        <div className='ml-auto flex items-center gap-x-2'>
          <SwitchLanguage />
          <DarkModeToggle />
        </div>
      </header>
      <main className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8'>
        {children}
        {modal}
      </main>
    </div>
  );
}
