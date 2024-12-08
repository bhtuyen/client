import ChooseLanguage from '@/app/[locale]/guest/tables/[number]/choose-language';
import TImage from '@/components/t-image';

export default function page() {
  return (
    <div className='relative min-h-screen'>
      <TImage src={'/GogiHouse_MB.jpg'} alt='' fill={true} objectFit='cover' quality={100} />
      <ChooseLanguage />
    </div>
  );
}
