'use client';
import { useAccountQuery, useUpdateEmployeeMutation } from '@/app/queries/useAccount';
import { useUploadMediaMutation } from '@/app/queries/useMedia';
import TButton from '@/components/t-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Role } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import { updateEmployee, UpdateEmployee } from '@/schemaValidations/account.schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Mail, Phone, Upload, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function EditEmployeeForm({ id }: { id: string }) {
  const [file, setFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  const { data } = useAccountQuery(id);
  const account = data?.payload.data;

  const form = useForm<UpdateEmployee>({
    resolver: zodResolver(updateEmployee),
    values: account
  });

  const tRole = useTranslations('role');
  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');

  const avatar = form.watch('avatar');
  const name = form.watch('name');
  const changePassword = form.watch('changePassword');
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const updateEmployeeMutation = useUpdateEmployeeMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const onSubmit = async (employee: UpdateEmployee) => {
    if (updateEmployeeMutation.isPending) return;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadImageRes = await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageRes.payload.data;
        employee = { ...employee, avatar: imageUrl };
      }

      const result = await updateEmployeeMutation.mutateAsync(employee);

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
        className='max-w-[1000px] p-4'
        onSubmit={form.handleSubmit(onSubmit, (error) => {
          console.log(error);
        })}
      >
        <div className='grid grid-cols-3 gap-x-4'>
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
                <FormLabel>{tForm('name')}</FormLabel>
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm('email')}</FormLabel>
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
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm('role')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn quyền hạn' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getEnumValues(Role)
                      .filter((role) => role !== Role.Guest)
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          {tRole(role)}
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
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm('phone')}</FormLabel>
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
            name='changePassword'
            render={({ field }) => (
              <FormItem className='row-start-2 col-span-3'>
                <FormLabel>{tForm('change-password')}</FormLabel>
                <FormDescription>{tForm('change-password-description')}</FormDescription>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {changePassword && (
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('new-password')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} IconLeft={KeyRound} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}
          {changePassword && (
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tForm('confirm-password')}</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} IconLeft={KeyRound} />
                  </FormControl>
                  <div className='h-5'>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
        <div className='flex item-center justify-end gap-4'>
          <TButton type='button' variant='outline' asLink href={'/manage/employees'}>
            {tButton('cancel')}
          </TButton>
          <TButton type='submit' disabled={!form.formState.isDirty}>
            {tButton('save-change')}
          </TButton>
        </div>
      </form>
    </Form>
  );
}
