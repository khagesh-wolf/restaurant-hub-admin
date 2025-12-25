export type Restaurant = {
  id: string;
  name: string;
  domain: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  trial_start: string;
  subscription_end: string | null;
  plan: '6_months' | '1_year' | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  supabase_project_id: string | null;
};

export type InsertRestaurant = {
  id?: string;
  name: string;
  domain?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  trial_start?: string;
  subscription_end?: string | null;
  plan?: '6_months' | '1_year' | null;
  is_active?: boolean;
  notes?: string | null;
  created_at?: string;
  supabase_project_id?: string | null;
};

export type UpdateRestaurant = Partial<InsertRestaurant>;
