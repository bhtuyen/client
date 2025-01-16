'use client';

import { Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useGetTableDetailForPaymentQuery } from '@/app/queries/useTable';
import TImage from '@/components/t-image';
import { ScrollArea } from '@/components/ui/scroll-area';
import envConfig from '@/config';
import { DishCategory } from '@/constants/enum';
import { formatCurrency } from '@/lib/utils';

export default function TablePayment({ number, isPaid }: { number: string; isPaid: boolean }) {
  const { data } = useGetTableDetailForPaymentQuery(number);

  const tableDetail = data?.payload.data;

  const tInfo = useTranslations('t-info');

  const orders = useMemo(() => {
    return tableDetail?.orders.filter(({ dishSnapshot: { category } }) => category !== DishCategory.Buffet) ?? [];
  }, [tableDetail]);

  const amount = useMemo(() => {
    return orders.reduce(
      (acc, { dishSnapshot, quantity }) => acc + (dishSnapshot.category !== DishCategory.Buffet ? dishSnapshot.price * quantity : 0),
      0
    );
  }, [orders]);

  const description = useMemo(() => {
    return `${number}BHT${tableDetail?.token}`;
  }, [number, tableDetail]);

  return (
    <div className='w-max-[1500px] w-[1500px] md:w-[1300px] flex mx-auto gap-4 h-[calc(100%_-_2.25rem)]'>
      <div className='flex-[2] h-full flex flex-col gap-4'>
        <div className='flex items-center h-36'>
          <h2 className='text-5xl font-bold'>{tInfo('payment-for-table', { number })}</h2>
        </div>
        <div className='border p-4 rounded-sm'>
          <p className='text-base font-bold text-center'>{tInfo('instruction-for-payment')}</p>
        </div>
        <div className='flex'>
          <div className='flex-1 flex flex-col gap-4 items-center border border-r-0 rounded-sm p-4'>
            <p className='text-base font-bold'>{tInfo('method-1')}</p>
            <div className='flex flex-col items-center gap-2'>
              <TImage
                src={`https://qr.sepay.vn/img?bank=VietinBank&acc=100870480229&template=compact&amount=${amount}&des=${description}`}
                width={400}
                height={400}
                alt='QR code'
                className=''
              />
              <div className='flex items-center gap-2'>
                <span>
                  {tInfo('status')} {isPaid ? tInfo('payment-success') : tInfo('waiting-for-payment')}{' '}
                </span>
                {!isPaid && <Loader className='animate-spin' />}
              </div>
            </div>
          </div>
          <div className='flex-1 flex flex-col gap-4 items-center border rounded-sm p-4'>
            <p className='text-base font-bold'>{tInfo('method-1')}</p>
            <div className='flex items-center gap-2'>
              <TImage src='/vietinbank-icon.png' width={40} height={40} alt='vietinbank' />
              <p className='font-bold'>{tInfo('vietinbank')}</p>
            </div>
            <div className='flex flex-col gap-2 w-full'>
              <div className='grid grid-cols-2 w-full border-b py-4'>
                <span>{tInfo('account-holder')}</span>
                <span className='font-bold'>{envConfig.NEXT_PUBLIC_ACCOUNT_NAME}</span>
              </div>
              <div className='grid grid-cols-2 w-full border-b py-4'>
                <span>{tInfo('account-number')}</span>
                <span className='font-bold'>{envConfig.NEXT_PUBLIC_ACCOUNT_NUMBER}</span>
              </div>
              <div className='grid grid-cols-2 w-full border-b py-4'>
                <span>{tInfo('amount-to-pay')}</span>
                <span className='font-bold'>{formatCurrency(amount)}</span>
              </div>
              <div className='flex flex-col gap-1 w-full border-b py-1'>
                <span>{tInfo('description-for-payment')}</span>
                <span className='font-bold'>{description}</span>
              </div>
            </div>

            <div className='bg-[rgba(248,249,250,1)] p-4 rounded-sm'>{tInfo('note-for-payment')}</div>
          </div>
        </div>
      </div>
      <div className='flex-1 bg-[rgba(248,249,250,1)] p-4 pr-2 rounded-sm h-full flex flex-col gap-4'>
        <p className='text-lg font-bold h-7'>{tInfo('order-information')}</p>
        <ScrollArea className='h-[calc(100%_-_2.5rem)]'>
          <ul className='pr-2'>
            {orders.map(({ dishSnapshot, quantity }) => (
              <li className='flex justify-between items-center bg-white p-2 rounded-sm border-b' key={dishSnapshot.id}>
                <div className='grid grid-cols-[1fr_auto] items-center text-base flex-[7]'>
                  <p className=''>{dishSnapshot.name}</p>
                  <span className='bg-[rgba(248,249,250,1)] p-1 rounded-sm text-sm'>x{quantity}</span>
                </div>
                <span className='font-bold flex-[3] text-right'>{formatCurrency((dishSnapshot.price ?? 0) * quantity)}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className='flex justify-between items-center h-7 pr-4 border-t pt-2'>
          <p className='text-base font-bold'>{tInfo('total')}</p>
          <span className='font-bold'>{formatCurrency(amount)}</span>
        </div>
      </div>
    </div>
  );
}
