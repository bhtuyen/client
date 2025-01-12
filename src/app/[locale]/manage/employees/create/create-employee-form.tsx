'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Mail, Phone, Upload, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { CreateEmployee } from '@/schemaValidations/account.schema';

import { useAddEmployeeMutation } from '@/app/queries/useAccount';
import { useUploadMediaMutation } from '@/app/queries/useMedia';
import TButton from '@/components/t-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { handleErrorApi } from '@/lib/utils';
import { createEmployee } from '@/schemaValidations/account.schema';
export default function CreateEmployeeForm() {
  const [file, setFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const form = useForm<CreateEmployee>({
    resolver: zodResolver(createEmployee),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      avatar: undefined
    }
  });

  const adddEmployeeMutation = useAddEmployeeMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');

  const avatar = form.watch('avatar');
  const name = form.watch('name');

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const onSubmit = async (employee: CreateEmployee) => {
    if (adddEmployeeMutation.isPending) return;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadImageRes = await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageRes.payload.data;
        employee = { ...employee, avatar: imageUrl };
      }

      const result = await adddEmployeeMutation.mutateAsync(employee);

      toast({
        description: result.payload.message
      });

      router.push('/manage/employees');
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className='max-w-[1000px] p-4 h-full flex flex-col'
        onSubmit={form.handleSubmit(onSubmit, (error) => {
          console.log(error);
        })}
      >
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='avatar'
            render={({ field }) => (
              <FormItem className='col-span-3 mb-4 flex-row items-center gap-x-2'>
                <FormDescription>
                  <Avatar className='w-[100px] h-[100px] rounded-full object-cover'>
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
                    ref={avatarInputRef}
                    hidden
                  />
                </FormControl>
                <FormLabel>
                  <TButton type='button' variant='outline' onClick={() => avatarInputRef.current?.click()} tooltip='upload-image'>
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
                <FormLabel required>{tForm('name')}</FormLabel>
                <FormControl>
                  <Input type='name' {...field} IconLeft={User} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{tForm('phone')}</FormLabel>
                <FormControl>
                  <Input {...field} IconLeft={Phone} pattern='[0-9]*' />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{tForm('email')}</FormLabel>
                <FormControl>
                  <Input type='email' {...field} IconLeft={Mail} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{tForm('password')}</FormLabel>
                <FormControl>
                  <Input type='password' {...field} IconLeft={KeyRound} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{tForm('confirm-password')}</FormLabel>
                <FormControl>
                  <Input type='password' {...field} IconLeft={KeyRound} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className='flex item-center justify-end gap-4 mt-auto'>
          <TButton type='button' variant='outline' asLink href={'/manage/employees'}>
            {tButton('cancel')}
          </TButton>
          <TButton type='submit'>{tButton('create-employee')}</TButton>
        </div>
      </form>
    </Form>
  );
}
