'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { Period } from '@/schemaValidations/common.schema';

import { DishBarChart } from '@/app/[locale]/manage/dashboard/dish-bar-chart';
import { RevenueLineChart } from '@/app/[locale]/manage/dashboard/revenue-line-chart';
import { useIndicatorQuery } from '@/app/queries/useIndicator';
import TButton from '@/components/t-button';
import { TDateRange } from '@/components/t-date-range';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatCurrency, periodDefault } from '@/lib/utils';

export default function DashboardMain() {
  const [dateRange, setDateRange] = useState<Period>(periodDefault);
  const { data } = useIndicatorQuery(dateRange);

  const tDashboard = useTranslations('manage.dashboard');
  const tButton = useTranslations('t-button');

  const resetDateFilter = () => {
    setDateRange(periodDefault);
  };

  const revenue = data?.payload.data.revenue ?? 0;
  const guestCount = data?.payload.data.guestCount ?? 0;
  const orderCount = data?.payload.data.orderCount ?? 0;
  const servingTableCount = data?.payload.data.servingTableCount ?? 0;
  const revenuesByDate = data?.payload.data.revenuesByDate ?? [];
  const dishesIndicator = data?.payload.data.dishesIndicator ?? [];

  return (
    <ScrollArea>
      <div className='p-2 pr-4 space-y-2'>
        <div className='flex flex-wrap gap-2'>
          <TDateRange dateRange={dateRange} setDateRange={setDateRange} />
          <TButton className='' variant={'outline'} onClick={resetDateFilter} size={'sm'}>
            {tButton('reset')}
          </TButton>
        </div>
        <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{tDashboard('total-revenue')}</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{formatCurrency(revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{tDashboard('guest')}</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{guestCount}</div>
              <p className='text-xs text-muted-foreground'>{tDashboard('ordered')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{tDashboard('order')}</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <rect width='20' height='14' x='2' y='5' rx='2' />
                <path d='M2 10h20' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{orderCount}</div>
              <p className='text-xs text-muted-foreground'>{tDashboard('paied')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{tDashboard('serving-table')}</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{servingTableCount}</div>
            </CardContent>
          </Card>
        </div>
        <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-8'>
          <div className='lg:col-span-4'>
            <RevenueLineChart chartData={revenuesByDate} />
          </div>
          <div className='lg:col-span-4'>
            <DishBarChart chartData={dishesIndicator} />
          </div>
        </div>
      </div>
      <ScrollBar orientation='vertical' className='z-20 ' />
    </ScrollArea>
  );
}
