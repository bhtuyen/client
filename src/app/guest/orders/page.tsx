import OrderCart from '@/app/guest/orders/order-cart';

export default function GuestOrdersPage() {
  return (
    <div className='max-w-[400px] mx-auto space-y-4'>
      <h1 className='text-center text-xl font-bold'>🍕 Menu quán</h1>
      <OrderCart />
    </div>
  );
}
