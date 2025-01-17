import { Package2 } from 'lucide-react';

import type { ReactNode } from 'react';

import NavItems from '@/app/[locale]/(public)/nav-items';
import NavigationMenu from '@/app/[locale]/(public)/navigation-menu';
import DarkModeToggle from '@/components/dark-mode-toggle';
import { SwitchLanguage } from '@/components/switch-language';
import { Link } from '@/i18n/routing';

export default function PublicLayout({
  children,
  params: { locale }
}: Readonly<{
  children: ReactNode;
  params: {
    locale: string;
  };
}>) {
  return (
    <div className='flex h-screen w-full flex-col relative gap-y-2'>
      <header className='max-w-[1500px] mx-auto w-full sticky z-10 top-0 flex min-h-16 max-h-16 items-center gap-4 border-b bg-background px-4 md:px-6'>
        <nav className='hidden flex-col h-full gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
          <Link href='/' className='flex items-center gap-2 text-lg font-semibold md:text-base'>
            <Package2 className='h-6 w-6' />
            <span className='sr-only'>Big boy</span>
          </Link>
          <NavItems className='text-muted-foreground transition-colors hover:text-foreground flex-shrink-0' />
        </nav>
        <NavigationMenu />
        <div className='ml-auto h-full flex items-center gap-x-2'>
          <SwitchLanguage />
          <DarkModeToggle />
        </div>
      </header>
      <main className='max-w-[1500px] mx-auto w-full h-[calc(100%_-_4rem)] max-[1366px]:px-10'>{children}</main>
    </div>
  );
}
