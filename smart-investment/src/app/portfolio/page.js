"use client";
import { useEffect, useMemo, useState } from "react";

export default function Insights() {
  const [symbol, setSymbol] = useState("AAPL");
  const [input, setInput] = useState("AAPL");
  const [data, setData] = useState(null); // { quote, history }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchStock(sym) {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/stocks/${sym.toUpperCase()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStock(symbol);
  }, [symbol]);

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setSymbol(input.trim().toUpperCase());
  }

  // ---------- Simple trend analysis (client-side) ----------
  const analysis = useMemo(() => {
    if (!data?.quote || !data?.history?.length) return null;

    const { quote, history } = data;
    const closes = history.map(h => h.close);
    const last = closes[closes.length - 1];

    const pctChange = (a, b) => ((a - b) / b) * 100;

    // 30-day momentum (need at least 31 closes)
    const change30 =
      closes.length > 30 ? pctChange(last, closes[closes.length - 31]) : null;

    // Moving averages
    const ma = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const ma20 = closes.length >= 20 ? ma(closes.slice(-20)) : null;
    const ma50 = closes.length >= 50 ? ma(closes.slice(-50)) : null;

    // Simple scoring
    let score = 0;
    const pros = [];
    const cons = [];

    if (change30 != null) {
      if (change30 > 10) { score += 3; pros.push(`Strong 30-day momentum (+${change30.toFixed(1)}%)`); }
      else if (change30 > 3) { score += 2; pros.push(`Positive 30-day momentum (+${change30.toFixed(1)}%)`); }
      else if (change30 > 0) { score += 1; pros.push(`Slight positive 30-day momentum (+${change30.toFixed(1)}%)`); }
      else { cons.push(`Negative 30-day momentum (${change30.toFixed(1)}%)`); }
    }

    if (ma20 != null) {
      if (last > ma20) { score += 1; pros.push("Price above 20-day MA"); }
      else { cons.push("Price below 20-day MA"); }
    }

    if (ma50 != null) {
      if (last > ma50) { score += 2; pros.push("Price above 50-day MA"); }
      else { cons.push("Price below 50-day MA"); }
    }

    // Position in 52-week range
    const { fiftyTwoWeekLow, fiftyTwoWeekHigh } = quote;
    if (fiftyTwoWeekLow != null && fiftyTwoWeekHigh != null) {
      const rangePos = (last - fiftyTwoWeekLow) / (fiftyTwoWeekHigh - fiftyTwoWeekLow); // 0..1
      if (rangePos > 0.8) { score += 1; pros.push("Trading near 52-week high"); }
      else if (rangePos < 0.2) { cons.push("Trading near 52-week low"); }
    }

    // Map score to grade
    // (rough heuristic; tweak to taste)
    let grade = "C";
    if (score >= 6) grade = "A";
    else if (score >= 4) grade = "B";
    else if (score >= 2) grade = "C";
    else grade = "D";

    return {
      grade,
      pros,
      cons,
      metrics: {
        last,
        change30,
        ma20,
        ma50,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        regularMarketPrice: quote.regularMarketPrice,
        regularMarketChangePercent: quote.regularMarketChangePercent,
      },
    };
  }, [data]);

  // ---------- UI ----------
  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <form onSubmit={onSubmit} className="flex gap-3 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter ticker (e.g., AAPL)"
          className="flex-1 px-3 py-2 rounded-md text-black"
        />
        <button className="px-4 py-2 bg-red-500 rounded-md">Analyze</button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-300">Error: {error}</p>}

      {data?.quote && (
        <div className="bg-black/40 rounded-lg p-5 space-y-2">
          <h2 className="text-2xl font-semibold">
            {data.quote.longName} ({data.quote.symbol})
          </h2>
          <p>
            Current Price: ${data.quote.regularMarketPrice?.toFixed(2)} · Change:{" "}
            {data.quote.regularMarketChangePercent?.toFixed(2)}%
          </p>
          <p>
            52W: ${data.quote.fiftyTwoWeekLow} – ${data.quote.fiftyTwoWeekHigh}
          </p>
        </div>
      )}

      {analysis && (
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-lg p-5">
            <h3 className="text-xl font-semibold mb-2">Overall Grade</h3>
            <div className="text-4xl font-bold">{analysis.grade}</div>
          </div>

          <div className="bg-black/40 rounded-lg p-5">
            <h3 className="text-xl font-semibold mb-2">Pros</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.pros.length ? analysis.pros.map((p, i) => <li key={i}>{p}</li>) : <li>No major positives</li>}
            </ul>
          </div>

          <div className="bg-black/40 rounded-lg p-5">
            <h3 className="text-xl font-semibold mb-2">Cons</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.cons.length ? analysis.cons.map((c, i) => <li key={i}>{c}</li>) : <li>No major negatives</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
