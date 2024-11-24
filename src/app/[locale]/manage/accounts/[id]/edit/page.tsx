import EditForm from '@/app/[locale]/manage/accounts/[id]/edit/edit-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Link } from '@/i18n/routing';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditForm id={id} />;
}
