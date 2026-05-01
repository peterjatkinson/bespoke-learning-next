import React from "react";

const SECTIONS = [
  {
    id: "revenue",
    label: "Revenue and gross profit",
    rows: [
      { item: "Turnover (or sales revenue)", amount: "75,480" },
      { item: "Cost of sales (or cost of goods sold)", amount: "(52,230)" },
      { item: "Gross profit", amount: "23,250", isSummary: true },
    ],
    explanation: {
      heading: "Gross profit",
      text: "Gross profit is calculated by:\nTurnover − Cost of sales\nIn this particular instance:\n75,480,000 − 52,230,000 = 23,250,000\nTherefore:\nGross profit = £23,250,000.",
    },
  },
  {
    id: "operating-expenses",
    label: "Other operating expenses",
    rows: [
      { item: "Research & development expense", amount: "(2,160)" },
      { item: "Distribution costs", amount: "(2,080)" },
      { item: "Selling, general and administrative expenses", amount: "(13,290)" },
    ],
    explanation: {
      heading: "Operating expenses",
      text: "These operating expenses are listed together and can be added together to give a total (not shown).\nTotal expenses shown here are:\n2,160,000 + 2,080,000 + 13,290,000 = 17,530,000\nTherefore:\nOperating expenses = £17,530,000.",
    },
  },
  {
    id: "operating-profit",
    label: "Operating profit",
    rows: [
      { item: "Operating profit", amount: "5,720", isSummary: true },
    ],
    explanation: {
      heading: "Operating profit",
      text: "Operating profit is calculated by:\nGross profit − Operating expenses\nIn this particular instance:\n23,250,000 − 17,530,000 = 5,720,000\nTherefore:\nOperating profit = £5,720,000.",
    },
  },
  {
    id: "net-interest",
    label: "Net interest",
    rows: [
      { item: "Interest received", amount: "40" },
      { item: "Interest expense", amount: "(360)" },
      { item: "Profit before tax", amount: "5,400", isSummary: true },
    ],
    explanation: {
      heading: "Interest",
      text: "Here we now factor in interest.\nProfit before tax is calculated by:\nOperating profit + net interest\nIn this particular instance:\n5,720,000 + (40,000 − 360,000) = 5,400,000\nTherefore:\nProfit before tax = £5,400,000.",
    },
  },
  {
    id: "taxation",
    label: "Taxation and profit",
    rows: [
      { item: "Taxation", amount: "(1,700)" },
      { item: "Profit for the financial year", amount: "3,700", isSummary: true },
    ],
    explanation: {
      heading: "Profit",
      text: "We calculate profit for the financial year by:\nProfit before tax − Taxation\nIn this particular instance:\n5,400,000 − 1,700,000 = 3,700,000\nTherefore:\nProfit for the financial year = £3,700,000.",
    },
  },
  {
    id: "dividends",
    label: "Dividends and retained profit",
    rows: [
      { item: "Dividends", amount: "(1,890)" },
      { item: "Profit retained for year", amount: "1,810", isSummary: true },
    ],
    explanation: {
      heading: "Dividends & retained profit",
      text: "Dividends are payments made to shareholders.\nThese are deducted from profit for the financial year.\nIn this particular instance:\n3,700,000 − 1,890,000 = 1,810,000\nTherefore:\nProfit retained for year = £1,810,000.",
    },
  },
];

function StatementSection({ section }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-start">
      {/* Statement card */}
      <section aria-labelledby={`heading-${section.id}`} className="w-full md:w-[65%] md:flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden">
        <h3
          id={`heading-${section.id}`}
          className="m-0 px-4 py-3 sm:px-5 bg-slate-200 border-b border-slate-300 font-semibold text-slate-800 text-sm"
        >
          {section.label}
        </h3>

        <table className="w-full">
          <caption className="sr-only">
            {section.label} — amounts in £ thousands
          </caption>
          <thead>
            <tr className="bg-slate-100 border-b border-gray-100">
              <th scope="col" className="px-4 py-2 sm:px-5 text-sm text-left font-bold text-gray-700">
                Item
              </th>
              <th scope="col" className="px-4 py-2 sm:px-5 text-sm text-right w-28 sm:w-32 font-bold text-gray-700">
                £
              </th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 last:border-b-0 bg-white"
              >
                <th
                  scope="row"
                  className={`px-4 py-3 sm:px-5 text-sm text-left ${
                    row.isSummary
                      ? "font-semibold text-gray-900"
                      : "font-normal text-gray-700"
                  }`}
                >
                  {row.item}
                </th>
                <td
                  className={`px-4 py-3 sm:px-5 text-sm text-right w-28 sm:w-32 ${
                    row.isSummary
                      ? "font-semibold text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Explanation */}
      <aside
        aria-labelledby={`heading-${section.id}`}
        className="w-full md:flex-1"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-2">
            {section.explanation.heading}
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {section.explanation.text}
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function IncomeStatement() {
  return (
    <main className="min-h-full bg-gray-50 py-6 sm:py-10 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="bg-slate-700 text-white px-4 py-3 sm:px-5 sm:py-4 rounded-t-lg text-sm sm:text-base font-semibold">
          Sample Company income statement for the year ending December 31, 2026
        </h2>

        <p className="text-gray-600 mt-3 mb-4 sm:mb-6 text-sm sm:text-base">
          Each section of the income statement is shown with an explanation.
        </p>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <StatementSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </main>
  );
}
