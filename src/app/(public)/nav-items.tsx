'use client';

import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppContext } from '@/components/app-provider';
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Role } from '@/constants/type';
import { cn, handleErrorApi } from '@/lib/utils';
import { RoleType } from '@/types/jwt.types';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const menuItems: {
  title: string;
  href: string;
  roles?: RoleType[];
  hiddenWhenLogin?: boolean;
}[] = [
  {
    title: 'Trang chủ',
    href: '/'
  },
  {
    title: 'Món ăn',
    href: '/guest/menu',
    roles: [Role.Guest]
  },
  {
    title: 'Đơn hàng',
    href: '/guest/orders',
    roles: [Role.Guest]
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    hiddenWhenLogin: true
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    roles: [Role.Owner, Role.Employee]
  }
];

export default function NavItems({
  className,
  handleNavItemClick
}: {
  className?: string;
  handleNavItemClick?: () => void;
}) {
  const lgoutMutation = useLogoutMutation();
  const { role, setRole, disconnectSocket } = useAppContext();
  const router = useRouter();

  const handleLogout = async () => {
    if (lgoutMutation.isPending) return;
    try {
      await lgoutMutation.mutateAsync();
      setRole(undefined);
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
        const isShow =
          item.roles === undefined && (item.hiddenWhenLogin == undefined || item.hiddenWhenLogin === !role);
        if (isAuthenticator || isShow) {
          return (
            <Link href={item.href} key={item.href} className={className} onClick={handleNavItemClick}>
              {item.title}
            </Link>
          );
        }
        return null;
      })}
      {role === Role.Guest && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className={cn(className, 'cursor-pointer')}>Đăng xuất</div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có muốn đăng xuất không?</AlertDialogTitle>
              <AlertDialogDescription>Việc đăng xuất có thể làm mất đi hóa đơn của bạn</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {role === Role.Owner && (
        <div className={cn(className, 'cursor-pointer')} onClick={handleLogout}>
          Đăng xuất
        </div>
      )}
    </>
  );
}
