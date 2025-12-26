import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { project_id } = await req.json();

    if (!project_id) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing project_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking subscription for project: ${project_id}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, name, is_active, trial_start, subscription_end, plan")
      .eq("supabase_project_id", project_id)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ valid: false, error: "Database error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!restaurant) {
      return new Response(
        JSON.stringify({ valid: false, error: "Restaurant not found", message: "This restaurant is not registered." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!restaurant.is_active) {
      return new Response(
        JSON.stringify({ valid: false, status: "deactivated", message: "Your restaurant has been deactivated." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();

    if (!restaurant.subscription_end) {
      const trialEnd = new Date(restaurant.trial_start);
      trialEnd.setDate(trialEnd.getDate() + 14);

      if (now > trialEnd) {
        return new Response(
          JSON.stringify({ valid: false, status: "trial_expired", message: "Trial period has ended." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return new Response(
        JSON.stringify({ valid: true, status: "trial", days_remaining: daysRemaining }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscriptionEnd = new Date(restaurant.subscription_end);

    if (now > subscriptionEnd) {
      return new Response(
        JSON.stringify({ valid: false, status: "expired", message: "Subscription has expired." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const daysRemaining = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return new Response(
      JSON.stringify({ valid: true, status: "active", plan: restaurant.plan, days_remaining: daysRemaining }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ valid: false, error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
