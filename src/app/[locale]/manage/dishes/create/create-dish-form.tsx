'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Loader, Minus, Plus, Salad, Tags, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { CreateDishCombo, DishDtoDetailChoose, DishChooseBody, DishGroupDto } from '@/schemaValidations/dish.schema';

import AddDishGroup from '@/app/[locale]/manage/dishes/add-dish-group';
import ChooseDishTable from '@/app/[locale]/manage/dishes/choose-dish-table';
import revalidateApiRequest from '@/app/apiRequests/revalidate';
import { useCreateDishMutation, useDishGroupQuery } from '@/app/queries/useDish';
import { useUploadMediaMutation } from '@/app/queries/useMedia';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { DishCategory, DishStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { getEnumValues, getPriceString, handleErrorApi } from '@/lib/utils';
import { createDishCombo } from '@/schemaValidations/dish.schema';

export default function CreateDishForm() {
  const { setLoading } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [openFormAdd, setOpenFormAdd] = useState(false);
  const [groups, setGroups] = useState<DishGroupDto[]>([]);
  const [hideColumn, setHideColumn] = useState<string[]>(['options', 'quantity']);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const dishGroupQuery = useDishGroupQuery();
  const dishGroups = useMemo(() => dishGroupQuery.data?.payload.data || [], [dishGroupQuery.data]);

  useEffect(() => {
    setGroups(dishGroups);
  }, [dishGroups]);

  const form = useForm<CreateDishCombo>({
    resolver: zodResolver(createDishCombo),
    values: {
      name: '',
      description: '',
      groupId: '',
      price: 0,
      options: '',
      combos: [],
      dishes: [],
      category: DishCategory.Buffet,
      status: DishStatus.Available
    }
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

  const category = form.watch('category');
  const dishesSelected = form.watch('dishes');
  const combosSelected = form.watch('combos');
  const dishChooseBody = useMemo<DishChooseBody>(() => {
    switch (category) {
      case DishCategory.Buffet:
        return {
          categories: [DishCategory.ComboBuffet],
          ignores: combosSelected.map(({ comboId }) => comboId)
        };
      case DishCategory.Paid:
        return {
          categories: [DishCategory.ComboPaid],
          ignores: combosSelected.map(({ comboId }) => comboId)
        };
      case DishCategory.ComboBuffet:
        return {
          categories: [DishCategory.Buffet],
          ignores: dishesSelected.map(({ dishId }) => dishId)
        };
      case DishCategory.ComboPaid:
        return {
          categories: [DishCategory.Paid],
          ignores: dishesSelected.map(({ dishId }) => dishId)
        };
    }
  }, [category, dishesSelected, combosSelected]);

  const tDishStatus = useTranslations('dish-status');
  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tDishCategory = useTranslations('dish-category');
  const tManageDish = useTranslations('manage.dishes');

  const onSubmit = async (body: CreateDishCombo) => {
    if (createDishMutation.isPending) return;
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('combos', []);
    form.setValue('dishes', []);
  }, [category, form]);

  const getDishSelected = (dishesSelected: DishDtoDetailChoose[]) => {
    if (category === DishCategory.Buffet || category === DishCategory.Paid) {
      const old = form.getValues('combos');
      form.setValue('combos', old.concat(dishesSelected.map((combo) => ({ comboId: combo.id, quantity: combo.quantity, combo }))));
    } else {
      const old = form.getValues('dishes');
      form.setValue('dishes', old.concat(dishesSelected.map((dish) => ({ dishId: dish.id, quantity: dish.quantity, dish }))));
    }
  };

  return (
    <>
      <Form {...form}>
        <form noValidate className='p-4 pb-0 h-full flex flex-col' onSubmit={form.handleSubmit(onSubmit, console.log)}>
          <div className='h-[calc(100%_-_3rem)] flex w-full gap-x-2'>
            <div className='grid grid-cols-2 grid-rows-6 gap-x-4 flex-[3]'>
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem className='mb-4 flex-row items-center gap-x-2 col-span-2 row-span-2'>
                    <FormDescription>
                      <Avatar className='aspect-square size-40 rounded-md object-cover'>
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
                      <TButton type='button' variant='outline' onClick={() => imageInputRef.current?.click()} tooltip='upload-image'>
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
                    <FormLabel required>{tForm('dish-name')}</FormLabel>
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
                name='price'
                disabled={category === DishCategory.Buffet}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={category === DishCategory.Buffet}>{tForm('dish-price')}</FormLabel>
                    <FormControl>
                      <Input {...field} type='number' IconLeft={Banknote} min={0} />
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
                    <FormLabel className='flex items-center gap-x-1' required>
                      <Loader width={14} height={14} />
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
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-x-1' required>
                      <Tags size={14} />
                      {tForm('dish-category')}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value === DishCategory.ComboBuffet || value === DishCategory.Buffet) {
                          setHideColumn((prev) => [...prev, 'quantity']);
                        } else {
                          setHideColumn((prev) => prev.filter((item) => item !== 'quantity'));
                        }
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={tManageDish('choose-category')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getEnumValues(DishCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {tDishCategory(category)}
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
                    <FormLabel required>{tForm('dish-group')}</FormLabel>
                    <div className='flex items-center gap-x-4'>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tManageDish('choose-group')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-h-[200px]'>
                          {groups.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  <FormItem>
                    <FormLabel>{tForm('dish-description')}</FormLabel>
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
                    <FormLabel>{tForm('dish-options')}</FormLabel>
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
            <div className='pl-2 pb-2 h-full flex-[2] border-l space-y-2'>
              <div className='flex items-center justify-between pr-2'>
                <ChooseDishTable dishChooseBody={dishChooseBody} submit={getDishSelected} hideColumn={hideColumn} />
                <TButton
                  className='col-span-1 m-0'
                  type='button'
                  onClick={() => {
                    setOpenFormAdd(true);
                  }}
                >
                  {tButton('create-dish-group')}
                </TButton>
              </div>
              {(category === DishCategory.Buffet || category === DishCategory.Paid) && (
                <FormField
                  control={form.control}
                  name='combos'
                  render={({ field }) => (
                    <FormItem className='h-[calc(100%_-_3rem)]'>
                      {field.value.length > 0 && (
                        <ScrollArea className='w-full h-full'>
                          <div className='space-y-2'>
                            {field.value.map(({ comboId, combo: { price, image, name, description, category }, quantity }) => {
                              return (
                                <Badge key={comboId} variant='secondary' className='w-full flex items-center'>
                                  <TImage src={image} alt={name} className='size-20 rounded-full mr-4' />
                                  <div>
                                    <h3 className='text-sm'>{name}</h3>
                                    <p className='text-muted-foreground text-xs'>{description}</p>
                                  </div>
                                  <div className='flex items-center ml-auto gap-2'>
                                    {category === DishCategory.ComboPaid && (
                                      <div className='flex items-center gap-1 px-2 py-1 rounded-2xl border border-foreground'>
                                        <TButton
                                          size='icon'
                                          className='size-4'
                                          variant='ghost'
                                          type='button'
                                          tooltip='delete'
                                          onClick={() => {
                                            if (quantity === 1) return;
                                            field.onChange(
                                              field.value.map((item) => {
                                                if (item.comboId === comboId) {
                                                  return { ...item, quantity: quantity - 1 };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                        >
                                          <Minus />
                                        </TButton>
                                        <p className='w-4 text-center'>{quantity}</p>
                                        <TButton
                                          size='icon'
                                          className='size-4'
                                          variant='ghost'
                                          type='button'
                                          tooltip='delete'
                                          onClick={() => {
                                            if (quantity === 20) return;
                                            field.onChange(
                                              field.value.map((item) => {
                                                if (item.comboId === comboId) {
                                                  return { ...item, quantity: quantity + 1 };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                        >
                                          <Plus />
                                        </TButton>
                                      </div>
                                    )}
                                    {category === DishCategory.ComboBuffet && (
                                      <span className='text-red-600'>{getPriceString({ price, category })}</span>
                                    )}
                                    <Separator orientation='vertical' className='h-6' />
                                    <TButton
                                      size='icon'
                                      className='size-4'
                                      variant='ghost'
                                      type='button'
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      tooltip='delete'
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        field.onChange(field.value.filter((item) => item.comboId !== comboId));
                                      }}
                                    >
                                      <X />
                                    </TButton>
                                  </div>
                                </Badge>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                      {field.value.length === 0 && (
                        <div className='h-full flex items-center justify-center'>
                          <span>Chưa chọn</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}

              {(category === DishCategory.ComboBuffet || category === DishCategory.ComboPaid) && (
                <FormField
                  control={form.control}
                  name='dishes'
                  render={({ field }) => (
                    <FormItem className='h-[calc(100%_-_3rem)]'>
                      {field.value.length > 0 && (
                        <ScrollArea className='w-full h-full'>
                          <div className='space-y-2 pr-2'>
                            {field.value.map(({ dishId, dish: { price, image, name, description }, quantity }) => {
                              return (
                                <Badge key={dishId} variant='secondary' className='w-full flex items-center'>
                                  <TImage src={image} alt={name} className='size-20 rounded-full mr-4' />
                                  <div>
                                    <h3 className='text-sm'>{name}</h3>
                                    <p className='text-muted-foreground text-xs'>{description}</p>
                                  </div>
                                  <div className='flex items-center ml-auto gap-2'>
                                    {category === DishCategory.ComboPaid && (
                                      <div className='flex items-center gap-1 px-2 py-1 rounded-2xl border border-foreground'>
                                        <TButton
                                          size='icon'
                                          className='size-4'
                                          variant='ghost'
                                          type='button'
                                          tooltip='delete'
                                          onClick={() => {
                                            if (quantity === 1) return;
                                            field.onChange(
                                              field.value.map((item) => {
                                                if (item.dishId === dishId) {
                                                  return { ...item, quantity: quantity - 1 };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                        >
                                          <Minus />
                                        </TButton>
                                        <p className='w-4 text-center'>{quantity}</p>
                                        <TButton
                                          size='icon'
                                          className='size-4'
                                          variant='ghost'
                                          type='button'
                                          tooltip='delete'
                                          onClick={() => {
                                            if (quantity === 20) return;
                                            field.onChange(
                                              field.value.map((item) => {
                                                if (item.dishId === dishId) {
                                                  return { ...item, quantity: quantity + 1 };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                        >
                                          <Plus />
                                        </TButton>
                                      </div>
                                    )}
                                    {category === DishCategory.ComboBuffet && (
                                      <span className='text-red-600'>{getPriceString({ price, category })}</span>
                                    )}
                                    <Separator orientation='vertical' className='h-6' />
                                    <TButton
                                      size='icon'
                                      className='size-4'
                                      variant='ghost'
                                      type='button'
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      tooltip='delete'
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        field.onChange(field.value.filter((item) => item.dishId !== dishId));
                                      }}
                                    >
                                      <X />
                                    </TButton>
                                  </div>
                                </Badge>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                      {field.value.length === 0 && (
                        <div className='h-full flex items-center justify-center'>
                          <span>Chưa chọn</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
          <div className='flex items-center justify-center gap-x-4 h-12 w-full border-t'>
            <TButton type='button' variant='outline' asLink href='/manage/dishes'>
              {tButton('cancel')}
            </TButton>
            <TButton type='submit' disabled={form.formState.isSubmitting}>
              {tButton('save-change')}
            </TButton>
          </div>
        </form>
      </Form>
      <AddDishGroup open={openFormAdd} setOpen={setOpenFormAdd} />
    </>
  );
}
