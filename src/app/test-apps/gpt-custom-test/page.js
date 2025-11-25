'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// This app demonstrates the principles of a balance sheet for accounting students.
// It divides data into Assets, Liabilities and Equity and shows that the equation balances.
// Now includes a pie chart and a more vibrant, pop art-inspired style.

const COLOURS = {
  Asset: '#00BFFF', // Sky blue
  Liability: '#FF4500', // Orange red
  Equity: '#32CD32' // Lime green
};

const BalanceSheetApp = () => {
  const [entries, setEntries] = useState([
    { id: 1, type: 'Asset', label: 'Cash', amount: 5000 },
    { id: 2, type: 'Asset', label: 'Equipment', amount: 12000 },
    { id: 3, type: 'Liability', label: 'Loan', amount: 7000 },
    { id: 4, type: 'Equity', label: 'Owner investment', amount: 10000 }
  ]);

  const addEntry = (type) => {
    const newEntry = {
      id: Date.now(),
      type,
      label: '',
      amount: 0
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id, field, value) => {
    setEntries(
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: field === 'amount' ? Number(value) : value } : entry
      )
    );
  };

  const totalAssets = entries.filter(e => e.type === 'Asset').reduce((sum, e) => sum + e.amount, 0);
  const totalLiabilities = entries.filter(e => e.type === 'Liability').reduce((sum, e) => sum + e.amount, 0);
  const totalEquity = entries.filter(e => e.type === 'Equity').reduce((sum, e) => sum + e.amount, 0);
  const isBalanced = totalAssets === (totalLiabilities + totalEquity);

  const pieData = [
    { name: 'Assets', value: totalAssets, colour: COLOURS.Asset },
    { name: 'Liabilities', value: totalLiabilities, colour: COLOURS.Liability },
    { name: 'Equity', value: totalEquity, colour: COLOURS.Equity }
  ];

  return (
    <div className="min-h-full bg-yellow-50 text-gray-900 p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-black mb-4 text-center text-pink-600 tracking-wide">
        Balance sheet explorer
      </h1>
      <p className="text-center mb-8 text-md text-gray-700">
        Explore how <span className="font-bold">assets</span> balance against <span className="font-bold">liabilities</span> and <span className="font-bold">equity</span>. Add or edit values and watch the chart update in real time.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {['Asset', 'Liability', 'Equity'].map((type) => (
          <section key={type} aria-labelledby={`${type}-heading`} className="rounded-xl border-2 border-black p-4 bg-white shadow-[4px_4px_0_0_#000]">
            <h2 id={`${type}-heading`} className="text-xl font-bold mb-2 uppercase tracking-wide text-gray-800">
              {type === 'Asset' ? 'Assets' : type === 'Liability' ? 'Liabilities' : 'Equity'}
            </h2>
            {entries.filter(e => e.type === type).map(entry => (
              <div key={entry.id} className="mb-3">
                <input
                  id={`label-${entry.id}`}
                  type="text"
                  value={entry.label}
                  onChange={(e) => updateEntry(entry.id, 'label', e.target.value)}
                  className="w-full border-b-2 border-dotted border-gray-500 px-2 py-1 text-sm bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  placeholder="Item name"
                />
                <input
                  id={`amount-${entry.id}`}
                  type="number"
                  value={entry.amount}
                  onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                  className="w-full border px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  placeholder="Amount"
                  min="0"
                />
              </div>
            ))}
            <button
              onClick={() => addEntry(type)}
              className="mt-2 text-sm bg-pink-600 text-white px-3 py-1 rounded-full hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              + Add {type.toLowerCase()}
            </button>
          </section>
        ))}
      </div>

      {/* Chart and summary */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-white p-6 rounded-xl shadow-[4px_4px_0_0_#000] border-2 border-black">
          <h3 className="text-lg font-semibold text-center mb-4">Visual breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.colour} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[4px_4px_0_0_#000] border-2 border-black text-center">
          <p className="text-lg font-semibold">Balance check:</p>
          <p className="text-sm mt-2">
            Assets: <span className="font-bold">£{totalAssets.toLocaleString()}</span> =
            Liabilities (<span className="font-bold">£{totalLiabilities.toLocaleString()}</span>) +
            Equity (<span className="font-bold">£{totalEquity.toLocaleString()}</span>)
          </p>
          <p
            className={`mt-3 font-medium text-sm ${
              isBalanced ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {isBalanced ? 'The balance sheet is balanced.' : 'The balance sheet is not balanced.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetApp;
