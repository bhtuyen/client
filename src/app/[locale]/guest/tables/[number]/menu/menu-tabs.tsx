'use client';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

import type { GroupDetail } from '@/app/[locale]/guest/tables/[number]/menu/dish.service';
import type { TMessageKeys } from '@/types/message.type';
import type { MutableRefObject } from 'react';

import AddToCartDialog from '@/app/[locale]/guest/tables/[number]/menu/add-to-cart-dialog';
import useDishService from '@/app/[locale]/guest/tables/[number]/menu/dish.service';
import { useDishesOrderQuery } from '@/app/queries/useDish';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DishCategory } from '@/constants/enum';
import { cn, formatCurrency } from '@/lib/utils';

type MenuTabsType = {
  value: DishCategory.Paid | DishCategory.Buffet;
  key: TMessageKeys<'t-tab'>;
  disabled: boolean;
  viewRef: MutableRefObject<HTMLDivElement | null>;
  data: GroupDetail[];
};

export default function MenuTabs({ number }: { number: string }) {
  const [activeTab, setActiveTab] = useState<MenuTabsType['value']>(DishCategory.Paid);
  const [groupActive, setGroupActive] = useState<string | null>(null);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [hasBuffet, setHasBuffet] = useState(false);

  // dishes query paid
  const dishesOrderQuery = useDishesOrderQuery();

  const dishesPaid = dishesOrderQuery.data?.payload.data || [];

  const { groupDetails } = useDishService(dishesPaid);

  const viewBuffetRef = useRef<HTMLDivElement | null>(null);
  const viewPaidRef = useRef<HTMLDivElement | null>(null);

  // list of tabs
  const tabsList = useMemo<Array<MenuTabsType>>(
    () => [
      { value: DishCategory.Buffet, key: 'buffet-dish', disabled: !hasBuffet, viewRef: viewBuffetRef, data: groupDetails },
      { value: DishCategory.Paid, key: 'paid-dish', disabled: false, viewRef: viewPaidRef, data: groupDetails }
    ],
    [groupDetails, hasBuffet]
  );

  // translate
  const tTab = useTranslations('t-tab');

  const scrollToGroup = (href: string, viewRef: MutableRefObject<HTMLDivElement | null>) => {
    const view = viewRef.current;
    const element = document.getElementById(href);
    if (view && element) {
      setGroupActive(href);
      view.scrollTo({
        top: element.offsetTop - view.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Tabs className='h-[calc(100%_-_3.5rem)] text-black' value={activeTab} onValueChange={(value) => setActiveTab(value as MenuTabsType['value'])}>
      <TabsList className='w-full bg-white p-0 h-11'>
        {tabsList.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className='bg-white relative text-base flex-1 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-none data-[state=active]:before:contents-[""] data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:right-0 data-[state=active]:before:left-0 data-[state=active]:before:border-b-[2px] data-[state=active]:before:border-red-500'
          >
            {tTab(tab.key as TMessageKeys<'t-tab'>)}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabsList.map(({ value, key, data, viewRef }) => (
        <TabsContent value={value} className='mt-0 h-[calc(100%_-_2.75rem)]' key={key}>
          <div className='flex items-center w-full'>
            <ScrollArea className='h-11 flex-1'>
              <div className='flex h-11 p-2'>
                {data.map(({ href, groupName }) => (
                  <div
                    key={href}
                    className={cn('flex items-center whitespace-nowrap px-2 cursor-pointer', {
                      'bg-red-700/95 text-white rounded-3xl': href === groupActive
                    })}
                    onClick={() => scrollToGroup(href, viewRef)}
                  >
                    {groupName}
                  </div>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='h-2' />
            </ScrollArea>
            <TButton variant='ghost' className='w-11 h-11 bg-white px-2' tooltip='search'>
              <Search className='!size-6' />
            </TButton>
          </div>

          <ScrollArea className='p-4 bg-[#f6f6f6] h-[calc(100%_-_2.75rem)]' viewRef={viewRef}>
            <div className='space-y-4'>
              {data.map(({ groupName, dishes, href }) => (
                <div key={groupName} className='grid grid-cols-2 gap-4 lg:grid-cols-5' id={href}>
                  <h2 className='col-span-2 lg:col-span-5 text-lg font-medium'>➡️ {groupName}</h2>
                  {dishes.map((dish) => (
                    <div className='grid grid-rows-11 h-[300px] bg-white shadow-md rounded-md p-3 text-black' key={dish.id}>
                      <div className='row-span-6 relative'>
                        <TImage
                          src={dish.image}
                          alt={dish.name}
                          fill
                          className='rounded-md'
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        />
                      </div>
                      <div className='row-span-3 flex items-center'>{dish.name}</div>
                      <div className='row-span-2 flex justify-between items-end'>
                        <div>{dish.category === DishCategory.Paid ? formatCurrency(dish.price) : dish.category}</div>
                        <AddToCartDialog dish={dish} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}
