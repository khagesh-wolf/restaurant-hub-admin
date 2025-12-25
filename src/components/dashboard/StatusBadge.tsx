import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'trial' | 'active' | 'expiring' | 'expired';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  trial: {
    label: 'Trial',
    className: 'bg-info/10 text-info hover:bg-info/20 border-info/20',
  },
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  },
  expiring: {
    label: 'Expiring Soon',
    className: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20',
  },
  expired: {
    label: 'Expired',
    className: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
