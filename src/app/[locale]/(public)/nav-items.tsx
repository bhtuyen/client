'use client';

import { useTranslations } from 'next-intl';

import type { GuestOrderRole } from '@/constants/const';
import type { TMessageKeys } from '@/types/message.type';

import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Role } from '@/constants/enum';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { cn, handleErrorApi } from '@/lib/utils';

const menuItems: {
  titleKey: string;
  href: string;
  roles?: Array<Role | typeof GuestOrderRole>;
  hiddenWhenLogin?: boolean;
}[] = [
  {
    titleKey: 'home',
    href: '/'
  },
  {
    titleKey: 'menu',
    href: '/guest/menu',
    roles: [Role.Guest]
  },
  {
    titleKey: 'orders',
    href: '/guest/orders',
    roles: [Role.Guest]
  },
  {
    titleKey: 'login',
    href: '/login',
    hiddenWhenLogin: true
  },
  {
    titleKey: 'manage-dashboard',
    href: '/manage/dashboard',
    roles: [Role.Owner, Role.Employee]
  }
];

export default function NavItems({ className, handleNavItemClick }: { className?: string; handleNavItemClick?: () => void }) {
  const lgoutMutation = useLogoutMutation();
  const { role, setRole, disconnectSocket } = useAppStore();
  const router = useRouter();

  const tMenuItems = useTranslations('menu-items');
  const tButton = useTranslations('t-button');
  const tAlertDialogTitle = useTranslations('t-alert-dialog.title');
  const tAlertDialogDescription = useTranslations('t-alert-dialog.description');

  const handleLogout = async () => {
    if (lgoutMutation.isPending) return;
    try {
      await lgoutMutation.mutateAsync();
      setRole(null);
      disconnectSocket();
      router.push('/');
      handleNavItemClick?.();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <>
      {menuItems.map((item) => {
        const isAuthenticator = role && item.roles?.includes(role);
        const isShow = item.roles === undefined && (item.hiddenWhenLogin == undefined || item.hiddenWhenLogin === !role);
        if (isAuthenticator || isShow) {
          return (
            <Link href={item.href} key={item.href} className={className} onClick={handleNavItemClick}>
              {tMenuItems(item.titleKey as TMessageKeys<'menu-items'>)}
            </Link>
          );
        }
        return null;
      })}
      {role === Role.Guest && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className={cn(className, 'cursor-pointer')}>{tButton('logout')}</div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tAlertDialogTitle('logout')}</AlertDialogTitle>
              <AlertDialogDescription>{tAlertDialogDescription('logout')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tButton('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>{tButton('confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {role === Role.Owner && (
        <div className={cn(className, 'cursor-pointer')} onClick={handleLogout}>
          {tButton('logout')}
        </div>
      )}
    </>
  );
}
