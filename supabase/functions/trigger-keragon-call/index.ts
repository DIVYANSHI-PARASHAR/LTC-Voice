const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Triggering Keragon webhook for call initiation");

    const keraganUrl =
      "https://webhooks.us-1.keragon.com/v1/workflows/455ec3cb-d9cd-41c4-afbf-b9cbddda991a/cSY7jZThI4vfpb2y2HRl4/signal";

    const response = await fetch(keraganUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error(
        "Keragon webhook failed:",
        response.status,
        response.statusText
      );
      throw new Error(`Keragon webhook failed with status ${response.status}`);
    }

    const data = await response.text();
    console.log("Keragon webhook triggered successfully:", data);

    return new Response(
      JSON.stringify({ success: true, message: "Call triggered successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error triggering Keragon webhook:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
