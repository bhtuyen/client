'use client';
import { SidebarMenuItem, SidebarMenuSkeleton } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

interface TNavSkeletonProps {
  length: number;
}

export function TNavSkeleton({ length = 5 }: TNavSkeletonProps) {
  return (
    <>
      {Array.from({ length }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton />
        </SidebarMenuItem>
      ))}
    </>
  );
}

export function OrderStaticsSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='min-h-36' />
      <Skeleton className='min-h-36' />
      <Skeleton className='min-h-36' />
      <Skeleton className='min-h-36' />
      <Skeleton className='min-h-36' />
    </div>
  );
}
