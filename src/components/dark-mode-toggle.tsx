'use client';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import TButton from '@/components/t-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function DarkModeToggle() {
  const { setTheme } = useTheme();
  const tTheme = useTranslations('t-theme');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TButton variant='outline' size='icon' className='rounded-full w-10 h-10'>
          <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>{tTheme('title')}</span>
        </TButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>{tTheme('light')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>{tTheme('dark')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>{tTheme('system')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
