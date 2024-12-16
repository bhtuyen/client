'use client';
import { useState } from 'react';

import type { ReactNode } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from '@/i18n/routing';

export default function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      router.back();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle />
      <DialogContent className='max-h-full overflow-y-auto' aria-describedby=''>
        {children}
      </DialogContent>
    </Dialog>
  );
}
