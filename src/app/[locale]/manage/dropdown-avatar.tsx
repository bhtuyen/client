'use client';
import { useAccountMeQuery } from '@/app/queries/useAccount';
import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, useRouter } from '@/i18n/routing';
import { handleErrorApi } from '@/lib/utils';

export default function DropdownAvatar() {
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const { setRole, disconnectSocket } = useAppStore();

  const { data } = useAccountMeQuery();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TButton variant='outline' size='icon' className='overflow-hidden rounded-full'>
          <Avatar>
            <AvatarImage src={account?.avatar ?? undefined} alt={account?.name} />
            <AvatarFallback>{account?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </TButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>{account?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={'/manage/setting'} className='cursor-pointer'>
            Cài đặt
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
