'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { Login } from '@/schemaValidations/auth.schema';

import { useLoginMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Link, useRouter } from '@/i18n/routing';
import { getOauthGoogleUrl, handleErrorApi } from '@/lib/utils';
import { login } from '@/schemaValidations/auth.schema';

export default function LoginForm() {
  const { setRole, socket, createConnectSocket, disconnectSocket, setLoading } = useAppStore();
  const loginMutation = useLoginMutation();
  const googleOauthUrl = getOauthGoogleUrl();

  const form = useForm<Login>({
    resolver: zodResolver(login),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const searchParams = useSearchParams();

  const tLoginForm = useTranslations('login-form');
  const tButton = useTranslations('t-button');

  const router = useRouter();

  const clearTokens = searchParams?.get('clearTokens');

  useEffect(() => {
    if (clearTokens) {
      setRole(null);
      disconnectSocket();
    }
  }, [clearTokens, setRole, disconnectSocket]);

  const onSubmit = async (data: Login) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mx-auto max-w-sm'>
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
                    <FormLabel required>{tLoginForm('email')}</FormLabel>
                    <FormControl>
                      <Input id='email' type='email' placeholder='m@example.com' required {...field} />
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
                    <FormLabel required>{tLoginForm('password')}</FormLabel>
                    <FormControl>
                      <Input type='password' required {...field} />
                    </FormControl>
                    <div className='h-5'>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <TButton type='submit' className='w-full'>
                {tButton('login')}
              </TButton>
              <Link href={googleOauthUrl}>
                <TButton variant='outline' className='w-full' type='button'>
                  {tButton('login-with-google')}
                </TButton>
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
