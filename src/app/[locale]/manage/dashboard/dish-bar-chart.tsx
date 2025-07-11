'use client';

import { TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import type { ChartConfig } from '@/components/ui/chart';
import type { DashboardIndicatorRes } from '@/schemaValidations/indicator.schema';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const colors = ['var(--color-chrome)', 'var(--color-safari)', 'var(--color-firefox)', 'var(--color-edge)', 'var(--color-other)'];

const chartConfig = {
  visitors: {
    label: 'Visitors'
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))'
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))'
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))'
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))'
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig;

export function DishBarChart({ chartData }: { chartData: Pick<DashboardIndicatorRes['data']['dishesIndicator'][0], 'name' | 'successOrders'>[] }) {
  const chartDataColors = useMemo(
    () =>
      chartData.map((data, index) => ({
        ...data,
        fill: colors[index] ?? colors[colors.length - 1]
      })),
    [chartData]
  );

  const tDashboard = useTranslations('manage.dashboard');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tDashboard('dish-ranking')}</CardTitle>
        <CardDescription>{tDashboard('most-ordered')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDataColors}
            layout='vertical'
            margin={{
              left: 0
            }}
          >
            <YAxis
              dataKey='name'
              type='category'
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => {
                return value;

                // return chartConfig[value as keyof typeof chartConfig]?.label
              }}
              width={150}
            />
            <XAxis dataKey='successOrders' type='number' hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey='successOrders' name={tDashboard('paied')} layout='vertical' radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-start gap-2 text-sm'>
        <div className='flex gap-2 font-medium leading-none'>
          Trending up by 5.2% this month <TrendingUp className='h-4 w-4' />
        </div>
        <div className='leading-none text-muted-foreground'>Showing total visitors for the last 6 months</div>
      </CardFooter>
    </Card>
  );
}
