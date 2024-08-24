'use client';

import { useAppContext } from '@/components/app-provider';
import { Role } from '@/constants/type';
import { RoleType } from '@/types/jwt.types';
import Link from 'next/link';

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
    href: '/menu',
    roles: [Role.Guest]
  },
  {
    title: 'Đơn hàng',
    href: '/orders',
    roles: [Role.Employee]
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

export default function NavItems({ className }: { className?: string }) {
  const { role } = useAppContext();
  return menuItems.map((item) => {
    const isAuthenticator = role && item.roles?.includes(role);
    const isShow = item.roles === undefined && (item.hiddenWhenLogin == undefined || item.hiddenWhenLogin === !role);
    if (isAuthenticator || isShow) {
      return (
        <Link href={item.href} key={item.href} className={className}>
          {item.title}
        </Link>
      );
    }
    return null;
  });
}
