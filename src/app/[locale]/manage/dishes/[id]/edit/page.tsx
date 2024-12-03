import EditDish from '@/app/[locale]/manage/dishes/[id]/edit/edit-dish';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditDish id={id} />;
}
