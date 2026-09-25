import { getCompanyReport } from "./sectors.service.server";

export async function generateGeminiResponse(messages: {role: string, content: string}[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const geminiContents: { role: string; parts: { text?: string; functionCall?: unknown; functionResponse?: unknown }[] }[] = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const tools = [
    {
      functionDeclarations: [
        {
          name: "getCompanyReport",
          description: "Fetches real-time fundamental and technical financial data for an Indonesian stock ticker (IDX). Call this when the user asks for analysis of a specific company or ticker.",
          parameters: {
            type: "OBJECT",
            properties: {
              ticker: {
                type: "STRING",
                description: "The 4-letter stock ticker symbol without the .JK suffix (e.g., BBCA, TLKM, GOTO)",
              },
            },
            required: ["ticker"],
          },
        },
      ],
    },
  ];

  const requestBody = {
    contents: geminiContents,
    tools: tools,
    systemInstruction: {
      parts: [
        { 
          text: "You are Nexus Assistant, an elite AI financial analyst for the Indonesian stock market (IDX). You speak Indonesian professionally. Keep your responses structured, analytical, and highly concise. Use markdown for bolding and lists. ALWAYS use the getCompanyReport tool to fetch real financial data before analyzing a specific stock. Never invent data." 
        }
      ]
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to generate AI response: ${await response.text()}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  if (!candidate) {
    return "Maaf, saya tidak dapat menghasilkan respon saat ini.";
  }

  // Check if the model wants to call a function
  if (candidate.content.parts?.[0]?.functionCall) {
    const call = candidate.content.parts[0].functionCall;
    
    if (call.name === "getCompanyReport") {
      const ticker = call.args.ticker;
      let reportData;
      
      try {
        reportData = await getCompanyReport(ticker);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        reportData = { error: `Failed to fetch data for ${ticker}. ${errorMsg}` };
      }

      // Add the model's function call to history
      geminiContents.push(candidate.content);
      
      // Add the function response to history
      geminiContents.push({
        role: "function",
        parts: [{
          functionResponse: {
            name: "getCompanyReport",
            response: {
              name: "getCompanyReport",
              content: reportData
            }
          }
        }]
      });

      // Second call to get the final text response
      const finalResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: requestBody.systemInstruction
          }),
        }
      );

      const finalData = await finalResponse.json();
      return finalData.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, gagal memproses data dari Sectors API.";
    }
  }

  return candidate.content.parts?.[0]?.text || "Maaf, respons kosong.";
}
