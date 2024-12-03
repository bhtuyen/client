import Cart from '@/app/[locale]/guest/menu/cart';
import MenuGroup from '@/app/[locale]/guest/menu/menu-group';
import TTabs from '@/components/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BellRing, UserRound } from 'lucide-react';
import Image from 'next/image';

export default function MenuPage() {
  const menuType = [
    { key: 'buffet', label: 'Món Buffet' },
    { key: 'paid', label: 'Món tính tiền' }
  ];
  return (
    <div className='bg-white min-h-dvh text-black flex flex-col'>
      <div className='fixed top-0 z-10 bg-white right-0 left-0'>
        <nav className='h-[60px] flex justify-between px-4'>
          <div className='flex items-center'>
            <Image src='/vietnam.png' alt='logo' width={30} height={30} />
            <Separator orientation='vertical' className='mx-2 h-[60%] w-[0.5px] bg-[#cecece]' />
            <Badge className='bg-[#f2f2f2] h-[60%] rounded-3xl mr-2'>Bàn 08</Badge>
            <Button className='bg-[#f2f2f2] h-[60%] rounded-3xl flex items-center gap-1'>
              <BellRing width={'20px'} height={'20px'} />
              Gọi NV
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <Cart />
            <div className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center'>
              <UserRound color='#000000' />
            </div>
          </div>
        </nav>
        <TTabs tabs={menuType} />
      </div>
      <div className='bg-[#f6f6f6] flex-1 p-4 overflow-y-auto pt-[110px]'>
        <MenuGroup />
      </div>
    </div>
  );
}
