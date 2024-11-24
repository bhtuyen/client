'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdateDishBody, UpdateDishBodyType } from '@/schemaValidations/dish.schema';
import { DishCategory, DishStatus } from '@/constants/enum';
import { Textarea } from '@/components/ui/textarea';
import { useDishGroupQuery, useDishQuery, useUpdateDishMutation } from '@/app/queries/useDish';
import { useUploadMediaMutation } from '@/app/queries/useMedia';
import revalidateApiRequest from '@/app/apiRequests/revalidate';
import { useTranslations } from 'next-intl';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AddDishGroup from '@/app/[locale]/manage/dishes/add-dish-group';

export default function EditDish({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: string | undefined;
  setId: (_value: string | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [openFormAdd, setOpenFormAdd] = useState(false);
  const [isShowPrice, setIsShowPrice] = useState(false);
  const form = useForm<UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: '',
      category: DishCategory.Buffet,
      options: '',
      groupId: '',
      status: DishStatus.Unavailable
    }
  });
  const tDishStatus = useTranslations('dish-status');

  const { data } = useDishQuery({ id: id!, enabled: Boolean(id) });

  useEffect(() => {
    if (data) {
      const { name, image, price, description, status } = data.payload.data;
      form.reset({
        name,
        image: image ?? undefined,
        price: price,
        description: description,
        status: status
      });
    }
  }, [data, form]);

  const image = form.watch('image');
  const name = form.watch('name');
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return image;
  }, [file, image]);

  const updateDishMutation = useUpdateDishMutation();
  const uploadMediaMutation = useUploadMediaMutation();
  const dishGroupQuery = useDishGroupQuery();

  const reset = () => {
    setId(undefined);
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
        console.log(imageUrl);
        _body = { ..._body, image: imageUrl };
      }

      const result = await updateDishMutation.mutateAsync(_body);
      await revalidateApiRequest.revalidateTag('dishes');

      toast({
        description: result.payload.message
      });

      reset();
      onSubmitSuccess?.();
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    }
  };
  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật món ăn</DialogTitle>
          <DialogDescription>Các trường sau đây là bắt buộc: Tên, ảnh</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-dish-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2 items-start justify-start'>
                      <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className='rounded-none'>{name || 'Ảnh chụp'}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            field.onChange('http://localhost:3000/' + file.name);
                          }
                        }}
                        className='hidden'
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name'>Tên món ăn</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field, formState }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <FormLabel>Thuộc loại</FormLabel>
                      <RadioGroup
                        defaultValue={field.value}
                        className='flex col-span-3 w-full gap-10'
                        onValueChange={(e) => {
                          field.onChange(e);
                          setIsShowPrice(e === DishCategory.Paid);
                        }}
                      >
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='Buffet' id='Buffet' />
                          <Label htmlFor='Buffet'>Buffet</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <RadioGroupItem value='Paid' id='Paid' />
                          <Label htmlFor='Paid'>Tính tiền</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='groupId'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description'>Thuộc nhóm</Label>
                      <div className='col-span-3 w-full flex gap-4'>
                        <div className='space-y-2 flex-auto'>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Chọn nhóm cho món ăn' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dishGroupQuery.data?.payload.data.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
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
                    </div>
                  </FormItem>
                )}
              />

              {isShowPrice && (
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='price'>Giá</Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input id='price' className='w-full' {...field} type='number' />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description'>Mô tả sản phẩm</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Textarea id='description' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='options'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description'>Thêm tùy chọn</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Textarea id='description' className='w-full' {...field} />
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
                            {getEnumValues(DishStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {tDishStatus(status)}
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
        <DialogFooter>
          <Button type='submit' form='edit-dish-form'>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
      <AddDishGroup open={openFormAdd} setOpen={setOpenFormAdd} />
    </Dialog>
  );
}
