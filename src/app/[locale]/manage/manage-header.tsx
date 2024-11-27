'use client';
import { SwitchLanguage } from '@/components/switch-language';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo } from 'react';

const uuidRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/;
export default function ManageHeader() {
  const pathname = usePathname();

  const slugs = useMemo(() => {
    return pathname
      .replace(uuidRegex, '')
      .replace('/manage', '')
      .split('/')
      .filter(Boolean)
      .map((slug, index, arr) => {
        return index == 0
          ? {
              key: `${slug}.title`,
              href: `/manage/${slug}`
            }
          : {
              key: `${arr[index - 1]}.${slug}.title`
            };
      });
  }, [pathname]);

  const tManage = useTranslations('manage');

  return (
    <header className='flex h-12 shrink-0 shadow items-center p-1 pr-2 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
      <SidebarTrigger />
      <Separator orientation='vertical' className='mr-2 h-4' />
      <Breadcrumb>
        <BreadcrumbList>
          {slugs.map((slug, index) => {
            return (
              <Fragment key={index}>
                <BreadcrumbItem className='text-base'>
                  {index == slugs.length - 1 ? (
                    <BreadcrumbPage className='font-semibold'>{tManage(slug.key as any)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={slug.href!}>{tManage(slug.key as any)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < slugs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className='ml-auto'>
        <SwitchLanguage />
      </div>
    </header>
  );
}
