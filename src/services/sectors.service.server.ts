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
