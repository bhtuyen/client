'use client';

import { Check } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import type { Locale } from '@/config';

import { useGuestLoginMutation } from '@/app/queries/useGuest';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { locales } from '@/config';
import { Role } from '@/constants/enum';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export default function ChooseLanguage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParam = useSearchParams();
  const params = useParams();

  const { setRole, createConnectSocket, setLoading } = useAppStore();

  const tSwitchLanguage = useTranslations('switch-language');
  const tButton = useTranslations('t-button');
  const tGuest = useTranslations('guest');

  const tableNumber = params.tableNumber as string;
  const token = searchParam.get('token');

  const { isPending, mutateAsync } = useGuestLoginMutation();
  const onSubmit = async () => {
    setLoading(true);
    if (isPending || !token || !tableNumber) return;
    try {
      const result = await mutateAsync({
        token: token,
        tableNumber
      });

      createConnectSocket(result.payload.data.accessToken);
      setRole(Role.Guest);

      router.push(`/guest/tables/${tableNumber}/menu`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const switchLanguage = (locale: Locale) => {
    setLoading(true);
    router.replace(
      {
        pathname,
        query: {
          token
        }
      },
      { locale }
    );
    setLoading(false);
  };

  return (
    <div className='absolute bottom-0 bg-white text-black min-h-[25%] right-0 left-0 rounded-[2rem] grid grid-rows-3 items-center text-[18px]'>
      <div className='border-b-[0.05px] border-[#dddddd] h-full flex items-center justify-center'>{tGuest('choose-language')}</div>
      <div className='flex justify-center gap-5 px-5'>
        {locales.map((t) => (
          <TButton
            key={t}
            className={cn(
              'w-full flex justify-center items-center gap-2 h-[50px] text-[16px] border-[1px] relative border-[#dddddd]',
              locale === t && 'border-black'
            )}
            onClick={() => switchLanguage(t)}
          >
            <TImage src={t === 'vi' ? '/vietnam.png' : '/england.png'} alt='language' width={20} height={20} />
            {tSwitchLanguage(t)}
            {locale === t && (
              <div className='absolute top-0 right-0'>
                <div className='w-0 h-0 border-l-[25px] border-t-[25px] border-transparent border-t-primary-foreground relative rounded-tr-md'>
                  <Check className='h-3 w-3 absolute top-[-24px] left-[-15px] text-primary' />
                </div>
              </div>
            )}
          </TButton>
        ))}
      </div>
      <div className='flex px-5 self-start'>
        <TButton className='w-full h-[50px] text-[16px] bg-primary text-primary-foreground' onClick={onSubmit} disabled={isPending}>
          {tButton('order-now')}
        </TButton>
      </div>
    </div>
  );
}
