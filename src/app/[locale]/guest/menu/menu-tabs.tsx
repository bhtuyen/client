'use client';
import AddToCartDialog from '@/app/[locale]/guest/menu/add-to-cart-dialog';
import { useDishListQuery } from '@/app/queries/useDish';
import TImage from '@/components/t-image';
import type { TabsKeyType, TasbType } from '@/components/tabs';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DishCategory } from '@/constants/enum';
import { formatCurrency, removeAccents } from '@/lib/utils';
import { DishDto } from '@/schemaValidations/dish.schema';
import { TMessageKeys } from '@/types/message.type';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

export default function MenuTabs() {
  const menuTabs: TasbType = [
    { key: 'buffet', label: 'buffet-dish' },
    { key: 'paid', label: 'paid-dish' }
  ];

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<TabsKeyType<typeof menuTabs>>('buffet');

  const tTab = useTranslations('t-tab');

  const dishesListQuery = useDishListQuery();
  const dishes = dishesListQuery.data?.payload.data || [];

  const groupTabs = Array.from(
    dishes.reduce<Set<string>>((acc, dish) => {
      acc.add(dish.group.name);
      return acc;
    }, new Set<string>())
  ).map((groupName) => ({
    groupName,
    href: removeAccents(groupName).replace(/ /g, '-').toLowerCase()
  }));

  const groupDetails = groupTabs.reduce<
    {
      groupName: string;
      href: string;
      dishes: DishDto[];
    }[]
  >(
    (groupDetails, { groupName, href }) => [
      ...groupDetails,
      {
        groupName,
        href,
        dishes: dishes.filter((dish) => dish.group.name === groupName)
      }
    ],
    []
  );

  const scrollToGroup = (href: string) => {
    const container = containerRef.current;
    const element = document.getElementById(href);
    if (container && element) {
      container.scrollTo({
        top: element.offsetTop - container.offsetTop - 16,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Tabs className='h-[calc(100%_-_60px)] text-black' value={activeTab} onValueChange={(value: TabsKeyType<typeof menuTabs>) => setActiveTab(value)}>
      <TabsList className='w-full bg-white p-0 h-11'>
        {menuTabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className='bg-white relative text-base flex-1 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-none data-[state=active]:before:contents-[""] data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:right-0 data-[state=active]:before:left-0 data-[state=active]:before:border-b-[2px] data-[state=active]:before:border-red-500'
          >
            {tTab(tab.label as TMessageKeys<'t-tab'>)}
          </TabsTrigger>
        ))}
      </TabsList>
      <Carousel className='w-full h-11 flex items-center shadow-sm'>
        <CarouselContent className='ml-0 w-full h-full'>
          {groupDetails.map(({ href, groupName }) => (
            <CarouselItem key={href} className={`basis-[${(1 / groupDetails.length) * 100}%] flex items-center relative h-full`} onClick={() => scrollToGroup(href)}>
              {groupName}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <TabsContent ref={containerRef} value='buffet' className='mt-0 h-[calc(100%_-_5.5rem)] p-4 bg-[#f6f6f6] overflow-y-auto space-y-4'>
        {groupDetails.map(({ groupName, dishes, href }) => (
          <div key={groupName} className='grid grid-cols-2 gap-4 lg:grid-cols-5' id={href}>
            <h2 className='col-span-2 lg:col-span-5 text-lg font-medium'>➡️ {groupName}</h2>
            {dishes.map((dish) => (
              <div className='grid grid-rows-11 h-[300px] bg-white shadow-md rounded-md p-3 text-black' key={dish.id}>
                <div className='row-span-6 relative'>
                  <TImage src={dish.image} alt={dish.name} fill className='rounded-md' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' />
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
      </TabsContent>
      <TabsContent value='paid'></TabsContent>
    </Tabs>
  );
}
