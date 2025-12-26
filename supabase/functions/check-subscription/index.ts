import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_id } = await req.json();

    if (!project_id) {
      console.log('Missing project_id in request');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Missing project_id' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking subscription for project: ${project_id}`);

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find restaurant by supabase_project_id
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id, name, is_active, trial_start, subscription_end, plan')
      .eq('supabase_project_id', project_id)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!restaurant) {
      console.log(`No restaurant found for project_id: ${project_id}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Restaurant not found',
          message: 'This restaurant is not registered in the system.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if restaurant is manually deactivated
    if (!restaurant.is_active) {
      console.log(`Restaurant ${restaurant.name} is deactivated`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          status: 'deactivated',
          message: 'Your restaurant has been deactivated. Please contact support.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();

    // If no subscription_end, check trial period (14 days from trial_start)
    if (!restaurant.subscription_end) {
      const trialStart = new Date(restaurant.trial_start);
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

      if (now > trialEnd) {
        console.log(`Restaurant ${restaurant.name} trial expired`);
        return new Response(
          JSON.stringify({ 
            valid: false, 
            status: 'trial_expired',
            message: 'Your trial period has ended. Please subscribe to continue.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Restaurant ${restaurant.name} in trial, ${daysRemaining} days remaining`);
      
      return new Response(
        JSON.stringify({ 
          valid: true, 
          status: 'trial',
          days_remaining: daysRemaining,
          message: `Trial period: ${daysRemaining} days remaining`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription end date
    const subscriptionEnd = new Date(restaurant.subscription_end);
    
    if (now > subscriptionEnd) {
      console.log(`Restaurant ${restaurant.name} subscription expired`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          status: 'expired',
          message: 'Your subscription has expired. Please renew to continue.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const daysRemaining = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`Restaurant ${restaurant.name} subscription valid, ${daysRemaining} days remaining`);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        status: 'active',
        plan: restaurant.plan,
        days_remaining: daysRemaining,
        expires_at: restaurant.subscription_end
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
