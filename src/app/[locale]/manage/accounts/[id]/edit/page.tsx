import EditForm from '@/app/[locale]/manage/accounts/[id]/edit/edit-form';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditForm id={id} />;
}
