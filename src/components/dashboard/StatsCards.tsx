import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Restaurant, getRestaurantStatus } from '@/hooks/useRestaurants';
import { Building2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatsCardsProps {
  restaurants: Restaurant[];
}

export function StatsCards({ restaurants }: StatsCardsProps) {
  const stats = restaurants.reduce(
    (acc, restaurant) => {
      const status = getRestaurantStatus(restaurant);
      acc.total++;
      if (status === 'trial') acc.trials++;
      if (status === 'expiring') acc.expiring++;
      if (status === 'expired') acc.expired++;
      return acc;
    },
    { total: 0, trials: 0, expiring: 0, expired: 0 }
  );

  const cards = [
    {
      title: 'Total Restaurants',
      value: stats.total,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Trials',
      value: stats.trials,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Expired',
      value: stats.expired,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
