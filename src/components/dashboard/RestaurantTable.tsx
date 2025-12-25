import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Restaurant, getRestaurantStatus, useToggleRestaurantActive, useExtendSubscription } from '@/hooks/useRestaurants';
import { StatusBadge } from './StatusBadge';
import { EditRestaurantDialog } from './EditRestaurantDialog';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Calendar, Pencil } from 'lucide-react';

interface RestaurantTableProps {
  restaurants: Restaurant[];
}

export function RestaurantTable({ restaurants }: RestaurantTableProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const toggleActive = useToggleRestaurantActive();
  const extendSubscription = useExtendSubscription();
  const { toast } = useToast();

  const handleToggleActive = async (restaurant: Restaurant) => {
    try {
      await toggleActive.mutateAsync({
        id: restaurant.id,
        isActive: !restaurant.is_active,
      });
      toast({
        title: restaurant.is_active ? 'Restaurant deactivated' : 'Restaurant activated',
        description: `${restaurant.name} has been ${restaurant.is_active ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update restaurant status.',
        variant: 'destructive',
      });
    }
  };

  const handleExtendSubscription = async (id: string, plan: '6_months' | '1_year') => {
    try {
      await extendSubscription.mutateAsync({ id, plan });
      toast({
        title: 'Subscription extended',
        description: `Subscription has been extended by ${plan === '6_months' ? '6 months' : '1 year'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to extend subscription.',
        variant: 'destructive',
      });
    }
  };

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No restaurants found. Add your first restaurant to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial Start</TableHead>
              <TableHead>Subscription End</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{restaurant.name}</div>
                    {restaurant.domain && (
                      <div className="text-sm text-muted-foreground">{restaurant.domain}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {restaurant.contact_email && <div>{restaurant.contact_email}</div>}
                    {restaurant.contact_phone && (
                      <div className="text-muted-foreground">{restaurant.contact_phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={getRestaurantStatus(restaurant)} />
                </TableCell>
                <TableCell>
                  {format(new Date(restaurant.trial_start), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {restaurant.subscription_end
                    ? format(new Date(restaurant.subscription_end), 'MMM d, yyyy')
                    : '—'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={restaurant.is_active}
                    onCheckedChange={() => handleToggleActive(restaurant)}
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingRestaurant(restaurant)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExtendSubscription(restaurant.id, '6_months')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Extend 6 months
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExtendSubscription(restaurant.id, '1_year')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Extend 1 year
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditRestaurantDialog
        restaurant={editingRestaurant}
        open={!!editingRestaurant}
        onOpenChange={(open) => !open && setEditingRestaurant(null)}
      />
    </>
  );
}
