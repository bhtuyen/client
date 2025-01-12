import OrderTableDetail from '@/app/[locale]/manage/orders/table/[number]/order-table-detail';

export default function page({ params: { number } }: { params: { number: string } }) {
  return <OrderTableDetail number={number} />;
}
