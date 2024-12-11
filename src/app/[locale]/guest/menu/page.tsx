import Header from '@/app/[locale]/guest/menu/header';
import MenuTabs from '@/app/[locale]/guest/menu/menu-tabs';

export default async function Page() {
  return (
    <div className='h-full bg-white'>
      <Header />
      <MenuTabs />
    </div>
  );
}
