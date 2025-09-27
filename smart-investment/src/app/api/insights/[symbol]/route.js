import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // your key from .env.local
});

export const dynamic = "force-dynamic"; // prevent caching during dev

export async function GET(_req, { params }) {
  const { symbol } = params;

  try {
    // Fetch stock data from your own stocks endpoint
    const stockRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stocks/${symbol}`);
    if (!stockRes.ok) throw new Error("Failed to fetch stock data");
    const stockData = await stockRes.json();

    // Send stock data to GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4.1-mini
      messages: [
        {
          role: "system",
          content: "You are a financial assistant. Analyze the stock and provide pros, cons, and an overall grade.",
        },
        {
          role: "user",
          content: `Here is stock data for ${symbol}: ${JSON.stringify(stockData)}.
            Please provide:
            1. Pros
            2. Cons
            3. Overall grade (A-F) based on performance and trends.`,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({ stock: stockData, insights: aiResponse });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
