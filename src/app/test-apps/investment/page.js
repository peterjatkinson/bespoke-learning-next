'use client';

import { useState, useEffect } from 'react';

export default function QuantDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState('');

  const runScreen = async () => {
    setLoading(true);
    try {
      const res = await fetch('/test-apps/investment/api', { cache: 'no-store' });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        setUpdated(new Date(json.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runScreen(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              🇬🇧 UK Momentum <span className="text-indigo-600">Alpha</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Live Quant Screen • Weighted Score (60% 1M / 40% 3M) • Top 15 Output
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400">UPDATED: {updated}</span>
            <button
              onClick={runScreen}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin text-xl">⟳</span> Scanning...</>
              ) : (
                <>⚡ Rescan Market</>
              )}
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Ticker</th>
                  <th className="px-6 py-4">Signal</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">1M %</th>
                  <th className="px-6 py-4 text-right">3M %</th>
                  <th className="px-6 py-4 text-right bg-indigo-50/40 text-indigo-900">Score</th>
                  <th className="px-6 py-4 w-full">Catalyst / News</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Skeletons
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-200 rounded-full"></div></td>
                      <td colSpan={5}></td>
                    </tr>
                  ))
                ) : (
                  data.map((stock, idx) => (
                    <tr key={stock.ticker} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{idx + 1}</td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">{stock.ticker}</span>
                          {stock.isTrending && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              HOT
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[140px]">{stock.company}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${stock.signal.color}`}>
                          {stock.signal.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-slate-700">
                        {stock.price.toFixed(2)}<span className="text-slate-400 text-xs ml-0.5">{stock.currency}</span>
                      </td>

                      <td className={`px-6 py-4 text-right font-mono font-medium ${stock.m1 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stock.m1 > 0 ? '+' : ''}{stock.m1.toFixed(1)}%
                      </td>

                      <td className={`px-6 py-4 text-right font-mono font-medium ${stock.m3 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stock.m3 > 0 ? '+' : ''}{stock.m3.toFixed(1)}%
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-bold text-indigo-700 bg-indigo-50/40">
                        {stock.score.toFixed(1)}
                      </td>

                      <td className="px-6 py-4">
                        <a 
                          href={stock.newsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block group-hover:underline decoration-indigo-300 underline-offset-2"
                        >
                          <div className="text-sm text-slate-700 line-clamp-1">{stock.news}</div>
                          <div className="text-[10px] text-slate-400 uppercase mt-0.5 font-semibold tracking-wide">
                            {stock.newsSource}
                          </div>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}