import { useState } from 'react';

import { Popover } from '@/components/ui/popover';

export default function TCombobox() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* <PopoverTrigger asChild>
        <Button variant='outline' role='combobox' aria-expanded={open} className='w-[150px] text-sm justify-between'>
          {table.getColumn('status')?.getFilterValue()
            ? tOrderStatus(table.getColumn('status')?.getFilterValue() as OrderStatus)
            : 'Trạng thái'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command>
          <CommandGroup>
            <CommandList>
              {getEnumValues(OrderStatus).map((status) => (
                <CommandItem
                  key={status}
                  value={status}
                  onSelect={(currentValue) => {
                    table
                      .getColumn('status')
                      ?.setFilterValue(
                        currentValue === table.getColumn('status')?.getFilterValue() ? '' : currentValue
                      );
                    setOpenStatusFilter(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      table.getColumn('status')?.getFilterValue() === status ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {tOrderStatus(status)}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command> 
      </PopoverContent> 

        <Input
            placeholder='Tên khách'
            value={(table.getColumn('guestName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('guestName')?.setFilterValue(event.target.value)}
            className='max-w-[100px]'
          />
          <Input
            placeholder='Số bàn'
            value={(table.getColumn('tableNumber')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('tableNumber')?.setFilterValue(event.target.value)}
            className='max-w-[80px]'
          /> */}
    </Popover>
  );
}
