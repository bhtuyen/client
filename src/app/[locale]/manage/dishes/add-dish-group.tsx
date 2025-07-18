import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { CreateDishGroup } from '@/schemaValidations/dish.schema';

import { useCreateDishGroupMutation } from '@/app/queries/useDish';
import TButton from '@/components/t-button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { createDishGroup } from '@/schemaValidations/dish.schema';

export default function AddDishGroup({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const form = useForm<CreateDishGroup>({
    resolver: zodResolver(createDishGroup),
    defaultValues: {
      name: ''
    }
  });

  const createDishCatetory = useCreateDishGroupMutation();
  const onSubmit = async (body: CreateDishGroup) => {
    if (createDishCatetory.isPending) return;

    try {
      console.log(body);
      const result = await createDishCatetory.mutateAsync(body);
      toast({
        description: result.payload.message
      });
      reset();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const reset = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Thêm một nhóm</DialogTitle>
          <DialogDescription>Phân loại món ăn theo nhóm</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form noValidate id='add-dish-group-form' onSubmit={form.handleSubmit(onSubmit, console.log)}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <div className='grid gap-4 py-4'>
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='name' className='text-left'>
                        Tên nhóm
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                </div>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <TButton type='submit' form='add-dish-group-form'>
            Tạo
          </TButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
