import * as React from 'react';

import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    IconLeft?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
    IconRight?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  }
>(({ className, type, IconLeft, IconRight, ...props }, ref) => {
  return (
    <div className='relative'>
      <input
        type={type}
        className={cn(
          'peer flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
          {
            'pl-10': IconLeft,
            'pr-10': IconRight
          }
        )}
        ref={ref}
        {...props}
      />
      {IconLeft && <IconLeft className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-ring' />}
      {IconRight && <IconRight className='pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-ring' />}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
