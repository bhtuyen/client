'use client';
import AddDishGroup from '@/app/[locale]/manage/dishes/create/add-dish-group';
import revalidateApiRequest from '@/app/apiRequests/revalidate';
import { useDishGroupQuery, useDishQuery, useUpdateDishMutation } from '@/app/queries/useDish';
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
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import { UpdateDishBody, UpdateDishBodyType } from '@/schemaValidations/dish.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Salad, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function EditDish({ id }: { id: string }) {
  const updateDishMutation = useUpdateDishMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const { data } = useDishQuery({ id: id!, enabled: Boolean(id) });
  const dish =
    data?.payload.data ??
    ({
      id: '1fef656a-3d71-440a-8660-b1abd2e26e23',
      name: 'Salad hành paro',
      price: 69000,
      description: 'Salad hành paro',
      image: 'http://localhost:4000/static/0011b20501a14cce8d451357d7fc5282.jpg',
      status: 'Available',
      category: 'Paid',
      groupId: 'da5e0a32-fb59-4474-9502-942f70811065',
      options: ''
    } as UpdateDishBodyType);

  const dishGroupQuery = useDishGroupQuery();
  const dishGroups = dishGroupQuery.data?.payload.data ?? [];

  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [openFormAdd, setOpenFormAdd] = useState(false);

  const form = useForm<UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody),
    values: dish
  });

  const tDishStatus = useTranslations('dish-status');
  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tDishCategory = useTranslations('dish-category');

  const image = form.watch('image');
  const name = form.watch('name');

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return image;
  }, [file, image]);

  const reset = () => {
    setFile(null);
  };

  const onSubmit = async (body: UpdateDishBodyType) => {
    if (updateDishMutation.isPending) return;
    try {
      let _body: UpdateDishBodyType & { id: string } = {
        id: id!,
        ...body
      };
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadImageRes = await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageRes.payload.data;
        _body = { ..._body, image: imageUrl };
      }

      const result = await updateDishMutation.mutateAsync(_body);
      await revalidateApiRequest.revalidateTag('dishes');

      toast({
        description: result.payload.message
      });

      reset();
    } catch (error: any) {
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
          <div className='grid grid-cols-3 gap-x-4'>
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
                  <FormLabel>{tForm('name')}</FormLabel>
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
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn trạng thái' />
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
                          <SelectValue placeholder='Chọn nhóm cho món ăn' inputMode='decimal' />
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
                <FormItem className='flex items-center space-y-0 gap-x-8 mb-5 h-[68px]'>
                  <FormLabel>{tForm('dish-category')}</FormLabel>
                  <FormControl>
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
                    <Input {...field} type='number' />
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
          <div className='flex items-center justify-end mt-auto'>
            <Button type='submit'>Lưu</Button>
          </div>
        </form>
      </Form>
      <AddDishGroup open={openFormAdd} setOpen={setOpenFormAdd} />
    </>
  );
}
