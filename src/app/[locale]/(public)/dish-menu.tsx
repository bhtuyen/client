'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import type { DishDtoComboDetail, DishDtoDetail } from '@/schemaValidations/dish.schema';

import { useDishesOrderQuery } from '@/app/queries/useDish';
import TImage from '@/components/t-image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DishCategory } from '@/constants/enum';
import { cn, getPriceString } from '@/lib/utils';

type DishGroupByCategory = {
  [DishCategory.Paid]: DishDtoComboDetail[];
  [DishCategory.ComboPaid]: DishDtoComboDetail[];
  [DishCategory.ComboBuffet]: DishDtoComboDetail[];
};

type GroupDetail = {
  groupName: string;
  groupId: string;
  dishes: DishDtoComboDetail[] | DishDtoDetail[];
};

type DishCategoryGroupDetail =
  | {
      category: DishCategory.Paid;
      groupDetails: GroupDetail[];
    }
  | {
      category: DishCategory.ComboPaid | DishCategory.ComboBuffet;
      dishCombos: (DishDtoComboDetail & {
        groupDetails: GroupDetail[];
      })[];
    };

const buildGroupDetails = (dishes: DishDtoComboDetail[] | DishDtoDetail[]) => {
  const groups = dishes.reduce<
    {
      groupName: string;
      groupId: string;
    }[]
  >((acc, dish) => {
    if (!acc.find((group) => group.groupId === dish.group.id)) {
      acc.push({
        groupName: dish.group.name,
        groupId: dish.group.id
      });
    }
    return acc;
  }, []);

  return groups.reduce<GroupDetail[]>(
    (groupDetails, { groupName, groupId }) => [
      ...groupDetails,
      {
        groupName,
        groupId,
        dishes: dishes.filter((dish) => dish.group.name === groupName)
      }
    ],
    []
  );
};

