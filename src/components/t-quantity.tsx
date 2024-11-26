import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

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
      <Button
        variant={'ghost'}
        className={`h-6 w-6 p-0 ${classIcon}`}
        disabled={value === 0 || disabled}
        onClick={() => onChange(value - 1)}
      >
        <Minus className='w-3 h-3' />
      </Button>
      <Input
        type='text'
        inputMode='numeric'
        pattern='[0-9]*'
        className={`h-6 p-1 w-8 text-center ${classInput}`}
        value={value}
        onChange={(e) => {
          let value = e.target.value;
          const numberValue = Number(value);
          if (isNaN(numberValue)) {
            return;
          }
          onChange(numberValue);
        }}
      />
      <Button
        variant={'ghost'}
        className={`h-6 w-6 p-0 ${classIcon}`}
        onClick={() => onChange(value + 1)}
        disabled={disabled}
      >
        <Plus className='w-3 h-3' />
      </Button>
    </div>
  );
}
