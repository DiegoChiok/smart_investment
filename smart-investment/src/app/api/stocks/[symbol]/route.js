import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export const dynamic = "force-dynamic"; // avoid caching during dev

export async function GET(_req, { params }) {
  const symbol = params.symbol?.toUpperCase(); // get stock symbol from URL

  try {
    // Fetch 4 months of daily data (enough for 50-day MA + 30-day momentum)
    const period1 = new Date(Date.now() - 1000 * 60 * 60 * 24 * 130);
    const period2 = new Date();

    const [quote, chart] = await Promise.all([
      yahooFinance.quote(symbol), 
      yahooFinance.chart(symbol, { period1, period2, interval: "1d" })
    ]);

    const history =
      chart?.quotes
        ?.filter(q => q && q.close != null)
        .map(q => ({ date: q.date, close: q.close })) ?? [];

    return NextResponse.json({ quote, history }); // return stock info and historical data
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
