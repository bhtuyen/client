'use client';
import { useTableQuery, useUpdateTableMutation } from '@/app/queries/useTable';
import QRCodeTable from '@/components/qrcode-table';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TableStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { Link } from '@/i18n/routing';
import { getEnumValues, getTableLink, handleErrorApi } from '@/lib/utils';
import { updateTable, UpdateTable } from '@/schemaValidations/table.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function EditTable({ number }: { number: string }) {
  const form = useForm<UpdateTable>({
    resolver: zodResolver(updateTable),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false
    }
  });

  const { data } = useTableQuery(number);
  const tTableStatus = useTranslations('table-status');

  useEffect(() => {
    if (data) {
      const { capacity, status } = data.payload.data;
      form.reset({
        capacity,
        status,
        changeToken: form.getValues('changeToken')
      });
    }
  }, [data, form]);

  const updateTableMutation = useUpdateTableMutation();

  const onSubmit = async (body: UpdateTable) => {
    if (updateTableMutation.isPending) return;
    try {
      const result = await updateTableMutation.mutateAsync(body);

      toast({
        description: result.payload.message
      });
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const locale = useLocale();

  return (
    <>
      <Form {...form}>
        <form
          noValidate
          className='grid auto-rows-max items-start gap-4 md:gap-8'
          id='edit-table-form'
          onSubmit={form.handleSubmit(onSubmit, console.log)}
        >
          <div className='grid gap-4 py-4'>
            <FormItem>
              <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                <Label htmlFor='name'>Số hiệu bàn</Label>
                <div className='col-span-3 w-full space-y-2'>
                  <Input id='number' type='number' className='w-full' value={data?.payload.data.number ?? 0} readOnly />
                  <FormMessage />
                </div>
              </div>
            </FormItem>
            <FormField
              control={form.control}
              name='capacity'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                    <Label htmlFor='price'>Sức chứa (người)</Label>
                    <div className='col-span-3 w-full space-y-2'>
                      <Input id='capacity' className='w-full' {...field} type='number' />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                    <Label htmlFor='description'>Trạng thái</Label>
                    <div className='col-span-3 w-full space-y-2'>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn trạng thái' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getEnumValues(TableStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {tTableStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='changeToken'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                    <Label htmlFor='price'>Đổi QR Code</Label>
                    <div className='col-span-3 w-full space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Switch id='changeToken' checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </div>

                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormItem>
              <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                <Label>QR Code</Label>
                <div className='col-span-3 w-full space-y-2'>
                  {data && <QRCodeTable tableNumber={data.payload.data.number} token={data.payload.data.token} />}
                </div>
              </div>
            </FormItem>
            <FormItem>
              <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                <Label>URL gọi món</Label>
                <div className='col-span-3 w-full space-y-2'>
                  {data && (
                    <Link
                      href={getTableLink({
                        token: data.payload.data.token,
                        tableNumber: data.payload.data.number,
                        locale
                      })}
                      target='_blank'
                      className='break-all'
                    >
                      {getTableLink({
                        token: data.payload.data.token,
                        tableNumber: data.payload.data.number,
                        locale
                      })}
                    </Link>
                  )}
                </div>
              </div>
            </FormItem>
          </div>
        </form>
      </Form>
      <Button type='submit' form='edit-table-form'>
        Lưu
      </Button>
    </>
  );
}
