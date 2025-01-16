'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, Table, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import type { CreateTable } from '@/schemaValidations/table.schema';

import { useCreateTableMutation } from '@/app/queries/useTable';
import TButton from '@/components/t-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentStatus, TableStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import { createTable } from '@/schemaValidations/table.schema';

export default function CreateTableForm() {
  const router = useRouter();
  const form = useForm<CreateTable>({
    resolver: zodResolver(createTable),
    defaultValues: {
      number: '',
      capacity: 1,
      status: TableStatus.Available,
      paymentStatus: PaymentStatus.Unpaid,
      callStaff: false,
      requestPayment: false
    }
  });

  const tTableStatus = useTranslations('table-status');
  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tManageTable = useTranslations('manage.tables');

  const createTableMutation = useCreateTableMutation();

  const onSubmit = async (body: CreateTable) => {
    if (createTableMutation.isPending) return;
    try {
      const result = await createTableMutation.mutateAsync(body);
      toast({
        description: result.payload.message
      });
      router.push('/manage/tables');
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
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
        </div>
        <FormItem className='flex-row justify-center gap-4'>
          <TButton type='button' variant='outline' asLink href={'/manage/tables'}>
            {tButton('cancel')}
          </TButton>
          <TButton type='submit'>{tButton('create-table')}</TButton>
        </FormItem>
      </form>
    </Form>
  );
}
