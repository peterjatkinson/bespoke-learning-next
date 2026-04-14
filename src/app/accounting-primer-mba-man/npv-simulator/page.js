"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CASH_FLOWS = [
  { year: 1, cashInflow: 80000 },
  { year: 2, cashInflow: 120000 },
  { year: 3, cashInflow: 150000 },
  { year: 4, cashInflow: 150000 },
  { year: 5, cashInflow: 130000 },
];

const MIN_DISCOUNT_RATE = 5;
const MAX_DISCOUNT_RATE = 15;
const MIN_INITIAL_INVESTMENT = 420000;
const MAX_INITIAL_INVESTMENT = 620000;

function formatCurrency(value, digits = 0) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function formatAxisCurrency(value) {
  return `£${Math.round(value / 1000)}k`;
}

function roundDiscountFactor(rate, year) {
  const exactFactor = 1 / (1 + rate) ** year;
  return Number(exactFactor.toFixed(3));
}

function StatCard({ label, value, note, accent }) {
  const accentClasses = {
    amber: "bg-[linear-gradient(180deg,#f59e0b_0%,#f97316_100%)]",
    blue: "bg-[linear-gradient(180deg,#0f62fe_0%,#3b82f6_100%)]",
    teal: "bg-[linear-gradient(180deg,#0891b2_0%,#14b8a6_100%)]",
  };

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(252,253,255,0.98)_0%,rgba(246,249,253,0.92)_100%)] p-[18px]">
      <span aria-hidden="true" className={`absolute bottom-0 left-0 top-0 w-1 ${accentClasses[accent]}`} />
      <p className="m-0 text-[0.76rem] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-[10px] text-[2rem] leading-none font-bold tracking-[-0.03em] text-slate-900">{value}</p>
      <p className="mt-[10px] text-[0.95rem] leading-[1.55] text-slate-600">{note}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold text-slate-900">Year {label}</p>
      <p className="mt-2 text-sm text-slate-600">
        Cash inflow: <span className="font-semibold text-slate-900">{formatCurrency(entry.cashInflow)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Discount factor: <span className="font-semibold text-slate-900">{entry.discountFactor.toFixed(3)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Present value: <span className="font-semibold text-slate-900">{formatCurrency(entry.presentValue)}</span>
      </p>
    </div>
  );
}

