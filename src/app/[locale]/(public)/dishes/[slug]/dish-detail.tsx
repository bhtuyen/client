import { formatCurrency } from '@/lib/utils';
import { DishRes } from '@/schemaValidations/dish.schema';
import Image from 'next/image';

export default function DishDetail({ dish }: { dish: DishRes['data'] | undefined }) {
  return (
    <>
      {dish && (
        <div className='space-y-4'>
          <h1 className='text-2xl lg:text-3xl font-semibold'>{dish.name}</h1>
          <div className='font-semibold'>Giá: {formatCurrency(dish.price)}</div>
          <Image
            src={dish.image}
            className='object-cover w-full h-full max-w-[1080px] max-h-[1080px] rounded-md'
            quality={100}
            width={700}
            height={700}
            alt={dish.name}
          />
          <p>{dish.description}</p>
        </div>
      )}
      {!dish && <div>Không tìm thấy món ăn</div>}
    </>
  );
}
