import ChooseLanguage from '@/app/[locale]/guest/tables/[number]/choose-language';
import Image from 'next/image';
import React from 'react';

export default function page() {
  return (
    <div className='relative min-h-screen'>
      <Image src={'/GogiHouse_MB.jpg'} alt='' fill={true} objectFit='cover' quality={100} />
      <ChooseLanguage />
    </div>
  );
}
