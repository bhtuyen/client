'use client';
import { useChangePasswordMutation } from '@/app/queries/useAccount';
import TButton from '@/components/t-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { changePassword, ChangePassword } from '@/schemaValidations/account.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function ChangePasswordForm() {
  const [disabled, setDisabled] = useState(true);

  const changePasswordMutation = useChangePasswordMutation();

  const form = useForm<ChangePassword>({
    resolver: zodResolver(changePassword),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: ''
    },
    disabled
  });

  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tManageSetting = useTranslations('manage.setting');

  const onSubmit = async (data: ChangePassword) => {
    if (changePasswordMutation.isPending) return;
    try {
      const res = await changePasswordMutation.mutateAsync(data);
      toast({
        description: res.payload.message
      });
      form.reset();
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const onReset = () => {
    form.reset();
    setDisabled(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tManageSetting('change-password')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form noValidate className='grid auto-rows-max items-start' onSubmit={form.handleSubmit(onSubmit)} onReset={onReset}>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('old-password')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} IconLeft={KeyRound} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('new-password')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} IconLeft={KeyRound} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('confirm-password')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} IconLeft={KeyRound} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className=' items-center gap-4 md:ml-auto flex'>
              <TButton variant='outline' size='sm' type='reset' hidden={form.formState.disabled}>
                {tButton('cancel')}
              </TButton>
              <TButton size='sm' type='submit' hidden={form.formState.disabled} disabled={!form.formState.isDirty}>
                {tButton('save-change')}
              </TButton>
              <TButton size='sm' type='button' hidden={!form.formState.disabled} onClick={() => setDisabled(false)}>
                {tButton('update')}
              </TButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
