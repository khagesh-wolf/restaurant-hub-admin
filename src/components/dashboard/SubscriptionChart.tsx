import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRestaurants } from '@/hooks/useRestaurants';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function SubscriptionChart() {
  const { data: restaurants = [] } = useRestaurants();

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const activeCount = restaurants.filter((r) => {
        const trialStart = new Date(r.trial_start);
        const isCreatedBefore = trialStart <= monthEnd;
        const isActiveInMonth = r.is_active && (!r.subscription_end || new Date(r.subscription_end) >= monthStart);
        return isCreatedBefore && isActiveInMonth;
      }).length;

      const trialCount = restaurants.filter((r) => {
        const trialStart = new Date(r.trial_start);
        const isInTrial = !r.subscription_end && trialStart <= monthEnd;
        return isInTrial && r.is_active;
      }).length;

      const expiredCount = restaurants.filter((r) => {
        if (!r.subscription_end) return false;
        const subEnd = new Date(r.subscription_end);
        return subEnd <= monthEnd && subEnd >= monthStart;
      }).length;

      months.push({
        month: format(monthDate, 'MMM yyyy'),
        active: activeCount,
        trials: trialCount,
        expired: expiredCount,
      });
    }

    return months;
  }, [restaurants]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Subscription Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTrials" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="active"
                name="Active"
                stroke="hsl(var(--success))"
                fillOpacity={1}
                fill="url(#colorActive)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="trials"
                name="Trials"
                stroke="hsl(var(--info))"
                fillOpacity={1}
                fill="url(#colorTrials)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expired"
                name="Expired"
                stroke="hsl(var(--destructive))"
                fillOpacity={1}
                fill="url(#colorExpired)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
