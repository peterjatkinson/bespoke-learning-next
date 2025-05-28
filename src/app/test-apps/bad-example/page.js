'use client';
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const WaterfallApp = () => {
  const [investedCapital, setInvestedCapital] = useState(100);
  const [realisation, setRealisation] = useState(200);
  const [preferredReturnRate, setPreferredReturnRate] = useState(8);
  const [carrySplit, setCarrySplit] = useState({ lp: 80, gp: 20 });
  const [showExplanation, setShowExplanation] = useState(false);

  const calculateWaterfall = () => {
    const preferredReturn = investedCapital * (preferredReturnRate / 100);
    const totalWithPreferred = investedCapital + preferredReturn;
    const catchUp = (carrySplit.gp / carrySplit.lp) * preferredReturn;
    const totalAfterCatchUp = totalWithPreferred + catchUp;
    const remaining = realisation - totalAfterCatchUp;
    const lpCarry = remaining * (carrySplit.lp / 100);
    const gpCarry = remaining * (carrySplit.gp / 100);

    return [
      {
        stage: '1. Invested capital',
        lp: investedCapital,
        gp: 0
      },
      {
        stage: `2. Preferred return (${preferredReturnRate}%)`,
        lp: preferredReturn,
        gp: 0
      },
      {
        stage: '3. Catch-up',
        lp: 0,
        gp: catchUp
      },
      {
        stage: `4. 80/20 carry split`,
        lp: lpCarry,
        gp: gpCarry
      }
    ];
  };

  const data = calculateWaterfall();
  const totalLP = data.reduce((sum, row) => sum + row.lp, 0);
  const totalGP = data.reduce((sum, row) => sum + row.gp, 0);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 font-sans">
      <div className="mx-auto" style={{ width: '1100px' }}>
        <h2 className="text-4xl font-extrabold text-center mb-8 tracking-wide drop-shadow-md">
          Private Equity Waterfall Explorer
        </h2>

        {/* MOVED "Show explanation" link HERE */}
        <div
          className="text-sky-400 underline cursor-pointer text-sm text-center mb-4" // Adjusted classes for new location
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? 'Hide explanation' : 'Show explanation'}
        </div>

        {/* MOVED Explanation content HERE */}
        {showExplanation && (
          <div className="mt-4 mb-8 text-sm text-slate-200 bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700"> {/* Adjusted classes for new location */}
            <h4 className="text-lg font-bold mb-3 text-sky-300">Explanation</h4>
            <p className="mb-2">
              The <strong>preferred return</strong> ensures that LPs receive a minimum baseline return before GP profits are realised. This example assumes a standard <strong>catch-up</strong> phase.
            </p>
            <p>
              Users can modify capital, return rates, and profit splits to explore different private equity waterfall outcomes.
            </p>
          </div>
        )}

        {/* Hardcoded layout breaks mobile */}
        <div className="flex gap-6" style={{ width: '100%' }}>
          <div
            className="bg-slate-800 bg-opacity-70 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl"
            style={{ width: '50%' }}
          >
            <div className="grid gap-6">
              {/* No proper label, no responsiveness */}
              <div className="flex flex-col">
                <span className="mb-1 font-semibold text-sky-300">Invested Capital</span>
                <input
                  type="number"
                  className="border border-sky-600 bg-slate-900 text-white p-2 rounded"
                  value={investedCapital}
                  onChange={(e) => setInvestedCapital(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-semibold text-sky-300">Realisation</span>
                <input
                  type="number"
                  className="border border-sky-600 bg-slate-900 text-white p-2 rounded"
                  value={realisation}
                  onChange={(e) => setRealisation(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-semibold text-sky-300">Preferred Return Rate (%)</span>
                <input
                  type="number"
                  className="border border-sky-600 bg-slate-900 text-white p-2 rounded"
                  value={preferredReturnRate}
                  onChange={(e) => setPreferredReturnRate(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col">
                <span className="mb-1 font-semibold text-sky-300">Carried Interest Split (LP %)</span>
                <input
                  type="number"
                  className="border border-sky-600 bg-slate-900 text-white p-2 rounded"
                  value={carrySplit.lp}
                  onChange={(e) =>
                    setCarrySplit({ ...carrySplit, lp: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="text-sm text-sky-200 mt-4">
              GP % will automatically be {100 - carrySplit.lp}%
            </div>
          </div>

          {/* Table squishes on small screens */}
          <div
            className="overflow-auto bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl"
            style={{ width: '50%' }}
          >
            <table className="min-w-full text-sm text-white">
              <thead className="bg-slate-700 text-sky-200">
                <tr>
                  <th className="p-3 text-left">Waterfall stage</th>
                  <th className="p-3 text-right">LP</th>
                  <th className="p-3 text-right">GP</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-600 hover:bg-slate-700">
                    <td className="p-3 font-medium text-sky-100">{row.stage}</td>
                    <td className="p-3 text-right">{row.lp.toFixed(2)}</td>
                    <td className="p-3 text-right">{row.gp.toFixed(2)}</td>
                    <td className="p-3 text-right">{(row.lp + row.gp).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-400 font-bold border-t border-slate-500">
                  <td className="p-3">Total distribution</td>
                  <td className="p-3 text-right">{totalLP.toFixed(2)}</td>
                  <td className="p-3 text-right">{totalGP.toFixed(2)}</td>
                  <td className="p-3 text-right">{(totalLP + totalGP).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart squishes on mobile */}
        <div className="mt-12 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl" style={{ width: '100%' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }} />
              <Legend wrapperStyle={{ color: '#f8fafc' }} />
              <Bar dataKey="lp" stackId="a" fill="#38bdf8" name="LP" />
              <Bar dataKey="gp" stackId="a" fill="#f472b6" name="GP" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Original position of link and explanation content (now moved) */}
        {/*
        <div
          className="mt-10 text-sky-400 underline cursor-pointer text-sm"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? 'Hide explanation' : 'Show explanation'}
        </div>

        {showExplanation && (
          <div className="mt-4 text-sm text-slate-200 bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
            <h4 className="text-lg font-bold mb-3 text-sky-300">Explanation</h4>
            <p className="mb-2">
              The <strong>preferred return</strong> ensures that LPs receive a minimum baseline return before GP profits are realised. This example assumes a standard <strong>catch-up</strong> phase.
            </p>
            <p>
              Users can modify capital, return rates, and profit splits to explore different private equity waterfall outcomes.
            </p>
          </div>
        )}
        */}
      </div>
    </div>
  );
};

export default WaterfallApp;