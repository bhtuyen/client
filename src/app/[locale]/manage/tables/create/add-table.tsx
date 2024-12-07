'use client';
import { useCreateTableMutation } from '@/app/queries/useTable';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import { createTable, CreateTable } from '@/schemaValidations/table.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

export default function AddTable() {
  const form = useForm<CreateTable>({
    resolver: zodResolver(createTable),
    defaultValues: {
      number: undefined,
      capacity: 2,
      status: TableStatus.Hidden
    }
  });

  const tTableStatus = useTranslations('table-status');
  const reset = () => {
    form.reset();
  };

  const createTableMutation = useCreateTableMutation();

  const onSubmit = async (body: CreateTable) => {
    if (createTableMutation.isPending) return;

    try {
      const result = await createTableMutation.mutateAsync(body);

      toast({
        description: result.payload.message
      });

      reset();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          noValidate
          className='grid auto-rows-max items-start gap-4 md:gap-8'
          id='add-table-form'
          onSubmit={form.handleSubmit(onSubmit, console.log)}
        >
          <div className='grid gap-4 py-4'>
            <FormField
              control={form.control}
              name='number'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                    <Label htmlFor='name'>Số hiệu bàn</Label>
                    <div className='col-span-3 w-full space-y-2'>
                      <Input id='number' type='text' className='w-full' {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='capacity'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                    <Label htmlFor='price'>Lượng khách cho phép</Label>
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
          </div>
        </form>
      </Form>

      <Button type='submit' form='add-table-form'>
        Thêm
      </Button>
    </>
  );
}
