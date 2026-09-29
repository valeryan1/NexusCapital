import { getCompanyReport } from "./sectors.service.server";
import { db } from "@/db/index.server";
import { reports } from "@/db/schema";
import crypto from "crypto";

export async function generateResearchReport(ticker: string, userId: string) {
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
      "companyName": "PT Dian Swastatika Sentosa Tbk",
      "sector": "Energy",
      "subsector": "Coal",
      "exchange": "Main Board · IDX",
      "currentPrice": 35000,
      "previousClose": 34500,
      "priceChange": "+500 (+1.45%)",
      "priceChangePercent": 1.45,
      "nexusScore": 82,
      "valuation": {
        "per": { "value": 13.26, "sectorAvg": 8.93, "status": "Overvalued", "threshold": "Sector avg 8.93x" },
        "pbv": { "value": 2.82, "sectorAvg": 0.78, "status": "Overvalued", "threshold": "Sector avg 0.78x" },
        "roe": { "value": 22.5, "sectorAvg": 16.2, "status": "Healthy", "threshold": "> 15% is Healthy" },
        "divYield": { "value": 6.10, "sectorAvg": 4.94, "status": "Healthy", "threshold": "> 4% is High" },
        "der": { "value": 0.15, "sectorAvg": 0.85, "status": "Undervalued", "threshold": "< 1 is Healthy" },
        "ps": { "value": 6.68, "sectorAvg": 2.51, "status": "Overvalued", "threshold": "Sector avg 2.51x" },
        "pcf": { "value": 11.08, "sectorAvg": 5.5, "status": "Overvalued", "threshold": "Sector avg 5.5x" },
        "forwardPE": { "value": 12.95, "status": "Healthy", "threshold": "Forward looking" }
      },
      "priceRange": {
        "low52w": 25000,
        "high52w": 40000,
        "low52wDate": "2023-06-09",
        "high52wDate": "2023-10-30",
        "allTimeHigh": 45000,
        "allTimeHighDate": "2024-09-23",
        "ytdHigh": 38000,
        "ytdLow": 28000
      },
      "quantModels": {
        "piotroski": { "score": 8, "max": 9, "interpretation": "Exceptional Health", "color": "text-semantic-bull" },
        "altman": { "score": 3.8, "interpretation": "Safe Zone", "color": "text-semantic-bull" }
      },
      "intrinsicValue": {
        "fairValue": 38000,
        "marginOfSafety": 8.5, 
        "model": "10Y Discounted Cash Flow",
        "dcf": 38000,
        "relative": 35000,
        "ddm": 31000
      },
      "esgScore": {
        "total": 21.71,
        "rating": "Top ESG Performer",
        "environmental": 18.5,
        "social": 22.3,
        "governance": 24.4
      },
      "foreignFlow": [
        { "date": "D-4", "flow": 150 },
        { "date": "D-3", "flow": -45 },
        { "date": "D-2", "flow": 320 },
        { "date": "D-1", "flow": 850 },
        { "date": "Today", "flow": 1200 }
      ],
      "institutionalFlows": [
        { "name": "Vanguard", "change": 61979185 },
        { "name": "Strategic Advisers LLC", "change": 45428500 },
        { "name": "BlackRock Fund Advisors", "change": 23410540 },
        { "name": "T. Rowe Price", "change": -173075700 },
        { "name": "Capital Research & Mgmt.", "change": -203655628 },
        { "name": "Fidelity Mgmt. & Research", "change": -490522692 }
      ],
      "bandarmologi": {
        "status": "Massive Accumulation",
        "topBrokers": "RX, YU, KZ",
        "summary": "Foreign institutions are actively accumulating, creating strong price floors."
      },
      "aiAnalysis": {
        "executiveSummary": "...",
        "fundamentalDeepDive": "...",
        "technicalOutlook": "...",
        "riskFactors": ["Risk 1", "Risk 2"]
      },
      "peers": [
        { "subject": "Value", "${ticker}": 67, "SectorAvg": 50, "fullMark": 100 },
        { "subject": "Growth", "${ticker}": 75, "SectorAvg": 55, "fullMark": 100 },
        { "subject": "Health", "${ticker}": 90, "SectorAvg": 65, "fullMark": 100 },
        { "subject": "Dividend", "${ticker}": 72, "SectorAvg": 60, "fullMark": 100 },
        { "subject": "Momentum", "${ticker}": 58, "SectorAvg": 45, "fullMark": 100 }
      ],
      "peerComparison": [
        { "ticker": "${ticker}", "name": "Main Company", "perf12m": -22.19, "marketCapFrom": 976.34, "marketCapTo": 759.71, "isSubject": true },
        { "ticker": "ADRO", "name": "Adaro Energy", "perf12m": -21.11, "marketCapFrom": 597.17, "marketCapTo": 471.14, "isSubject": false }
      ],
      "ownership": {
        "data": [
          { "name": "Conglomerate", "value": 54.94, "color": "#FF7A00" },
          { "name": "Foreign Inst.", "value": 25.10, "color": "#3B82F6" },
          { "name": "Retail / Public Float", "value": 19.96, "color": "#10B981" }
        ]
      },
      "faqInsights": [
        { "question": "What are the insiders doing with ${ticker}?", "iconName": "Briefcase", "title": "Insiders and institutional owners have recently made significant moves", "content": "..." },
        { "question": "What should I know about ${ticker} market capitalization?", "iconName": "BarChart3", "title": "${ticker} is a top 30 market cap stock", "content": "..." },
        { "question": "Does ${ticker} pay dividends?", "iconName": "Ticket", "title": "${ticker} is a dividend paying stock", "content": "..." },
        { "question": "What about ${ticker}'s trading activity and liquidity?", "iconName": "Activity", "title": "${ticker} is heavily traded", "content": "..." },
        { "question": "Would ${ticker} be good for ESG-conscious investors?", "iconName": "Leaf", "title": "${ticker} is a top ESG performer", "content": "..." }
      ],
      "news": [
        { "id": 1, "date": "Sep 26, 2026", "headline": "Example News", "summary": "News summary", "sentiment": "Bullish", "tags": ["Analyst Ratings", "Bullish"] }
      ]
    }
  `;

  // 3. Call Gemini
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
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
    const parsedData = JSON.parse(textOutput);
    
    // Save to Database
    await db.insert(reports).values({
      userId,
      ticker: parsedData.ticker,
      reportType: "full",
      language: "en",
      status: "completed",
      nexusScore: parsedData.nexusScore,
      scoreLabel: parsedData.nexusScore >= 65 ? "Bull" : "Bear", 
      fundamentalAnalysis: JSON.stringify(parsedData.valuation),
      technicalAnalysis: JSON.stringify(parsedData.bandarmologi),
      finalSynthesis: JSON.stringify({ 
        intrinsic: parsedData.intrinsicValue, 
        quant: parsedData.quantModels,
        aiAnalysis: parsedData.aiAnalysis 
      }),
      rawDataSnapshot: rawData,
      requestId: crypto.randomUUID(),
      tokensUsed: 1500, // Dummy token usage for demo
    });

    return parsedData;
  } catch (err) {
    console.error(err);
    throw new Error("AI returned invalid JSON format.");
  }
}
