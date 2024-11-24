'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/app/queries/useAuth';
import { toast } from '@/hooks/use-toast';
import { getOauthGoogleUrl, handleErrorApi } from '@/lib/utils';
import { useAppStore } from '@/components/app-provider';
import { useEffect } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import SearchParamsLoader, { useSearchParamsLoader } from '@/components/search-params-loader';
import { KeysOfMessageType } from '@/types/message.type';

export default function LoginForm() {
  const { setRole, socket, createConnectSocket, disconnectSocket } = useAppStore();
  const loginMutation = useLoginMutation();
  const googleOauthUrl = getOauthGoogleUrl();

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { searchParams, setSearchParams } = useSearchParamsLoader();

  const tLoginForm = useTranslations('login-form');
  const tButton = useTranslations('button');

  const router = useRouter();

  const clearTokens = searchParams?.get('clearTokens');

  const tMessageValidation = useTranslations('message-validation');

  useEffect(() => {
    if (Boolean(clearTokens)) {
      setRole(null);
      disconnectSocket();
    }
  }, [clearTokens, setRole, disconnectSocket]);

  const onSubmit = async (data: LoginBodyType) => {
    if (loginMutation.isPending) return;

    try {
      const result = await loginMutation.mutateAsync(data);
      toast({
        description: result.payload.message
      });
      setRole(result.payload.data.account.role);
      if (!socket) {
        createConnectSocket(result.payload.data.accessToken);
      }
      router.push('/manage/dashboard');
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <Card className='mx-auto max-w-sm'>
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <CardHeader>
        <CardTitle className='text-2xl'>{tLoginForm('title')}</CardTitle>
        <CardDescription>{tLoginForm('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-2 max-w-[600px] flex-shrink-0 w-full'
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (error) => console.warn(error))}
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>{tLoginForm('email')}</Label>
                      <Input id='email' type='email' placeholder='m@example.com' required {...field} />
                      <FormMessage
                        message={
                          errors.email?.message
                            ? tMessageValidation(errors.email?.message as KeysOfMessageType<'message-validation'>)
                            : null
                        }
                      />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <div className='flex items-center'>
                        <Label htmlFor='password'>{tLoginForm('password')}</Label>
                      </div>
                      <Input id='password' type='password' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full'>
                {tButton('login')}
              </Button>
              <Link href={googleOauthUrl}>
                <Button variant='outline' className='w-full' type='button'>
                  {tButton('login-with-google')}
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
