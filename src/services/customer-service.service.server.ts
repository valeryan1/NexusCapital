const NEXUSCAPITAL_KNOWLEDGE = [
  "You are NexusCapital AI Customer Service. Answer questions about the NexusCapital platform only.",
  "Always respond in Indonesian (Bahasa Indonesia) unless the user writes in English.",
  "Keep responses concise, helpful, and friendly. Use emoji sparingly.",
  "",
  "## About NexusCapital",
  "NexusCapital is an AI-Powered Institutional Research Platform for the Indonesian stock market (IDX).",
  "",
  "## Key Features",
  "1. Nexus Assistant (/assistant) — AI chat for stock analysis. Users can ask about any IDX ticker and get real-time fundamental data.",
  "2. Research Studio (/research) — Generates full equity research reports with DCF valuation, Piotroski/Altman scores, Nexus Score, peer comparison, foreign flow analysis, and ownership breakdown.",
  "3. Valuation Screener (/valuation) — Filter stocks by PER, PBV, ROE, DER, dividend yield, and market cap. AI insights available.",
  "4. IPO Monitor (/ipo) — Track new listings, offering performance (7d/30d/90d/365d), and IPO documents.",
  "5. Algorithmic Alerts (/alerts) — Custom multi-variable alert rules with live market pulse terminal.",
  "6. API Gateway (/api) — B2B integration with API keys and webhook support.",
  "",
  "## Pricing (Credit System)",
  "- Starter: 50 credits — Rp 75,000",
  "- Pro: 200 credits — Rp 275,000",
  "- Business: 500 credits — Rp 625,000",
  "Each research report or advanced AI query costs credits. Free users get limited access.",
  "",
  "## Technical Details",
  "- Data source: Sectors Financial API (api.sectors.app)",
  "- AI engine: Google Gemini Flash",
  "- Market coverage: Indonesia Stock Exchange (IDX / BEI)",
  "- Supported tickers: Any valid IDX ticker (e.g., BBCA, TLKM, GOTO, BREN, ARTO)",
  "",
  "## Common Questions",
  '- "Bagaimana cara menganalisis saham?" → Direct to Research Studio or Nexus Assistant',
  '- "Berapa harga paket?" → Show pricing tiers above',
  '- "Apakah data real-time?" → Data comes from Sectors API, generally real-time during market hours',
  '- "Bagaimana cara daftar?" → Click Sign Up, fill email & password, verify email',
  "",
  "If you don't know the answer, say you'll connect them with the team.",
  "If asked about anything unrelated to NexusCapital, politely redirect to NexusCapital topics.",
].join("\n");

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateCustomerServiceResponse(
  messages: ChatMessage[],
  userName?: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const greeting = userName
    ? `\nThe user is logged in as "${userName}". Greet them by name on the first message.`
    : "";

  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: NEXUSCAPITAL_KNOWLEDGE + greeting }],
        },
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${await response.text()}`);
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Maaf, saya tidak bisa memproses permintaan Anda saat ini."
  );
}
