import { NextResponse } from 'next/server';
import YahooFinanceAPI from 'yahoo-finance2';

const yahooFinance = new YahooFinanceAPI();

// 1. CORE UNIVERSE: A liquid "Watchlist" of major UK movers to ensure stability.
// These are stocks that often show momentum characteristics (Defence, Retail, Tech, Banks).
const CORE_WATCHLIST = [
  'RR.L', 'BA.L', 'MRO.L', 'BARC.L', 'LLOY.L', 'BP.L', 'SHELL.L', 
  'TSCO.L', 'MKS.L', 'NXT.L', 'JD.L', 'AZN.L', 'GSK.L', 'HSBA.L', 
  'GLEN.L', 'RIO.L', 'AAL.L', 'NG.L', 'SSE.L', 'CNA.L', 
  'IAG.L', 'EZJ.L', 'WIZZ.L', 'TUI.L', 'PTEC.L', 'SSPG.L', 
  'SPX.L', 'WEIR.L', 'SMIN.L', 'VOD.L', 'BT-A.L'
];

// 2. HELPER: Calculate Percentage Change
const calcChange = (current, past) => {
  if (!past || past === 0) return 0;
  return ((current - past) / past) * 100;
};

// 3. HELPER: Signal Logic
const getSignal = (m1, m3) => {
  const is3MHigh = m3 > 5; // Context: Positive medium-term trend
  
  if (is3MHigh && m1 > 5) return { type: '🔥 BUY (Accel)', color: 'text-green-700 bg-green-100 border-green-200' };
  if (is3MHigh && m1 >= 0) return { type: '✅ BUY (Steady)', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  if (is3MHigh && m1 < 0 && m1 >= -5) return { type: '⚠️ CAUTION', color: 'text-amber-600 bg-amber-50 border-amber-100' };
  if (is3MHigh && m1 < -5) return { type: '❌ AVOID', color: 'text-rose-600 bg-rose-50 border-rose-100' };
  if (!is3MHigh && m1 > 10) return { type: '🚀 REBOUND', color: 'text-blue-600 bg-blue-50 border-blue-100' };

  return { type: '⚪ NEUTRAL', color: 'text-slate-500 bg-slate-50 border-slate-100' };
};

export async function GET() {
  try {
    // A. DISCOVERY PHASE: Get Trending Symbols + Watchlist
    // We try to fetch "Trending in GB" to find what's hot right now.
    let trendingSymbols = [];
    try {
      const trendingResult = await yahooFinance.trending('GB');
      if (trendingResult.quotes) {
        trendingSymbols = trendingResult.quotes
          .map((q) => q.symbol)
          .filter((s) => s.endsWith('.L')); // Ensure strictly UK listings
      }
    } catch (e) {
      console.warn("Trending API failed, falling back to core list only.", e.message);
    }

    // Combine and Dedupe
    const combinedTickers = Array.from(new Set([...CORE_WATCHLIST, ...trendingSymbols]));
    
    // B. ANALYTICAL PHASE: Parallel Execution
    const results = await Promise.all(
      combinedTickers.map(async (ticker) => {
        try {
          // Fetch Chart (6mo history) & Quote (Name/Price) in parallel for speed
          const [chartData, quoteData] = await Promise.all([
            yahooFinance.chart(ticker, {
              period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // ~6 months
              interval: '1d',
            }),
            yahooFinance.quoteSummary(ticker, { modules: ['price'] })
          ]);

          const data = chartData.quotes;
          if (!data || data.length < 60) return null; // Filter out low-history stocks

          // Latest Prices
          const currentPrice = data[data.length - 1].close;
          
          // Historical Reference Points
          // ~21 trading days = 1 month | ~63 trading days = 3 months
          const price1M = data[data.length - 22]?.close || data[0].close;
          const price3M = data[data.length - 64]?.close || data[0].close;

          // C. CALCULATIONS
          const m1Perf = calcChange(currentPrice, price1M);
          const m3Perf = calcChange(currentPrice, price3M);
          const score = (0.6 * m1Perf) + (0.4 * m3Perf);
          
          // Filter: Remove penny stocks (< 10p) or flat stocks to clean up noise
          if (currentPrice < 10) return null; 

          return {
            ticker: ticker.replace('.L', ''),
            company: quoteData.price?.longName || ticker,
            price: currentPrice,
            currency: quoteData.price?.currencySymbol || 'p',
            m1: m1Perf,
            m3: m3Perf,
            score: score,
            signal: getSignal(m1Perf, m3Perf),
            isTrending: trendingSymbols.includes(ticker) // Mark if it came from the "Trending" API
          };

        } catch (err) {
          console.error(`Failed to fetch data for ${ticker}:`, err.message);
          return null;
        }
      })
    );

    // D. RANKING & NEWS FETCH
    // 1. Filter nulls
    // 2. Sort by Momentum Score
    // 3. Take Top 15
    const rankedStocks = results
      .filter((r) => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // E. ENRICHMENT: Fetch News for the Winners only (saves API calls)
    const enrichedResults = await Promise.all(
      rankedStocks.map(async (stock) => {
        try {
            const newsData = await yahooFinance.search(stock.ticker + ".L", { newsCount: 1 });
            return {
                ...stock,
                news: newsData.news?.[0]?.title || "No immediate news driver found.",
                newsSource: newsData.news?.[0]?.publisher || "Market Data",
                newsLink: newsData.news?.[0]?.link || "#"
            };
        } catch {
            return { ...stock, news: "News unavailable", newsSource: "N/A", newsLink: "#" };
        }
      })
    );

    return NextResponse.json({ 
      data: enrichedResults, 
      marketStatus: 'Closed', // You can add logic to check time if needed
      timestamp: new Date().toISOString() 
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Quant Engine Failure' }, { status: 500 });
  }
}