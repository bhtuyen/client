import ChangePasswordForm from '@/app/[locale]/manage/setting/change-password-form';
import UpdateProfileForm from '@/app/[locale]/manage/setting/update-profile-form';

export default function SettingPage() {
  return (
    <main className='grid gap-4 md:grid-cols-2 md:gap-8'>
      <UpdateProfileForm />
      <ChangePasswordForm />
    </main>
  );
}
