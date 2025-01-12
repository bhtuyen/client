import { Suspense } from 'react';

import ChooseLanguage from '@/app/[locale]/guest/tables/[tableNumber]/choose-language';
import TImage from '@/components/t-image';

export default function page() {
  return (
    <div className='h-dvh relative'>
      <TImage src={'/restaurant.jpg'} alt='' fill style={{ objectFit: 'cover' }} quality={100} />
      <Suspense>
        <ChooseLanguage />
      </Suspense>
    </div>
  );
}
