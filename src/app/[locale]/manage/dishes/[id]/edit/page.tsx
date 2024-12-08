import EditDishForm from '@/app/[locale]/manage/dishes/[id]/edit/edit-dish-form';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditDishForm id={id} />;
}
