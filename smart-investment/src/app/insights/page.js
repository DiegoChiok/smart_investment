"use client";

import { useState } from "react";

export default function InsightsPage() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!symbol) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/insights/${symbol.toUpperCase()}`);
      if (!res.ok) throw new Error("Failed to fetch insights");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Stock Insights</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-red-500 text-white px-4 rounded hover:bg-red-600"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold">
            {data.stock.longName} ({data.stock.symbol})
          </h2>
          <p>Current Price: ${data.stock.regularMarketPrice}</p>
          <p>Change: {data.stock.regularMarketChangePercent.toFixed(2)}%</p>
          <p>Market Cap: ${(data.stock.marketCap / 1e9).toFixed(2)}B</p>
          <p>52 Week Range: ${data.stock.fiftyTwoWeekLow} - ${data.stock.fiftyTwoWeekHigh}</p>

          <h3 className="mt-4 text-xl font-semibold">AI Analysis:</h3>
          <p>{data.insights}</p>
        </div>
      )}
    </div>
  );
}
