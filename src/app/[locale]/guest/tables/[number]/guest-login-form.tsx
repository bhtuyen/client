'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GuestLoginBody, GuestLoginBodyType } from '@/schemaValidations/guest.schema';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useGuestLoginMutation } from '@/app/queries/useGuest';
import { handleErrorApi } from '@/lib/utils';
import { useAppStore } from '@/components/app-provider';
import { useRouter } from '@/i18n/routing';

export default function GuestLoginForm() {
  const searchParam = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const tableNumber = params.number as string;
  const token = searchParam.get('token');
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      token: token ?? '',
      tableNumber
    }
  });
  const guestLoginMutation = useGuestLoginMutation();
  const { setRole } = useAppStore();

  const onSubmit = async (data: GuestLoginBodyType) => {
    if (guestLoginMutation.isPending) return;
    try {
      const result = await guestLoginMutation.mutateAsync(data);
      const {
        payload: {
          data: {
            guest: { role }
          }
        }
      } = result;
      setRole(role);
      router.push(`/guest/menu`);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  useEffect(() => {
    if (!token) {
      router.push(`/`);
    }
  }, [router, token]);

  return (
    <Card className='mx-auto max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-2 max-w-[600px] flex-shrink-0 w-full'
            noValidate
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='name'>Tên khách hàng</Label>
                      <Input id='name' type='text' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full'>
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
