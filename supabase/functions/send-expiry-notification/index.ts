import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Restaurant {
  id: string;
  name: string;
  contact_email: string;
  subscription_end: string;
  domain: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get restaurants expiring in the next 14 days
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const { data: expiringRestaurants, error } = await supabase
      .from("restaurants")
      .select("id, name, contact_email, subscription_end, domain")
      .eq("is_active", true)
      .not("subscription_end", "is", null)
      .not("contact_email", "is", null)
      .gte("subscription_end", now.toISOString())
      .lte("subscription_end", in14Days.toISOString());

    if (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }

    console.log(`Found ${expiringRestaurants?.length || 0} restaurants with expiring subscriptions`);

    const emailResults = [];

    for (const restaurant of expiringRestaurants || []) {
      const expiryDate = new Date(restaurant.subscription_end);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Restaurant Subscriptions <onboarding@resend.dev>",
            to: [restaurant.contact_email],
            subject: `Subscription Expiring Soon - ${restaurant.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Subscription Expiring Soon</h1>
                <p>Hello,</p>
                <p>This is a reminder that the subscription for <strong>${restaurant.name}</strong> will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}</strong>.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Restaurant:</strong> ${restaurant.name}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Domain:</strong> ${restaurant.domain || 'N/A'}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
                </div>
                <p>Please contact your administrator to renew your subscription.</p>
                <p>Best regards,<br>Restaurant Subscription Management</p>
              </div>
            `,
          }),
        });

        const emailData = await emailResponse.json();

        console.log(`Email sent to ${restaurant.contact_email} for ${restaurant.name}:`, emailData);
        emailResults.push({ restaurant: restaurant.name, status: "sent", email: restaurant.contact_email });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${restaurant.contact_email}:`, emailError);
        emailResults.push({ restaurant: restaurant.name, status: "failed", error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: expiringRestaurants?.length || 0,
        results: emailResults 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-expiry-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
