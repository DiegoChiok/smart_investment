import { NextResponse } from "next/server";
import OpenAI from "openai";


export async function GET(_req, { params }) {
  const { symbol } = await params;

  try {
    // Fetch stock data
    const stockRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stocks/${symbol}`);
    if (!stockRes.ok) throw new Error("Stock not found");
    const stockData = await stockRes.json();

    // Return without AI insights for now
    return NextResponse.json({
      stock: stockData,
      insights: "AI insights temporarily disabled. The stock grading system above provides a comprehensive analysis based on key financial metrics."
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/*
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // your key from .env.local
});

export const dynamic = "force-dynamic"; // prevent caching during dev

export async function GET(_req, { params }) {
  const { symbol } = await params;

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
*/