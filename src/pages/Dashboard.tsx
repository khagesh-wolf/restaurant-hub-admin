import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurants, getRestaurantStatus } from '@/hooks/useRestaurants';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RestaurantTable } from '@/components/dashboard/RestaurantTable';
import { AddRestaurantDialog } from '@/components/dashboard/AddRestaurantDialog';
import { SearchFilter } from '@/components/dashboard/SearchFilter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const { data: restaurants = [], isLoading, error } = useRestaurants();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.domain?.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.contact_email?.toLowerCase().includes(search.toLowerCase());

      const status = getRestaurantStatus(restaurant);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have admin permissions to access this dashboard.
          </p>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Utensils className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Restaurant Admin</h1>
              <p className="text-sm text-muted-foreground">Subscription Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
        ) : (
          <StatsCards restaurants={restaurants} />
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <AddRestaurantDialog />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Failed to load restaurants. Please try again.
          </div>
        ) : (
          <RestaurantTable restaurants={filteredRestaurants} />
        )}
      </main>
    </div>
  );
}
