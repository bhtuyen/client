'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { UpdateMe } from '@/schemaValidations/account.schema';

import { useAccountMeQuery, useUpdateMeMutation } from '@/app/queries/useAccount';
import { useUploadMediaMutation } from '@/app/queries/useMedia';
import TButton from '@/components/t-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { updateMe } from '@/schemaValidations/account.schema';

export default function UpdateProfileForm() {
  const [file, setFile] = useState<File | null>(null);
  const [disabled, setDisabled] = useState(true);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateMe>({
    resolver: zodResolver(updateMe),
    values: {
      name: '',
      avatar: undefined
    },
    disabled
  });

  const { data: profile, refetch } = useAccountMeQuery();

  useEffect(() => {
    if (profile) {
      const { name, avatar } = profile.payload.data;
      form.reset({ name, avatar: avatar ?? undefined });
    }
  }, [profile, form]);

  const updateMeMutation = useUpdateMeMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');
  const tManageSetting = useTranslations('manage.setting');

  const avatar = form.watch('avatar');
  const name = form.watch('name');
  const previewAvatar = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const onReset = () => {
    form.reset();
    setFile(null);
    setDisabled(true);
  };

  const onSubmit = async (me: UpdateMe) => {
    if (updateMeMutation.isPending) return;
    try {
      let body = me;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadImageRes = await uploadMediaMutation.mutateAsync(formData);
        const imageUrl = uploadImageRes.payload.data;
        body = { ...body, avatar: imageUrl };
      }

      const result = await updateMeMutation.mutateAsync(body);

      toast({
        description: result.payload.message
      });

      refetch();

      setDisabled(true);
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tManageSetting('personal-information')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form noValidate className='flex flex-col' onReset={onReset} onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}>
            <FormField
              control={form.control}
              name='avatar'
              render={({ field, formState: { disabled } }) => (
                <FormItem className='col-span-3 mb-4 flex-row items-center gap-x-2'>
                  <FormDescription>
                    <Avatar className='w-[100px] h-[100px] rounded-full object-cover'>
                      <AvatarImage src={previewAvatar} />
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
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormLabel>
                    <TButton
                      type='button'
                      variant='outline'
                      onClick={() => avatarInputRef.current?.click()}
                      tooltip='upload-image'
                      disabled={disabled}
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

            <div className='items-center gap-4 md:ml-auto flex'>
              <TButton variant='outline' size='sm' type='reset' hidden={form.formState.disabled}>
                {tButton('cancel')}
              </TButton>
              <TButton size='sm' type='submit' hidden={form.formState.disabled} disabled={!form.formState.isDirty}>
                {tButton('save-change')}
              </TButton>
              <TButton size='sm' type='button' hidden={!form.formState.disabled} onClick={() => setDisabled(false)}>
                {tButton('update')}
              </TButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
