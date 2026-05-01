import React from "react";

const SECTIONS = [
  {
    id: "operations",
    label: "Cash flow from operations",
    rows: [
      { item: "Sales receipts", amount: "17,580" },
      { item: "Payments to suppliers", amount: "(26,000)" },
      { item: "Interest paid (net)", amount: "(800)" },
      { item: "Other cash operating expenses", amount: "(5,200)" },
      { item: "CASH FLOW FROM OPERATION", amount: "(14,500)", isSummary: true },
    ],
    explanation: {
      heading: "Cash flow from operations",
      text: "This is calculated by adding the four items above, noting that all items in brackets are negative.\n17,580–26,000–800–5,200=–14,500\nTherefore the cash flow from operations = £–14,500\nNote that this final value is negative and therefore displayed in brackets.",
    },
  },
  {
    id: "investments",
    label: "Cash flow from investments",
    rows: [
      { item: "Fixed assets purchased", amount: "(44,000)" },
      { item: "Fixed assets sold", amount: "10,000" },
      { item: "CASH FLOW FROM INVESTMENTS", amount: "(34,000)", isSummary: true },
    ],
    explanation: {
      heading: "Cash flow from investment",
      text: "This is calculated by adding the two items above, noting that all items in brackets are negative.\n–44,000+10,000=–34,000\nTherefore cash flow from investments = £–34,000\nNote that this final value is negative and therefore displayed in brackets.",
    },
  },
  {
    id: "financing",
    label: "Cash flow from financing",
    rows: [
      { item: "Dividends", amount: "(0)" },
      { item: "New equity capital introduced", amount: "34,000" },
      { item: "New Loan capital raised", amount: "31,000" },
      { item: "Loans repaid", amount: "(13,000)" },
      { item: "CASH FLOW FROM FINANCING", amount: "52,000", isSummary: true },
    ],
    explanation: {
      heading: "Cash flow from financing",
      text: "This is calculated by factoring in all these items, including dividends.\n0+34,000+31,000–13,000=52,000\nTherefore cash flow from financing = £52,000\nNote that this final value is positive and therefore is not displayed in brackets.",
    },
  },
  {
    id: "change-in-cash",
    label: "Change in cash",
    rows: [
      { item: "Change in cash", amount: "3,500", isSummary: true },
    ],
    explanation: {
      heading: "Change in cash",
      text: "Finally we add the three cash flows together to give us the final figure.\n–14,500–34,000+52,000=3,500\nTherefore the change in cash = £3,500\nNote that this final value is positive and therefore is not displayed in brackets.\nHence, we realize that the company's cash balance registered an increase of GBP 3,500.",
    },
  },
];

function StatementSection({ section }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-5 items-start">
      {/* Statement card */}
      <section aria-labelledby={`heading-${section.id}`} className="w-full md:w-[55%] md:flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden">
        <h3
          id={`heading-${section.id}`}
          className="m-0 px-4 py-3 sm:px-5 bg-slate-200 border-b border-slate-300 font-semibold text-slate-800 text-sm"
        >
          {section.label}
        </h3>

        <table className="w-full">
          <caption className="sr-only">
            {section.label} — amounts in £
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

export default function CashFlowStatement() {
  return (
    <main className="min-h-full bg-gray-50 py-6 sm:py-10 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="bg-slate-700 text-white px-4 py-3 sm:px-5 sm:py-4 rounded-t-lg text-sm sm:text-base font-semibold">
          Sample Company cash-flow statement, three months ending 31 March 2026
        </h2>

        <p className="text-gray-600 mt-3 mb-4 sm:mb-6 text-sm sm:text-base">
          Each section of the cash-flow statement is shown with an explanation.
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
