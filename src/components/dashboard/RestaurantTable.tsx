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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Restaurant, getRestaurantStatus, useToggleRestaurantActive, useExtendSubscription, useDeleteRestaurant } from '@/hooks/useRestaurants';
import { StatusBadge } from './StatusBadge';
import { EditRestaurantDialog } from './EditRestaurantDialog';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Calendar, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface RestaurantTableProps {
  restaurants: Restaurant[];
}

export function RestaurantTable({ restaurants }: RestaurantTableProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null);
  const toggleActive = useToggleRestaurantActive();
  const extendSubscription = useExtendSubscription();
  const deleteRestaurant = useDeleteRestaurant();
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

  const handleDeleteRestaurant = async () => {
    if (!deletingRestaurant) return;
    
    try {
      await deleteRestaurant.mutateAsync(deletingRestaurant.id);
      toast({
        title: 'Restaurant deleted',
        description: `${deletingRestaurant.name} has been deleted.`,
      });
      setDeletingRestaurant(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete restaurant.',
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
              <TableHead>Linked Project</TableHead>
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
                  {restaurant.supabase_project_id ? (
                    <a
                      href={`https://supabase.com/dashboard/project/${restaurant.supabase_project_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {restaurant.supabase_project_id.slice(0, 8)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeletingRestaurant(restaurant)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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

      <AlertDialog open={!!deletingRestaurant} onOpenChange={(open) => !open && setDeletingRestaurant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRestaurant?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRestaurant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
