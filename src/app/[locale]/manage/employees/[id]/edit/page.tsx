import EditEmployee from '@/app/[locale]/manage/employees/[id]/edit/edit-employee';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditEmployee id={id} />;
}