export default function DishMenu() {
  const [categoryActive, setCategoryActive] = useState<DishCategory.Paid | DishCategory.ComboBuffet | DishCategory.ComboPaid>(DishCategory.Paid);
  const [groupActive, setGroupActive] = useState<string>('');
  const [dishComboActive, setDishComboActive] = useState<string>('');

  const dishToOrder = useDishesOrderQuery();

  const dishCategoryGroupDetails = useMemo<DishCategoryGroupDetail[]>(() => {
    const dishes = dishToOrder.data?.payload.data ?? [];
    const result: DishCategoryGroupDetail[] = [];

    const dishGroupByCategory = dishes.reduce<DishGroupByCategory>(
      (result, dish) => {
        if (dish.category !== DishCategory.Buffet) {
          result[dish.category].push(dish);
        }
        return result;
      },
      {
        [DishCategory.Paid]: [],
        [DishCategory.ComboPaid]: [],
        [DishCategory.ComboBuffet]: []
      }
    );

    Object.keys(dishGroupByCategory).forEach((category) => {
      if (category === DishCategory.Paid) {
        const groupDetails = buildGroupDetails(dishGroupByCategory[category]);
        result.push({
          category,
          groupDetails
        });
      }

      if (category === DishCategory.ComboBuffet || category === DishCategory.ComboPaid) {
        result.push({
          category,
          dishCombos: dishGroupByCategory[category].map((dish) => ({
            ...dish,
            groupDetails: buildGroupDetails(dish.dishes.map(({ dish }) => dish))
          }))
        });
      }
    });

    return result;
  }, [dishToOrder.data?.payload.data]);

  const tDishCategoryMenu = useTranslations('dish-menu.dish-category');
  const tInfo = useTranslations('t-info');

  useEffect(() => {
    if (dishCategoryGroupDetails.length > 0) {
      const dishPaidGroupDetail = dishCategoryGroupDetails.find(({ category }) => category === DishCategory.Paid);
      if (dishPaidGroupDetail && dishPaidGroupDetail.category === DishCategory.Paid) {
        const groupDetails = dishPaidGroupDetail.groupDetails;
        const firstGroupDetail = groupDetails[0];
        if (firstGroupDetail) {
          setGroupActive(firstGroupDetail.groupId);
        }
      }
    }
  }, [dishCategoryGroupDetails]);

  return (
    <div className='flex w-full h-full gap-x-10'>
      <Accordion
        type='single'
        className='flex-1 h-full'
        value={categoryActive}
        onValueChange={(value) => {
          setCategoryActive(value as DishCategory.Paid | DishCategory.ComboBuffet | DishCategory.ComboPaid);
          if (value === DishCategory.Paid) {
            dishCategoryGroupDetails.forEach((dishCategoryGroupDetail) => {
              const { category } = dishCategoryGroupDetail;
              if (category === value) {
                const { groupDetails } = dishCategoryGroupDetail;
                const groupDetail = groupDetails[0];
                if (groupDetail) {
                  setGroupActive(groupDetail.groupId);
                }
              }
            });
          } else {
            setGroupActive('');
          }
          setDishComboActive('');
        }}
      >
        {dishCategoryGroupDetails.map((dishCategoryGroupDetail) => {
          if (dishCategoryGroupDetail.category === DishCategory.Paid) {
            const { category, groupDetails } = dishCategoryGroupDetail;
            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className='text-xl hover:no-underline font-bold data-[state="open"]:text-orange-500 data-[state="open"]:border-b-4 data-[state="open"]:border-b-orange-500'>
                  {tDishCategoryMenu(category)}
                </AccordionTrigger>
                <AccordionContent asChild>
                  <ul className='flex flex-col gap-2 pl-4 pt-4'>
                    {groupDetails.map(({ groupName, groupId }) => (
                      <li
                        key={groupId}
                        onClick={() => setGroupActive(groupId)}
                        className={cn('cursor-pointer font-semibold text-base hover:text-orange-500', {
                          'text-orange-500': groupId === groupActive
                        })}
                      >
                        {groupName}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          }

          const { category, dishCombos } = dishCategoryGroupDetail;
          return (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className='text-xl font-bold data-[state="open"]:text-orange-500 data-[state="open"]:border-b-4 data-[state="open"]:border-b-orange-500 hover:no-underline'>
                {tDishCategoryMenu(category)}
              </AccordionTrigger>
              <AccordionContent>
                <Accordion
                  className='flex flex-col gap-2 pl-4'
                  type='single'
                  value={dishComboActive}
                  onValueChange={(value) => {
                    setDishComboActive(value);
                    const dishCombo = dishCombos.find(({ id }) => id === value);
                    const groupDetails = dishCombo?.groupDetails ?? [];
                    const firstGroupDetail = groupDetails[0];
                    if (firstGroupDetail) {
                      setGroupActive(firstGroupDetail.groupId);
                    }
                  }}
                >
                  {dishCombos.map(({ name, id, groupDetails }) => (
                    <AccordionItem key={id} value={id} className={cn('cursor-pointer font-semibold text-base', {})}>
                      <AccordionTrigger
                        className={cn('text-base font-semibold hover:no-underline hover:text-orange-500', {
                          'text-orange-500': id === dishComboActive
                        })}
                      >
                        {name}
                      </AccordionTrigger>
                      <AccordionContent asChild>
                        <ul className='flex flex-col gap-2 pl-4'>
                          {groupDetails.map(({ groupName, groupId }) => (
                            <li
                              className={cn('font-medium text-base hover:text-orange-500 hover:underline hover:underline-offset-4', {
                                'text-orange-500 underline underline-offset-4': groupId === groupActive
                              })}
                              onClick={() => setGroupActive(groupId)}
                              key={groupId}
                            >
                              {groupName}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <ScrollArea className='flex-[3] h-full'>
        <div className='h-full grid grid-cols-3 gap-4 p-4 pl-0 max-[1366px]:grid-cols-2'>
          {dishCategoryGroupDetails.map((dishCategoryGroupDetail) => {
            const { category } = dishCategoryGroupDetail;
            if (category === DishCategory.Paid && categoryActive === DishCategory.Paid) {
              const { groupDetails } = dishCategoryGroupDetail;
              const groupDetail = groupDetails.find(({ groupId }) => groupId === groupActive);
              const dishes = groupDetail?.dishes ?? [];
              return dishes.map(({ image, name, price, category, id }) => (
                <div key={id} className='flex flex-col gap-2 items-center'>
                  <TImage src={image} alt={name} className='w-full object-cover rounded-md' />
                  <div className='text-center'>{name}</div>
                  <div className='text-muted-foreground'>{getPriceString({ price, category })}</div>
                </div>
              ));
            }

            if (
              (category === DishCategory.ComboBuffet && categoryActive === DishCategory.ComboBuffet) ||
              (category === DishCategory.ComboPaid && categoryActive === DishCategory.ComboPaid)
            ) {
              const { dishCombos } = dishCategoryGroupDetail;
              if (dishComboActive) {
                const dishCombo = dishCombos.find(({ id }) => id === dishComboActive);
                const groupDetails = dishCombo?.groupDetails ?? [];
                const groupDetail = groupDetails.find(({ groupId }) => groupId === groupActive);
                const dishes = groupDetail?.dishes ?? [];
                return dishes.map(({ image, name, price, category, id }) => (
                  <div key={id} className='flex flex-col gap-2 items-center'>
                    <TImage src={image} alt={name} className='w-full object-cover rounded-md' />
                    <div className='text-center'>{name}</div>
                    {category !== DishCategory.Buffet && <div className='text-muted-foreground'>{getPriceString({ price, category })}</div>}
                  </div>
                ));
              }

              return dishCombos.map(({ image, name, price, category, id }) => (
                <div key={id} className='col-span-3 grid grid-cols-2 gap-4'>
                  <TImage src={image} alt={name} className='w-full object-cover rounded-md' width={100} height={100} quality={100} />
                  <div className='flex flex-col gap-3 pr-2'>
                    <h2 className='text-2xl font-bold'>{name}</h2>
                    <p className='text-lg'>{`${getPriceString({ price, category })}/người`}</p>
                    <i className='text-sm text-muted-foreground'>{tInfo('price-no-vat')}</i>
                    <Separator />
                  </div>
                </div>
              ));
            }
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
