'use client';
import menuItems from '@/app/[locale]/manage/menuItems';
import { useAppStore } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Role } from '@/constants/enum';
import { cn } from '@/lib/utils';
import { Package2, PanelLeft } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

export default function MobileNavLinks() {
  const pathname = usePathname();
  const { role } = useAppStore();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' variant='outline' className='sm:hidden'>
          <PanelLeft className='h-5 w-5' />
          <span className='sr-only'>Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetTitle>
        <SheetDescription />
      </SheetTitle>
      <SheetContent side='left' className='sm:max-w-xs'>
        <nav className='grid gap-6 text-lg font-medium'>
          <SheetClose asChild>
            <Link
              href='/'
              className='group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'
            >
              <Package2 className='h-5 w-5 transition-all group-hover:scale-110' />
              <span className='sr-only'>Acme Inc</span>
            </Link>
          </SheetClose>
          {menuItems
            .filter((item) => item.rules.includes(role ?? Role.Employee))
            .map((Item, index) => {
              const isActive = pathname === Item.href;
              return (
                <SheetClose key={index} asChild>
                  <Link
                    href={Item.href}
                    className={cn('flex items-center gap-4 px-2.5  hover:text-foreground', {
                      'text-foreground': isActive,
                      'text-muted-foreground': !isActive
                    })}
                  >
                    <Item.Icon className='h-5 w-5' />
                    {Item.title}
                  </Link>
                </SheetClose>
              );
            })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
