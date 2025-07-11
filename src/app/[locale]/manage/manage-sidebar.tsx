'use client';
import { ChevronsUpDown, HomeIcon, LogOut, Package2, Salad, Settings, ShoppingCart, Table, User2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { GuestOrderRole } from '@/constants/const';
import type { TMessageKeys } from '@/types/message.type';
import type { LucideProps } from 'lucide-react';
import type { ComponentProps, ForwardRefExoticComponent, RefAttributes } from 'react';

import { useAccountMeQuery } from '@/app/queries/useAccount';
import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { Role } from '@/constants/enum';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { handleErrorApi } from '@/lib/utils';

export type MenuItemType = {
  key: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  href: string;
  roles: Array<Role | typeof GuestOrderRole>;
  children?: MenuItemType[];
};

const menuItems: {
  navMain: MenuItemType[];
  navSecondary: MenuItemType[];
} = {
  navMain: [
    {
      key: 'dashboard',
      Icon: HomeIcon,
      href: '/manage/dashboard',
      roles: [Role.Owner, Role.Employee]
    },
    {
      key: 'orders',
      Icon: ShoppingCart,
      href: '/manage/orders',
      roles: [Role.Owner, Role.Employee],
      children: [
        {
          key: 'orders-dashboard',
          Icon: ShoppingCart,
          href: '/manage/orders',
          roles: [Role.Owner, Role.Employee]
        }
      ]
    },
    {
      key: 'tables',
      Icon: Table,
      href: '/manage/tables',
      roles: [Role.Owner, Role.Employee]
    },
    {
      key: 'dishes',
      Icon: Salad,
      href: '/manage/dishes',
      roles: [Role.Owner, Role.Employee]
    },
    {
      key: 'employees',
      Icon: User2,
      href: '/manage/employees',
      roles: [Role.Owner]
    }
  ],
  navSecondary: [
    {
      key: 'setting',
      Icon: Settings,
      href: '/manage/setting',
      roles: [Role.Owner, Role.Employee]
    }
  ]
};

export function ManageSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useAccountMeQuery();
  const { isMobile } = useSidebar();
  const { setRole, disconnectSocket, role } = useAppStore();
  const tManageSidebar = useTranslations('manage-sidebar');

  const account = data?.payload.data;

  const handleLogout = async () => {
    if (logoutMutation.isPending) return;

    try {
      await logoutMutation.mutateAsync();
      setRole(null);
      disconnectSocket();
      router.push('/');
    } catch (error: any) {
      handleErrorApi({ error });
    }
  };

  return (
    <Sidebar collapsible='icon' {...props} className='shadow'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='h-auto group-data-[collapsible=icon]:!px-0'>
              <Link href='/' className='flex items-center gap-2'>
                <div className='group flex size-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'>
                  <Package2 className='size-6 transition-all group-hover:scale-110' color='#0fc2e6' />
                  <span className='sr-only'>RESTAURANT</span>
                </div>
                <span className='text-xl font-bold'>RESTAURANT</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.navMain
              .filter((item) => item.roles.includes(role ?? Role.Employee))
              .map((item, index) => {
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild tooltip={item.key} isActive={pathname === item.href} className='h-10'>
                      <Link href={item.href}>
                        <item.Icon className='!size-6 mr-2' />
                        <span className='text-base'>{tManageSidebar(item.key as TMessageKeys<'manage-sidebar'>)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className='mt-auto'>
          <SidebarMenu>
            {menuItems.navSecondary
              .filter((item) => item.roles.includes(role ?? Role.Employee))
              .map((item, index) => {
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild tooltip={item.key} isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.Icon className='!size-6 mr-2' />
                        <span className='text-base'>{tManageSidebar(item.key as TMessageKeys<'manage-sidebar'>)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-full'
                >
                  <Avatar className='size-10 rounded-full'>
                    <AvatarImage src={account?.avatar ?? undefined} alt={account?.name} />
                    <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>{account?.name}</span>
                    <span className='truncate text-xs'>{account?.email}</span>
                  </div>
                  <ChevronsUpDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side={isMobile ? 'bottom' : 'right'}
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-full'>
                      <AvatarImage src={account?.avatar ?? undefined} alt={account?.name} />
                      <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>{account?.name}</span>
                      <span className='truncate text-xs'>{account?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='gap-1 cursor-pointer' onClick={handleLogout}>
                  <div className='size-8 flex items-center justify-center'>
                    <LogOut height={16} width={16} />
                  </div>
                  <p>{tManageSidebar('logout')}</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
