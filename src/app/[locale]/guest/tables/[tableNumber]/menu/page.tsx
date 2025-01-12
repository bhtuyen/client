import Header from '@/app/[locale]/guest/tables/[tableNumber]/menu/header';
import MenuTabs from '@/app/[locale]/guest/tables/[tableNumber]/menu/menu-tabs';

export default async function Page({ params: { tableNumber } }: { params: { tableNumber: string } }) {
  return (
    <div className='h-dvh bg-white'>
      <Header tableNumber={tableNumber} />
      <MenuTabs tableNumber={tableNumber} />
    </div>
  );
}
