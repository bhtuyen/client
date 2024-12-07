'use client';
import AddDishGroup from '@/app/[locale]/manage/dishes/add-dish-group';
import revalidateApiRequest from '@/app/apiRequests/revalidate';
import { useCreateDishMutation, useDishGroupQuery } from '@/app/queries/useDish';
import { useUploadMediaMutation } from '@/app/queries/useMedia';
import TButton from '@/components/t-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DishCategory, DishStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import type { CreateDish } from '@/schemaValidations/dish.schema';
import { createDish } from '@/schemaValidations/dish.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Loader, Salad, Tags, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AddDishForm() {
  const [file, setFile] = useState<File | null>(null);
  const [openFormAdd, setOpenFormAdd] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const dishGroupQuery = useDishGroupQuery();
  const dishGroups = dishGroupQuery.data?.payload.data ?? [];

  const form = useForm<CreateDish>({
    resolver: zodResolver(createDish)
  });

  const image = form.watch('image');
  const name = form.watch('name');
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return image;
  }, [file, image]);

  const reset = () => {
    form.reset();
    setFile(null);
  };

  const createDishMutation = useCreateDishMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const tDishStatus = useTranslations('dish-status');
  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tDishCategory = useTranslations('dish-category');
  const tManageDish = useTranslations('manage.dishes');

  const onSubmit = async (body: CreateDish) => {
    if (createDishMutation.isPending) return;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadImageRes = await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageRes.payload.data;

        body = { ...body, image: imageUrl };
      }

      const result = await createDishMutation.mutateAsync(body);
      await revalidateApiRequest.revalidateTag('dishes');

      toast({
        description: result.payload.message
      });

      reset();
      router.push('/manage/dishes');
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          noValidate
          className='p-4 h-full flex flex-col justify-between'
          onSubmit={form.handleSubmit(onSubmit, console.log)}
        >
          <div className='grid grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem className='flex items-center gap-4 space-y-0 col-span-3 mb-4'>
                  <FormDescription>
                    <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                      <AvatarImage src={previewAvatarFromFile} />
                      <AvatarFallback className='rounded-none'>{name || 'Avatar'}</AvatarFallback>
                    </Avatar>
                  </FormDescription>
                  <FormControl>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFile(file);
                          field.onChange('http://localhost:3000/' + file.name);
                        }
                      }}
                      ref={imageInputRef}
                      hidden
                    />
                  </FormControl>
                  <FormLabel>
                    <TButton
                      type='button'
                      variant='outline'
                      onClick={() => imageInputRef.current?.click()}
                      tooltip='upload-image'
                    >
                      <Upload />
                      <span className='sr-only'>{tButton('upload-image')}</span>
                    </TButton>
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('dish-name')}</FormLabel>
                  <FormControl>
                    <Input {...field} IconLeft={Salad} />
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
                <FormItem className='flex flex-col gap-y-1'>
                  <FormLabel className='flex items-center gap-x-1'>
                    <Loader width={16} height={16} />
                    {tForm('dish-status')}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={tManageDish('choose-status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getEnumValues(DishStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {tDishStatus(status)}
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
              name='groupId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('dish-group')}</FormLabel>
                  <div className='flex items-center gap-x-4'>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tManageDish('choose-group')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[200px]'>
                        {dishGroups.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className='col-span-1 m-0'
                      type='button'
                      onClick={() => {
                        setOpenFormAdd(true);
                      }}
                    >
                      Tạo nhóm
                    </Button>
                  </div>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-y-1'>
                  <FormLabel className='flex items-center gap-x-1'>
                    <Tags height={16} width={16} />
                    {tForm('dish-category')}
                  </FormLabel>
                  <FormControl className='h-9'>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='flex items-center gap-x-4'
                    >
                      <FormItem className='flex items-center space-y-0 gap-x-2'>
                        <FormControl>
                          <RadioGroupItem value='Buffet' />
                        </FormControl>
                        <FormLabel>{tDishCategory('Buffet')}</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 gap-x-2'>
                        <FormControl>
                          <RadioGroupItem value='Paid' />
                        </FormControl>
                        <FormLabel>{tDishCategory('Paid')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              disabled={form.watch('category') === DishCategory.Buffet}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input {...field} type='number' IconLeft={Banknote} min={0} pattern='([0-9]{1,3}).([0-9]{1,3})' />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='col-start-1'>
                  <FormLabel>Mô tả sản phẩm</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='options'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thêm tùy chọn</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className='flex items-center justify-center gap-x-4 mt-auto'>
            <TButton type='button' variant='outline' asLink href='/manage/dishes'>
              {tButton('cancel')}
            </TButton>
            <TButton type='submit'>{tButton('save-change')}</TButton>
          </div>
        </form>
      </Form>
      <AddDishGroup open={openFormAdd} setOpen={setOpenFormAdd} />
    </>
  );
}
