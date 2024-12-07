'use client';
import AddToCart from '@/app/[locale]/guest/menu/add-to-cart';
import { useDishListQuery } from '@/app/queries/useDish';
import TImage from '@/components/t-image';
import { DishCategory } from '@/constants/enum';
import { formatCurrency } from '@/lib/utils';
import type { DishesRes } from '@/schemaValidations/dish.schema';

export default function MenuGroup() {
  const tabs = [
    { key: 'cart', label: 'Giỏ đồ ăn' },
    { key: 'ordered', label: 'Món đã gọi' }
  ];
  const dishesListQuery = useDishListQuery();
  const dishes: DishesRes['data'] = dishesListQuery.data?.payload.data || [];

  return (
    <div>
      {/* <p>Rượu</p> */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
        {dishes.map((dish) => (
          <div className='grid grid-rows-11 h-[300px] bg-white shadow-sm rounded-md p-3' key={dish.id}>
            <div className='row-span-6 relative'>
              <TImage
                src={dish.image}
                alt={dish.name}
                fill
                className='rounded-md'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                objectFit='cover'
              />
            </div>
            <div className='row-span-3 flex items-center'>{dish.name}</div>
            <div className='row-span-2 flex justify-between items-end'>
              <div>{dish.category === DishCategory.Paid ? formatCurrency(dish.price) : dish.category}</div>
              <AddToCart dish={dish} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
