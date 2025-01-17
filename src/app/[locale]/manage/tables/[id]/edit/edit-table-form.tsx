'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, Table, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { UpdateTable } from '@/schemaValidations/table.schema';
import type { TMessageKeys } from '@/types/message.type';

import { useTableQuery, useUpdateTableMutation } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PaymentStatus, TableStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { Link, useRouter } from '@/i18n/routing';
import { getEnumValues, getTableLink, handleErrorApi } from '@/lib/utils';
import { updateTable } from '@/schemaValidations/table.schema';

export default function EditTableForm({ id }: { id: string }) {
  const { setLoading } = useAppStore();
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading } = useTableQuery(id);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  const tTableStatus = useTranslations('table-status');
  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tManageTable = useTranslations('manage.tables');
  const tToast = useTranslations('t-toast');

  const table = data?.payload.data;

  const form = useForm<UpdateTable>({
    resolver: zodResolver(updateTable),
    values: {
      id: '',
      capacity: 0,
      changeToken: false,
      number: '',
      status: TableStatus.Available,
      callStaff: false,
      requestPayment: false,
      dishBuffetId: null,
      paymentStatus: PaymentStatus.Unpaid
    }
  });

  useEffect(() => {
    if (table) {
      const { id, capacity, number, status, dishBuffetId } = table;
      form.reset({ id, capacity, changeToken: false, number, status, dishBuffetId });
    }
  }, [table, form]);

  const updateTableMutation = useUpdateTableMutation();

  const onSubmit = async (body: UpdateTable) => {
    setLoading(true);
    if (updateTableMutation.isPending) return;
    try {
      const result = await updateTableMutation.mutateAsync(body);
      toast({
        description: tToast(result.payload.message as TMessageKeys<'t-toast'>)
      });
      router.push('/manage/tables');
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form noValidate className='p-4 h-full flex flex-col justify-between' onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <div className='grid grid-cols-2 gap-2'>
          <FormField
            control={form.control}
            name='number'
            render={({ field }) => (
              <FormItem className='col-start-1'>
                <FormLabel>{tForm('table-number')}</FormLabel>
                <FormControl>
                  <Input {...field} IconLeft={Table} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='capacity'
            render={({ field }) => (
              <FormItem className='col-start-1'>
                <FormLabel>{tForm('table-capacity')}</FormLabel>
                <FormControl>
                  <Input {...field} type='number' IconLeft={User} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem className='col-start-1'>
                <FormLabel className='flex items-center gap-x-1'>
                  <Loader width={14} height={14} />
                  {tForm('table-status')}
                </FormLabel>

                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={tManageTable('choose-status')} />
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

                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='changeToken'
            render={({ field }) => (
              <FormItem className='col-start-1'>
                <FormLabel>{tForm('change-token')}</FormLabel>
                <FormDescription>{tForm('change-token-description')}</FormDescription>
                <FormControl>
                  <Switch id='changeToken' checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormItem className='row-start-1 col-start-2 row-span-5 flex flex-col items-center'>
            <FormLabel>{tForm('qr-code')}</FormLabel>
            {table && <QRCodeTable token={table.token} tableNumber={table.number} size={300} />}
          </FormItem>

          <FormItem className='col-start-1'>
            <FormLabel>URL gọi món</FormLabel>
            <FormDescription>
              {table && (
                <Link
                  href={getTableLink({
                    token: table.token,
                    tableNumber: table.number,
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
            </FormDescription>
          </FormItem>
        </div>
        <FormItem className='flex-row justify-center gap-4'>
          <TButton type='button' variant='outline' asLink href={'/manage/tables'}>
            {tButton('cancel')}
          </TButton>
          <TButton type='submit' disabled={!form.formState.isDirty}>
            {tButton('save-change')}
          </TButton>
        </FormItem>
      </form>
    </Form>
  );
}
