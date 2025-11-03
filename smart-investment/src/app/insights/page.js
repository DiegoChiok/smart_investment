"use client";

import { useState } from "react";

export default function InsightsPage() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //Grading algorithm//////////////////////////////////
  const calculateStockScore = (stockData) => {
    //Extract data from Yahoo under quote
    const stock = stockData.quote// || stockData;
    const history = stockData.history || []; //historical price data   
    //initialize score components
    let score = 0;
    const scores = {
      valuation: 0, //20 points
      growth: 0, //25 points
      health: 0, //20 points
      profitability: 0, //20 points
      momentum: 0 //15 points
    };

    //VALUATION: (20 points) compare price to value metrics (are we paying too much?)
    //Using Price to Earnings ratios if available (based on current earnings)
    if (stock.trailingPE) {
      const pe = stock.trailingPE;
      //Lower P/E ratios are better
      if (pe > 0 && pe < 15) scores.valuation += 10;
      else if (pe >= 15 && pe < 25) scores.valuation += 8;
      else if (pe >= 25 && pe < 35) scores.valuation += 5;
      else if (pe >= 35 && pe < 50) scores.valuation += 3;
      else if (pe >= 50) scores.valuation += 1;
    }
    //using Future Price to Earnings if availablem (based on analyst estimates of next year earnings)
    if (stock.forwardPE) {
      const fpe = stock.forwardPE;
      //Lower Forward P/E ratios are better
      if (fpe > 0 && fpe < 15) scores.valuation += 10;
      else if (fpe >= 15 && fpe < 25) scores.valuation += 7;
      else if (fpe >= 25 && fpe < 35) scores.valuation += 4;
      else if (fpe >= 35) scores.valuation += 2;
    }

    //GROWTH: (25 points) want to check revenue/earnings growth, stock price growth (is it trending up? both in long and short term?)
    if (history.length >= 30) {
      //calculate price change over last 30 days
      const thirtyDaysAgo = history[history.length - 30].close;
      const currentPrice = stock.regularMarketPrice;
      const priceChange = ((currentPrice - thirtyDaysAgo) / thirtyDaysAgo) * 100;
      //if the price change increased more its better since higher prices indicate growth
      if (priceChange > 15) scores.growth += 13;
      else if (priceChange > 10) scores.growth += 10;
      else if (priceChange > 5) scores.growth += 7;
      else if (priceChange > 0) scores.growth += 4;
      else if (priceChange > -5) scores.growth += 2;
    }

    //check earnings per share growth if available
    if (stock.epsCurrentYear && stock.epsTrailingTwelveMonths) {
      //calculate EPS growth percentage of this year vs last year
      const epsGrowth = ((stock.epsCurrentYear - stock.epsTrailingTwelveMonths) / Math.abs(stock.epsTrailingTwelveMonths)) * 100;
      if (epsGrowth > 20) scores.growth += 12;
      else if (epsGrowth > 10) scores.growth += 8;
      else if (epsGrowth > 5) scores.growth += 5;
      else if (epsGrowth > 0) scores.growth += 2;
    }

    //FINANCIAL HEALTH: (20 points) checks book price with market price, also checks market cap overhead (is it financially stable?)
    //check if book value and market price are available
    if (stock.bookValue && stock.regularMarketPrice) {
      //we want book price to be lower than market price (so we are not overpaying)
      //book price ishow much the company is worth on paper
      //makret price is how much investors are willing to pay
      const priceToBook = stock.regularMarketPrice / stock.bookValue;
      if (priceToBook < 1.5) scores.health += 10;
      else if (priceToBook < 3) scores.health += 7;
      else if (priceToBook < 5) scores.health += 4;
      else scores.health += 2;
    }

    //check if market cap is available
    if (stock.marketCap) {
      //we want larger market cap companies (investor stability/confidence, less risk, financially stable)
      const capInB = stock.marketCap / 1e9;
      if (capInB > 200) scores.health += 10;
      else if (capInB > 10) scores.health += 7;
      else if (capInB > 2) scores.health += 4;
      else scores.health += 2;
    }

    //PROFITABILITY: (20 points) Conversion of revenue to profit, dividend yield, EPS
    //EPS = Earnings per share
    //Dvidend yield = returned cash to stakeholders / price per share
    if (stock.epsTrailingTwelveMonths) {
      //check for higher EPS values for better profitability
      const eps = stock.epsTrailingTwelveMonths;
      if (eps > 5) scores.profitability += 10;
      else if (eps > 3) scores.profitability += 7;
      else if (eps > 1) scores.profitability += 4;
      else if (eps > 0) scores.profitability += 2;
    }
    //checks for if the stock pays dividends and if so how much yield
    if (stock.dividendRate && stock.dividendRate > 0) {
      scores.profitability += 5;
      //more yield is better
      if (stock.dividendYield > 2) scores.profitability += 5;
      else if (stock.dividendYield > 1) scores.profitability += 3;
    }

    //MOMENTUM: (15 points) checks for recent trend and price movement (is the stock trending up?)
    //check 52 week high vs current price (is it near it peaking?)
    if (stock.fiftyTwoWeekHigh && stock.regularMarketPrice) {
      //calculate how close current price is to 52 week high in percentage
      const priceVsHigh = (stock.regularMarketPrice / stock.fiftyTwoWeekHigh) * 100;
      //The closer to the high the better
      if (priceVsHigh > 95) scores.momentum += 8;
      else if (priceVsHigh > 85) scores.momentum += 6;
      else if (priceVsHigh > 70) scores.momentum += 4;
      else if (priceVsHigh > 50) scores.momentum += 2;
    }
    //check recent daily price change percentage
    //regularMarketChangePercent is the percentage change of the stock price today from previous amount
    if (stock.regularMarketChangePercent !== undefined) {
      const change = stock.regularMarketChangePercent;
      //The higher the daily change the better since it shows upward momentum (more purchasing interest = upward trend)
      if (change > 3) scores.momentum += 7;
      else if (change > 1) scores.momentum += 5;
      else if (change > 0) scores.momentum += 3;
      else if (change > -2) scores.momentum += 1;
    }

    //calculate total score
    score = scores.valuation + scores.growth + scores.health + 
            scores.profitability + scores.momentum;

    //ensure score does not exceed 100 (possible with overlapping metrics but unlikely)
    return { score: Math.min(100, Math.round(score)), breakdown: scores };
  };

  //end of grading algorithm//////////////////////////////////

  //helper functions for score display
  const getScoreColor = (score) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 80) return "bg-green-100";
    if (score >= 70) return "bg-green-500";
    if (score >= 60) return "bg-green-900";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 40) return "bg-yellow-900";
    if (score >= 30) return "bg-red-100";
    if (score >= 20) return "bg-red-500";
    return "bg-red-900";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Elite Caliber: Strong Buy With Enthusiasm";
    if (score >= 60) return "Solid Choice: Buy with Confidence";
    if (score >= 40) return "Average: Don't Rush, Do More Research";
    if (score >= 20) return "Not Recommended: Caution Advised";
    return "Very Poor Choice: Definitely Avoid";
  };
  //handle search button click
  const handleSearch = async () => {
    //validate input
    if (!symbol) return;
    //fetch data from API
    setLoading(true);
    setError("");
    setData(null);
    //call our insights API
    try {
      const res = await fetch(`/api/insights/${symbol.toUpperCase()}`);
      //check for errors
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Stock Insights</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
          {/* Debug: Show raw data */}
          <details className="mb-4 bg-gray-100 p-4 rounded">
            <summary className="cursor-pointer font-semibold">Debug: View Raw Stock Data</summary>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(data.stock, null, 2)}</pre>
          </details>

          {/* Stock Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              {data.stock.longName} ({data.stock.symbol})
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current Price</p>
                <p className="text-xl font-bold">${data.stock.regularMarketPrice?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Change</p>
                <p className={`text-xl font-bold ${data.stock.regularMarketChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.stock.regularMarketChangePercent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Stock Score Card */}
          {(() => {
            const { score, breakdown } = calculateStockScore(data.stock);
            return (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Stock Grade</h3>
                
                {/* Main Score Display */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-3xl font-bold">{score}/100</span>
                    <span className={`text-lg font-semibold ${
                      score >= 80 ? 'text-green-600' : 
                      score >= 60 ? 'text-blue-600' : 
                      score >= 40 ? 'text-yellow-600' : 
                      score >= 20 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {getScoreLabel(score)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(score)} transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                      style={{ width: `${score}%` }}
                    >
                      <span className="text-white font-semibold text-sm">{score}%</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Valuation</p>
                    <p className="font-semibold">{breakdown.valuation}/20</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Growth</p>
                    <p className="font-semibold">{breakdown.growth}/25</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Health</p>
                    <p className="font-semibold">{breakdown.health}/20</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Profitability</p>
                    <p className="font-semibold">{breakdown.profitability}/20</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Momentum</p>
                    <p className="font-semibold">{breakdown.momentum}/15</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Market Cap</p>
                <p className="font-semibold">${(data.stock.marketCap / 1e9).toFixed(2)}B</p>
              </div>
              <div>
                <p className="text-gray-600">P/E Ratio</p>
                <p className="font-semibold">{data.stock.trailingPE?.toFixed(2) || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600">52 Week Range</p>
                <p className="font-semibold">${data.stock.fiftyTwoWeekLow} - ${data.stock.fiftyTwoWeekHigh}</p>
              </div>
              <div>
                <p className="text-gray-600">Profit Margin</p>
                <p className="font-semibold">{data.stock.profitMargins ? (data.stock.profitMargins * 100).toFixed(2) + '%' : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {data.insights && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-700 leading-relaxed">{data.insights}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}