import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, InsertRestaurant, UpdateRestaurant } from '@/types/restaurant';
import { addMonths, addYears } from 'date-fns';

export type { Restaurant, InsertRestaurant, UpdateRestaurant };

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Restaurant[];
    },
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (restaurant: InsertRestaurant) => {
      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurant)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRestaurant }) => {
      const { data, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useToggleRestaurantActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useExtendSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: '6_months' | '1_year' }) => {
      const now = new Date();
      const subscriptionEnd = plan === '6_months' 
        ? addMonths(now, 6) 
        : addYears(now, 1);
      
      const { data, error } = await supabase
        .from('restaurants')
        .update({ 
          plan, 
          subscription_end: subscriptionEnd.toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
}

export function getRestaurantStatus(restaurant: Restaurant): 'trial' | 'active' | 'expiring' | 'expired' {
  const now = new Date();
  
  if (!restaurant.subscription_end) {
    return 'trial';
  }
  
  const endDate = new Date(restaurant.subscription_end);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'expired';
  }
  
  if (daysUntilExpiry <= 14) {
    return 'expiring';
  }
  
  return 'active';
}
