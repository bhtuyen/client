'use client';

import { addDays, format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';

import type { Period } from '@/schemaValidations/common.schema';
import type { Dispatch, HTMLAttributes, SetStateAction } from 'react';
import type { DateRange } from 'react-day-picker';

import TButton from '@/components/t-button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TDateRangeProps extends HTMLAttributes<HTMLDivElement> {
  dateRange?: Period;
  setDateRange?: Dispatch<SetStateAction<Period>>;
}

export function TDateRange({ className, dateRange, setDateRange }: TDateRangeProps) {
  const localeIntl = useLocale();
  const [date, setDate] = useState<DateRange | undefined>({
    from: dateRange?.fromDate ?? new Date(),
    to: dateRange?.toDate ?? addDays(new Date(), 20)
  });

  const locale = useMemo(() => {
    return localeIntl === 'en' ? enUS : vi;
  }, [localeIntl]);

  const onSelect = (date: DateRange | undefined) => {
    setDate(date);
    if (date) {
      setDateRange?.({
        fromDate: date.from ?? new Date(),
        toDate: date.to ?? new Date()
      });
    }
  };

  const tDateRange = useTranslations('t-date-range');

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <TButton id='date' variant={'outline'} className={cn('min-w-56 justify-start text-left font-normal', !date && 'text-muted-foreground')}>
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
              <span>{tDateRange('placeholder')}</span>
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
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
