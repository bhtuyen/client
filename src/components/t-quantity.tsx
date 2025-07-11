import { Minus, Plus } from 'lucide-react';

import TButton from '@/components/t-button';
import { Input } from '@/components/ui/input';

interface TQuantityProps {
  onChange: (_value: number) => void;
  value: number;
  disabled?: boolean;
  classIcon?: string;
  classInput?: string;
}

export default function TQuantity({ onChange, value, disabled = false, classIcon, classInput }: TQuantityProps) {
  return (
    <div className='flex gap-1 '>
      <TButton className={`h-6 w-6 p-0 ${classIcon}`} disabled={value === 0 || disabled} onClick={() => onChange(value - 1)} type='button'>
        <Minus className='w-3 h-3' />
      </TButton>
      <Input
        type='text'
        inputMode='numeric'
        id='quantity'
        pattern='[0-9]*'
        className={`h-6 p-1 w-8 text-center ${classInput}`}
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          const numberValue = Number(value);
          if (isNaN(numberValue)) {
            return;
          }
          onChange(numberValue);
        }}
      />
      <TButton className={`h-6 w-6 p-0 ${classIcon}`} onClick={() => onChange(value + 1)} disabled={disabled || value === 20} type='button'>
        <Plus className='w-3 h-3' />
      </TButton>
    </div>
  );
}
