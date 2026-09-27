export async function getCompanyReport(ticker: string) {
  const apiKey = process.env.SECTORS_API_KEY;
  if (!apiKey) {
    throw new Error("SECTORS_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://api.sectors.app/v2/company/report/${ticker}/`,
    {
      headers: {
        Authorization: apiKey,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Sectors API Error for ${ticker}:`, errText);
    throw new Error(`Failed to fetch report for ${ticker}`);
  }

  return await response.json();
}

export async function getTrendingStocks() {
  const apiKey = process.env.SECTORS_API_KEY;
  if (!apiKey) return [];
  
  const symbols = ["BBCA", "BMRI", "AMMN", "BREN", "GOTO"];
  const promises = symbols.map(s => 
    fetch(`https://api.sectors.app/v2/company/report/${s}/?sections=overview`, { 
      headers: { Authorization: apiKey } 
    }).then(res => res.ok ? res.json() : null).catch(() => null)
  );
  
  const results = await Promise.all(promises);
  return results.filter(Boolean).map((d: Record<string, unknown>) => ({
    ticker: (d.symbol as string)?.replace(".JK", "") || "",
    name: (d.company_name as string) || "",
    price: (d.overview as Record<string, number>)?.last_close_price || 0,
    change: (d.overview as Record<string, number>)?.daily_close_change || 0,
  }));
}
