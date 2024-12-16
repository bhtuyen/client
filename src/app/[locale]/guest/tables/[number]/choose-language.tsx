'use client';

import { useGuestLoginMutation } from '@/app/queries/useGuest';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import type { Locale } from '@/config';
import { locales } from '@/config';
import { Role } from '@/constants/enum';
import { usePathname, useRouter } from '@/i18n/routing';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';

export default function ChooseLanguage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParam = useSearchParams();
  const params = useParams();

  const { setRole } = useAppStore();

  const tableNumber = params.number as string;
  const token = searchParam.get('token');

  const guestLoginMutation = useGuestLoginMutation();
  const onSubmit = async () => {
    if (guestLoginMutation.isPending) return;
    try {
      const result = await guestLoginMutation.mutateAsync({
        token: token ?? '',
        tableNumber
      });
      console.log(result);

      setRole(Role.Guest);

      router.push(`/guest/menu`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='absolute bottom-0 bg-white text-black min-h-[25%] right-0 left-0 rounded-[2rem] grid grid-rows-3 items-center text-[18px]'>
      <div className='border-b-[0.05px] border-[#dddddd] h-full flex items-center justify-center'>Chọn ngôn ngữ để tiếp tục</div>
      <div className='flex justify-center gap-5 px-5'>
        <TButton
          className={clsx(
            'w-full flex bg-white justify-center items-center gap-2 h-[50px] text-[16px] border-[1px] border-[#dddddd] relative',
            locale === locales[0] && 'border-black'
          )}
          onClick={() => {
            router.replace(pathname, { locale: locales[0] as Locale });
          }}
        >
          <TImage src={'/vietnam.png'} alt='' width={20} height={20} />
          Tiếng Việt
          {locale === locales[0] && (
            <div className='absolute top-0 right-0'>
              <div className='w-0 h-0 border-l-[25px] border-t-[25px] border-transparent border-t-black relative rounded-tr-md'>
                <Check className='h-3 w-3 text-white absolute top-[-23px] left-[-13px]' />
              </div>
            </div>
          )}
        </TButton>
        <TButton
          className={clsx(
            'w-full flex justify-center items-center gap-2 h-[50px] text-[16px] border-[1px] relative border-[#dddddd]',
            locale === locales[1] && 'border-black'
          )}
          onClick={() => {
            router.replace(pathname, { locale: locales[1] as Locale });
          }}
        >
          <TImage src={'/england.png'} alt='' width={20} height={20} />
          Tiếng Anh
          {locale === locales[1] && (
            <div className='absolute top-0 right-0'>
              <div className='w-0 h-0 border-l-[25px] border-t-[25px] border-transparent border-t-black relative rounded-tr-md'>
                <Check className='h-3 w-3 text-white absolute top-[-23px] left-[-13px]' />
              </div>
            </div>
          )}
        </TButton>
      </div>
      <div className='flex px-5 self-start'>
        <TButton className='w-full h-[50px] text-[16px]' variant={'secondary'} onClick={onSubmit}>
          Gọi món ngay
        </TButton>
      </div>
    </div>
  );
}
