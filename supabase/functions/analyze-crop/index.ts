import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageUrl, cropType } = await req.json();

    if (!imageUrl || !cropType) {
      return new Response(
        JSON.stringify({ error: "imageUrl and cropType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert agricultural pathologist and crop disease diagnostics AI. 
Analyze the provided crop image and return a structured diagnosis.

The crop type is: ${cropType}

You MUST respond by calling the diagnose_crop tool with your findings.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${cropType} crop image for diseases, pests, or nutrient deficiencies. Provide your diagnosis.`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "diagnose_crop",
              description: "Return structured crop disease diagnosis results",
              parameters: {
                type: "object",
                properties: {
                  disease_name: {
                    type: "string",
                    description: "Name of the identified disease, pest, or deficiency. Use 'Healthy' if no issues found.",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score from 0 to 100",
                  },
                  severity: {
                    type: "string",
                    enum: ["none", "low", "moderate", "high", "critical"],
                    description: "Severity level of the detected issue",
                  },
                  description: {
                    type: "string",
                    description: "Brief description of the diagnosis",
                  },
                  treatment: {
                    type: "string",
                    description: "Recommended treatment or action steps",
                  },
                  prevention: {
                    type: "string",
                    description: "Prevention tips for future crops",
                  },
                },
                required: ["disease_name", "confidence", "severity", "description", "treatment", "prevention"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "diagnose_crop" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const diagnosis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ diagnosis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return raw content if tool calling didn't work
    const content = data.choices?.[0]?.message?.content ?? "";
    return new Response(
      JSON.stringify({
        diagnosis: {
          disease_name: "Analysis Complete",
          confidence: 70,
          severity: "moderate",
          description: content,
          treatment: "Please consult an agronomist for detailed treatment.",
          prevention: "Regular monitoring recommended.",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-crop error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
