'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import React from 'react';

import type { TMessKey } from '@/types/message.type';
import type { UrlObject } from 'url';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/i18n/routing';
import { getArguments } from '@/lib/utils';

interface TButtonProps extends ButtonProps {
  tooltip?: TMessKey<'t-button'>;
  href?: string | UrlObject;

  asLink?: boolean;
}

const TButton = React.forwardRef<HTMLButtonElement, TButtonProps>(({ tooltip, asLink = false, children, href, className, ...props }, ref) => {
  const tButton = useTranslations('t-button');
  const tooltipMess = tButton(...getArguments(tooltip != undefined ? tooltip : 'default'));

  const isLinkButton = asLink && !!href;

  const child = isLinkButton ? (
    <Link href={href}>
      <span className='sr-only'>{tooltipMess}</span>
      {children}
    </Link>
  ) : (
    <>
      <span className='sr-only'>{tooltipMess}</span>
      {children}
    </>
  );
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...props}
            asChild={isLinkButton}
            ref={ref}
            className={clsx(
              {
                hidden: props.hidden
              },
              className
            )}
          >
            {child}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top' align='center' hidden={tooltip === undefined}>
          {tooltip != undefined && tooltipMess}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

TButton.displayName = 'TButton';

export default TButton;
