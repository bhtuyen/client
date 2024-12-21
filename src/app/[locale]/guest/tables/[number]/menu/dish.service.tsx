import { useMemo } from 'react';

import type { DishDto, DishDtoComboDetail } from '@/schemaValidations/dish.schema';

import { removeAccents } from '@/lib/utils';

export type GroupDetail = {
  groupName: string;
  href: string;
  dishes: DishDto[];
};
type DishService = {
  groupDetails: GroupDetail[];
};

export default function useDishService(dishes: DishDtoComboDetail[]): DishService {
  const groupDetails = useMemo(() => {
    const groups = Array.from(
      dishes.reduce<Set<string>>((acc, dish) => {
        acc.add(dish.group.name);
        return acc;
      }, new Set<string>())
    ).map((groupName) => ({
      groupName,
      href: removeAccents(groupName).replace(/ /g, '-').toLowerCase()
    }));

    return groups.reduce<GroupDetail[]>(
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
  }, [dishes]);

  return { groupDetails };
}
