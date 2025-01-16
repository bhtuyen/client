'use client';

import { Loader } from 'lucide-react';

export default function TLoading() {
  return (
    <div className='fixed inset-0 bg-black/20 z-50 flex items-center justify-center'>
      <Loader className='animate-spin text-secondary' size={50} />
    </div>
  );
}
