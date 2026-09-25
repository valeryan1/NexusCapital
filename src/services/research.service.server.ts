import { getCompanyReport } from "./sectors.service.server";

export async function generateResearchReport(ticker: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // 1. Get raw data from Sectors API
  let rawData;
  try {
    rawData = await getCompanyReport(ticker);
  } catch {
    throw new Error(`Gagal mengambil data dari bursa untuk ticker ${ticker}. Pastikan ticker benar.`);
  }

  // 2. Prepare Prompt
  const prompt = `
    You are an elite institutional fund manager and quant analyst.
    I am giving you raw financial data for IDX stock ${ticker}.
    Extract, analyze, and map this data into the EXACT JSON format below. 
    Calculate a realistic fair value using a simplified DCF. Invent reasonable peer comparison numbers based on the industry if missing.
    Generate a Nexus Score (0-100) based on overall health. Ensure the numbers match the schema exactly.
    Do NOT include markdown formatting like \`\`\`json, just return the raw JSON string.

    Raw Data (truncated): ${JSON.stringify(rawData).substring(0, 15000)}
    
    Required JSON Schema:
    {
      "ticker": "${ticker}",
      "companyName": "PT Example Tbk",
      "sector": "Financials",
      "currentPrice": 9800,
      "priceChange": "+150 (+1.55%)",
      "nexusScore": 82,
      "valuation": {
        "per": { "value": 15.2, "status": "Healthy", "threshold": "< 15 is Undervalued" },
        "pbv": { "value": 4.8, "status": "Overvalued", "threshold": "< 1.5 is Undervalued" },
        "roe": { "value": 22.5, "status": "Healthy", "threshold": "> 15% is Healthy" },
        "divYield": { "value": 2.1, "status": "Healthy", "threshold": "> 4% is High" },
        "der": { "value": 0.15, "status": "Undervalued", "threshold": "< 1 is Healthy" }
      },
      "quantModels": {
        "piotroski": { "score": 8, "max": 9, "interpretation": "Exceptional Health", "color": "text-semantic-bull" },
        "altman": { "score": 3.8, "interpretation": "Safe Zone", "color": "text-semantic-bull" }
      },
      "intrinsicValue": {
        "fairValue": 11500,
        "marginOfSafety": 14.7, 
        "model": "10Y Discounted Cash Flow"
      },
      "foreignFlow": [
        { "date": "D-4", "flow": 150 },
        { "date": "D-3", "flow": -45 },
        { "date": "D-2", "flow": 320 },
        { "date": "D-1", "flow": 850 },
        { "date": "Today", "flow": 1200 }
      ],
      "bandarmologi": {
        "status": "Massive Accumulation",
        "topBrokers": "RX, YU, KZ",
        "summary": "Foreign institutions are actively accumulating..."
      },
      "peers": [
        { "subject": "ROE", "${ticker}": 22.5, "SectorAvg": 16.2, "fullMark": 25 },
        { "subject": "NPM", "${ticker}": 48.2, "SectorAvg": 30.1, "fullMark": 50 },
        { "subject": "CAR", "${ticker}": 28.5, "SectorAvg": 22.0, "fullMark": 30 },
        { "subject": "CASA", "${ticker}": 81.0, "SectorAvg": 60.5, "fullMark": 100 },
        { "subject": "Efficiency", "${ticker}": 85, "SectorAvg": 60, "fullMark": 100 }
      ],
      "historicalBands": [
        { "year": "2019", "per": 18, "pbv": 4.2 },
        { "year": "2020", "per": 14, "pbv": 3.5 },
        { "year": "2021", "per": 19, "pbv": 4.5 },
        { "year": "2022", "per": 21, "pbv": 5.0 },
        { "year": "2023", "per": 16, "pbv": 4.7 }
      ],
      "ownership": {
        "data": [
          { "name": "Conglomerate", "value": 54.94, "color": "#FF7A00" },
          { "name": "Foreign Inst.", "value": 25.10, "color": "#3B82F6" },
          { "name": "Retail", "value": 19.96, "color": "#10B981" }
        ]
      },
      "news": [
        { "id": 1, "date": "2 Hrs Ago", "headline": "Example News", "sentiment": "Bullish", "tag": "Earnings" },
        { "id": 2, "date": "5 Hrs Ago", "headline": "Example Macro News", "sentiment": "Neutral", "tag": "Macro" }
      ]
    }
  `;

  // 3. Call Gemini
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${await response.text()}`);
  }

  const responseData = await response.json();
  const textOutput = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textOutput) {
    throw new Error("Empty response from AI");
  }

  try {
    return JSON.parse(textOutput);
  } catch {
    throw new Error("AI returned invalid JSON format.");
  }
}
