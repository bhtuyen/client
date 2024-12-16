'use client';

import { addDays, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import TButton from '@/components/t-button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Period } from '@/schemaValidations/common.schema';
import type { Dispatch, HTMLAttributes, SetStateAction } from 'react';

interface TDateRangeProps extends HTMLAttributes<HTMLDivElement> {
  dateRange?: Period;
  setDateRange?: Dispatch<SetStateAction<Period>>;
}

export function TDateRange({ className, dateRange, setDateRange }: TDateRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dateRange?.fromDate ?? new Date(),
    to: dateRange?.toDate ?? addDays(new Date(), 20)
  });

  const onSelect = (date: DateRange | undefined) => {
    setDate(date);
    if (date) {
      setDateRange?.({
        fromDate: date.from ?? new Date(),
        toDate: date.to ?? new Date()
      });
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <TButton
            id='date'
            variant={'outline'}
            className={cn('min-w-[209px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
            size={'sm'}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </TButton>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={1}
            weekStartsOn={1}
            locale={vi}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
