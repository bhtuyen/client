import EditTable from '@/app/[locale]/manage/tables/[number]/edit-table';

export default function Page({ params: { id: number } }: { params: { id: string } }) {
  return <EditTable number={number} />;
}