export default function NpvSimulatorPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [discountRate, setDiscountRate] = useState(10);
  const [initialInvestment, setInitialInvestment] = useState(500000);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const calculation = useMemo(() => {
    const rateAsDecimal = discountRate / 100;
    const years = CASH_FLOWS.map((item) => {
      const discountFactor = roundDiscountFactor(rateAsDecimal, item.year);
      const presentValue = item.cashInflow * discountFactor;

      return {
        ...item,
        discountFactor,
        presentValue,
      };
    });

    const discountedCashFlows = years.reduce((sum, item) => sum + item.presentValue, 0);
    const npv = discountedCashFlows - initialInvestment;

    return {
      years,
      discountedCashFlows,
      npv,
    };
  }, [discountRate, initialInvestment]);

  const isPositive = calculation.npv >= 0;

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,98,254,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.12),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#f2f6fb_100%)] font-["Avenir_Next",Avenir,"Segoe_UI",Helvetica,Arial,sans-serif] text-slate-900'>
      <div className="mx-auto max-w-[1120px] px-5 pb-14 pt-8 max-sm:px-[14px] max-sm:pb-10">
        <section className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[16px] max-sm:p-[18px]">
          <div className="mb-[18px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl leading-[1.1] tracking-[-0.03em] text-slate-900">NPV simulator</h2>
              <p className="mt-2 max-w-[620px] text-[0.95rem] leading-[1.6] text-slate-500">
                Move the sliders to change the discount rate and initial investment, then see whether NPV stays
                positive or turns negative.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] px-4 py-3 text-left sm:text-right">
              <span className="block text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">
                Current decision
              </span>
              <strong className={`mt-1 block text-[1.15rem] ${isPositive ? "text-teal-700" : "text-orange-700"}`}>
                {isPositive ? "Accept project" : "Reject project"}
              </strong>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-[18px] pb-[14px] pt-[18px]">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="discount-rate" className="text-[0.95rem] font-bold text-slate-900">
                  Discount rate
                </label>
                <strong className="text-[1rem] text-slate-900">{formatPercent(discountRate)}</strong>
              </div>
              <input
                id="discount-rate"
                type="range"
                min={MIN_DISCOUNT_RATE}
                max={MAX_DISCOUNT_RATE}
                step="0.5"
                value={discountRate}
                onChange={(event) => setDiscountRate(Number(event.target.value))}
                className="mt-4 h-3 w-full accent-[#0f62fe]"
              />
              <div className="mt-[10px] flex justify-between text-[0.82rem] text-slate-500" aria-hidden="true">
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-[18px] pb-[14px] pt-[18px]">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="initial-investment" className="text-[0.95rem] font-bold text-slate-900">
                  Initial investment
                </label>
                <strong className="text-[1rem] text-slate-900">{formatCurrency(initialInvestment)}</strong>
              </div>
              <input
                id="initial-investment"
                type="range"
                min={MIN_INITIAL_INVESTMENT}
                max={MAX_INITIAL_INVESTMENT}
                step="10000"
                value={initialInvestment}
                onChange={(event) => setInitialInvestment(Number(event.target.value))}
                className="mt-4 h-3 w-full accent-[#0891b2]"
              />
              <div className="mt-[10px] flex justify-between text-[0.82rem] text-slate-500" aria-hidden="true">
                <span>{formatCurrency(MIN_INITIAL_INVESTMENT)}</span>
                <span>{formatCurrency(520000)}</span>
                <span>{formatCurrency(MAX_INITIAL_INVESTMENT)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <StatCard
              label="Net present value"
              value={formatCurrency(calculation.npv)}
              note={isPositive ? "The project creates value at this discount rate." : "The project destroys value at this discount rate."}
              accent={isPositive ? "teal" : "amber"}
            />
            <StatCard
              label="Discounted inflows"
              value={formatCurrency(calculation.discountedCashFlows)}
              note="Total of the present values from years 1 to 5."
              accent="blue"
            />
            <StatCard
              label="Initial investment"
              value={formatCurrency(initialInvestment)}
              note="This amount is deducted from the discounted inflows."
              accent="amber"
            />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[16px] max-sm:p-[18px]">
            <div className="mb-[18px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="m-0 text-[1.4rem] leading-[1.1] tracking-[-0.03em] text-slate-900">
                  Present values by year
                </h3>
                <p className="mt-2 max-w-[620px] text-[0.95rem] leading-[1.6] text-slate-500">
                  Later cash flows are worth less in today&apos;s money.
                </p>
              </div>
            </div>

            <div className="h-[320px] w-full">
              {hasMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculation.years}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 13 }} />
                    <YAxis
                      tickFormatter={formatAxisCurrency}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748b", fontSize: 13 }}
                      width={60}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
                    <Bar dataKey="presentValue" radius={[16, 16, 6, 6]}>
                      {calculation.years.map((item) => (
                        <Cell
                          key={item.year}
                          fill={item.year <= 2 ? "#0f62fe" : item.year <= 4 ? "#3b82f6" : "#0891b2"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-[rgba(15,23,42,0.12)] bg-[#f8fafc] text-sm text-slate-500">
                  Loading chart...
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[16px] max-sm:p-[18px]">
            <div className="mb-[18px]">
              <h3 className="m-0 text-[1.4rem] leading-[1.1] tracking-[-0.03em] text-slate-900">Calculation table</h3>
              <p className="mt-2 text-[0.95rem] leading-[1.6] text-slate-500">
                Discount factors are rounded to three decimal places to match the teaching example.
              </p>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-[rgba(15,23,42,0.08)]">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8fbff] text-left">
                    <th className="px-4 py-3 text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">Year</th>
                    <th className="px-4 py-3 text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">Cash inflow</th>
                    <th className="px-4 py-3 text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">Factor</th>
                    <th className="px-4 py-3 text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">Present value</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.years.map((item) => (
                    <tr key={item.year} className="border-t border-[rgba(15,23,42,0.06)] bg-white">
                      <td className="px-4 py-3 text-[0.95rem] font-semibold text-slate-900">{item.year}</td>
                      <td className="px-4 py-3 text-[0.95rem] text-slate-700">{formatCurrency(item.cashInflow)}</td>
                      <td className="px-4 py-3 text-[0.95rem] text-slate-700">{item.discountFactor.toFixed(3)}</td>
                      <td className="px-4 py-3 text-[0.95rem] font-semibold text-slate-900">{formatCurrency(item.presentValue)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[rgba(15,23,42,0.08)] bg-[#f8fbff]">
                    <td className="px-4 py-3 text-[0.95rem] font-bold text-slate-900">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-[0.95rem] font-semibold text-slate-700">PV total</td>
                    <td className="px-4 py-3 text-[0.95rem] font-bold text-slate-900">
                      {formatCurrency(calculation.discountedCashFlows)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
