import { Role } from '@/constants/type';
import { RoleType } from '@/types/jwt.types';
import { Home, ShoppingCart, Users2, Salad, Table, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type MenuItemType = {
  title: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  href: string;
  rules: RoleType[];
};

const menuItems: MenuItemType[] = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    rules: [Role.Owner, Role.Employee]
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders',
    rules: [Role.Owner, Role.Employee]
  },
  {
    title: 'Bàn ăn',
    Icon: Table,
    href: '/manage/tables',
    rules: [Role.Owner, Role.Employee]
  },
  {
    title: 'Món ăn',
    Icon: Salad,
    href: '/manage/dishes',
    rules: [Role.Owner, Role.Employee]
  },
  {
    title: 'Nhân viên',
    Icon: Users2,
    href: '/manage/accounts',
    rules: [Role.Owner]
  }
];

export default menuItems;
