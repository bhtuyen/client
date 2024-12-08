import EditTableForm from '@/app/[locale]/manage/tables/[id]/edit/edit-table-form';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditTableForm id={id} />;
}
