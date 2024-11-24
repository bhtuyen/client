'use client';
import clsx from 'clsx';
import { useState } from 'react';

export type TasbType = readonly { readonly key: string; readonly label: string }[];
export type TabsKeyType<T extends TasbType> = T[number]['key'];
export type TabsProps<T extends TasbType> = {
  tabs: T;
  onChangeActive?: (key: TabsKeyType<T>) => void;
  value?: TabsKeyType<T>;
  defaultValue?: TabsKeyType<T>;
};

export default function Tabs<T extends TasbType>({ tabs, onChangeActive, value, defaultValue }: TabsProps<T>) {
  const [activeTab, setActiveTab] = useState<TabsKeyType<T>>(defaultValue ?? tabs[0].key);
  return (
    <div className='flex items-center h-[40px] '>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          className={clsx('flex-1 h-full flex items-center justify-center cursor-pointer', {
            'text-red-500 relative before:contents-[""] before:absolute before:bottom-0 before:right-0 before:left-0 before:border-b-[2px] before:border-red-500':
              value ? value === tab.key : activeTab === tab.key
          })}
          onClick={() => {
            setActiveTab(tab.key);
            onChangeActive?.(tab.key);
          }}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
