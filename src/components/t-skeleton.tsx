'use client';
import { SidebarMenuItem, SidebarMenuSkeleton } from '@/components/ui/sidebar';

interface TNavSkeletonProps {
  length: number;
}

export default function TNavSkeleton({ length = 5 }: TNavSkeletonProps) {
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
