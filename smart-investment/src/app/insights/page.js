"use client";
import { useEffect, useState } from "react";

export default function Insights() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const symbol = "AAPL"; // or get dynamically from input

  useEffect(() => {
    async function fetchStock() {
      try {
        const res = await fetch(`/api/stocks/${symbol}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, [symbol]);

  if (loading) return <p>Loading stock data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>{stockData.longName} ({stockData.symbol})</h2>
      <p>Current Price: ${stockData.regularMarketPrice}</p>
      <p>Change: {stockData.regularMarketChangePercent.toFixed(2)}%</p>
      <p>Market Cap: ${ (stockData.marketCap / 1e9).toFixed(2) }B</p>
      <p>52 Week Range: ${stockData.fiftyTwoWeekLow} - ${stockData.fiftyTwoWeekHigh}</p>
      {/* Add more fields as you like */}
    </div>
  );
}
