import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreateDishGroupBody, CreateDishGroupBodyType } from '@/schemaValidations/dish.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateDishGroupMutation } from '@/app/queries/useDish';
import { handleErrorApi } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';

export default function AddDishGroup({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const form = useForm<CreateDishGroupBodyType>({
    resolver: zodResolver(CreateDishGroupBody),
    defaultValues: {
      name: '',
      code: ''
    }
  });

  const createDishCatetory = useCreateDishGroupMutation();
  const onSubmit = async (body: CreateDishGroupBodyType) => {
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
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <div className='grid gap-4 py-4'>
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='code' className='text-left'>
                        Mã nhóm
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='code' className='w-full' {...field} />
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
          <Button type='submit' form='add-dish-group-form'>
            Tạo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
