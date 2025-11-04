import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET(_req, { params }) {
  const { symbol } = await params;

  try {
    // Fetch stock data from your stocks endpoint
    const stockRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/stocks/${symbol}`
    );
    if (!stockRes.ok) throw new Error("Stock not found");
    const stockData = await stockRes.json();

    const stock = stockData.quote || stockData;

    // Prepare stock context for AI
    const stockContext = `
Stock: ${stock.longName} (${stock.symbol})
Current Price: $${stock.regularMarketPrice}
Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B
P/E Ratio: ${stock.trailingPE?.toFixed(2)}
52-Week Range: $${stock.fiftyTwoWeekLow} - $${stock.fiftyTwoWeekHigh}
EPS: $${stock.epsTrailingTwelveMonths}
Dividend Yield: ${stock.dividendYield?.toFixed(2)}%
Price Change Today: ${stock.regularMarketChangePercent?.toFixed(2)}%
`;

    // Call Groq AI for pros/cons analysis
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional stock analyst providing balanced investment analysis. Always structure your response with clear PROS and CONS sections."
        },
        {
          role: "user",
          content: `Analyze this stock and provide a detailed pros and cons list for potential investors. Be specific and use the provided metrics.

${stockContext}

Format your response as:
PROS:
- [Pro 1]
- [Pro 2]
- [Pro 3]
...

CONS:
- [Con 1]
- [Con 2]
- [Con 3]
...

Keep it concise but insightful (5-7 points each).`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0]?.message?.content || "Analysis unavailable";

    return NextResponse.json({
      stock: stockData,
      analysis: analysis,
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}