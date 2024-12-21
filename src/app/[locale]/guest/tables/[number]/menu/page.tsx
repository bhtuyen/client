import Header from '@/app/[locale]/guest/tables/[number]/menu/header';
import MenuTabs from '@/app/[locale]/guest/tables/[number]/menu/menu-tabs';

export default async function Page({ params: { number } }: { params: { number: string } }) {
  return (
    <div className='h-dvh bg-white'>
      <Header number={number} />
      <MenuTabs number={number} />
    </div>
  );
}
