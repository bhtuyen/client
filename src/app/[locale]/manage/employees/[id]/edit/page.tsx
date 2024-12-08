import EditEmployeeForm from '@/app/[locale]/manage/employees/[id]/edit/edit-employee-form';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditEmployeeForm id={id} />;
}
