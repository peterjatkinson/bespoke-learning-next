"use client";

import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULTS = {
  initialCost: 50000,
  inflows: [8000, 12000, 15000, 18000, 20000],
};

const INITIAL_COST_MIN = 30000;
const INITIAL_COST_MAX = 80000;
const INFLOW_MIN = 0;
const INFLOW_MAX = 30000;
const YEARS = [1, 2, 3, 4, 5];

function formatCurrency(value, digits = 0) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("en-GB");
}

function formatAxisCurrency(value) {
  return `£${Math.round(value / 1000)}k`;
}

function formatMonths(value) {
  const rounded = Math.round(value);
  if (rounded === 1) {
    return "1 month";
  }
  return `${rounded} months`;
}

function formatPayback(payback) {
  if (!payback.recovered) {
    return "No payback within 5 years";
  }

  if (payback.monthsIntoYear === 12 || payback.monthsIntoYear === 0) {
    return `${payback.year} ${payback.year === 1 ? "year" : "years"} exactly`;
  }

  return `${payback.year - 1} years ${formatMonths(payback.monthsIntoYear)}`;
}

function formatProjectedPayback(projectedPayback) {
  if (!projectedPayback) {
    return "Beyond Year 5";
  }

  const monthsIntoNextYear = Math.round((projectedPayback.x - Math.floor(projectedPayback.x)) * 12);

  if (monthsIntoNextYear === 0) {
    return `Year ${Math.round(projectedPayback.x)} exactly`;
  }

  return `Year ${Math.floor(projectedPayback.x) + 1}, ${formatMonths(monthsIntoNextYear)} in`;
}

function ResultCard({ label, value, helper, tone }) {
  const toneClasses = {
    cyan: "bg-[#eefaf8] text-black",
    blue: "bg-[#eef4ff] text-black",
    amber: "bg-[#fff5e8] text-black",
    slate: "bg-slate-100 text-black",
    none: "text-black",
  };

  return (
    <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] px-4 py-[15px] shadow-[0_10px_24px_rgba(15,23,42,0.05)] max-[480px]:rounded-none max-[480px]:border-x-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="sm:min-w-0 sm:flex-1">
          <p className="m-0 text-[0.98rem] font-bold text-slate-900">{label}</p>
          <p className="mt-[6px] text-[0.9rem] leading-[1.45] text-slate-800">{helper}</p>
        </div>
        <p className={`m-0 rounded-full px-3 py-2 text-center text-[1rem] font-bold tracking-[-0.02em] sm:flex-[0_0_42%] ${toneClasses[tone]}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function InputSlider({ id, label, value, onChange, min, max, step, displayValue, tickLeft, tickRight, fillColor, ariaValueText }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-[18px] pb-[14px] pt-[18px] max-[480px]:rounded-none max-[480px]:border-x-0">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-[0.94rem] font-semibold text-slate-700">
          {label}
        </label>
        <strong className="text-[1rem] text-slate-900">{displayValue}</strong>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={ariaValueText ?? displayValue}
        style={{
          background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, #9ca3af ${percentage}%, #9ca3af 100%)`,
          "--slider-fill": fillColor,
        }}
        className="mt-4 h-2.5 w-full appearance-none rounded-full [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[var(--slider-fill)] [&::-webkit-slider-thumb]:shadow-none [&::-moz-range-track]:h-2.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#9ca3af] [&::-moz-range-track]:border-0 [&::-moz-range-progress]:h-2.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:border-0 [&::-moz-range-progress]:bg-[var(--slider-fill)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--slider-fill)]"
      />
      <div className="mt-[10px] flex justify-between text-[0.82rem] text-slate-800" aria-hidden="true">
        <span>{tickLeft}</span>
        <span>{tickRight}</span>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0]?.payload;
  const yearLabel = entry.projected ? "Projected payback" : `Year ${label}`;

  return (
    <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold text-slate-900">{yearLabel}</p>
      <p className="mt-2 text-sm text-slate-700">
        {entry.projected ? "Assumed annual inflow" : "Net inflow"}: <span className="font-semibold text-slate-900">{formatCurrency(entry.inflow)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Cumulative inflow: <span className="font-semibold text-slate-900">{formatCurrency(entry.cumulative)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Still to recover: <span className="font-semibold text-slate-900">{formatCurrency(Math.max(entry.remaining, 0))}</span>
      </p>
    </div>
  );
}

function AboveChartLabel({ viewBox, value, fill }) {
  if (!viewBox) return null;
  return (
    <text
      x={viewBox.x}
      y={viewBox.y - 6}
      fill={fill}
      fontSize={12}
      fontWeight={600}
      textAnchor="middle"
    >
      {value}
    </text>
  );
}

function calculatePayback(rows, initialCost) {
  const recoveryRow = rows.find((row) => row.cumulative >= initialCost);
  const totalInflows = rows.at(-1)?.cumulative ?? 0;

  if (!recoveryRow) {
    return {
      recovered: false,
      year: null,
      monthsIntoYear: null,
      previousCumulative: totalInflows,
      remainingBeforePayback: Math.max(initialCost - totalInflows, 0),
      totalInflows,
    };
  }

  const previousCumulative = recoveryRow.cumulative - recoveryRow.inflow;
  const remainingBeforePayback = initialCost - previousCumulative;
  const fractionOfYear = recoveryRow.inflow === 0 ? 0 : remainingBeforePayback / recoveryRow.inflow;
  const monthsIntoYear = Math.min(12, Math.max(0, fractionOfYear * 12));

  return {
    recovered: true,
    year: recoveryRow.year,
    monthsIntoYear,
    previousCumulative,
    remainingBeforePayback,
    totalInflows,
  };
}

export default function PaybackMethodPage() {
  const [initialCost, setInitialCost] = useState(DEFAULTS.initialCost);
  const [inflows, setInflows] = useState(DEFAULTS.inflows);
  const [resetAnnouncement, setResetAnnouncement] = useState("");

  const rows = useMemo(() => {
    let cumulative = 0;

    return YEARS.map((year, index) => {
      const inflow = inflows[index];
      cumulative += inflow;

      return {
        year,
        inflow,
        cumulative,
        remaining: initialCost - cumulative,
      };
    });
  }, [inflows, initialCost]);

  const payback = useMemo(() => calculatePayback(rows, initialCost), [rows, initialCost]);
  const totalInflows = rows.at(-1)?.cumulative ?? 0;
  const surplusOrShortfall = totalInflows - initialCost;

  const projectedPayback = useMemo(() => {
    const finalKnownInflow = inflows.at(-1) ?? 0;

    if (payback.recovered || finalKnownInflow <= 0 || totalInflows >= initialCost) {
      return null;
    }

    const remainingAfterYearFive = initialCost - totalInflows;
    const yearsAfterYearFive = remainingAfterYearFive / finalKnownInflow;

    return {
      x: 5 + yearsAfterYearFive,
      remainingAfterYearFive,
      assumedAnnualInflow: finalKnownInflow,
    };
  }, [inflows, initialCost, payback.recovered, totalInflows]);

  const chartEndYear = projectedPayback ? Math.ceil(projectedPayback.x) : 5;
  const xTicks = Array.from({ length: chartEndYear + 1 }, (_, index) => index);
  const chartMax = Math.max(initialCost, totalInflows, 80000);

  const chartData = useMemo(() => {
    const data = [
      {
        year: 0,
        inflow: 0,
        cumulative: 0,
        remaining: initialCost,
        cumulativeActual: 0,
        cumulativeProjected: null,
      },
      ...rows.map((row, index) => ({
        ...row,
        cumulativeActual: row.cumulative,
        cumulativeProjected: projectedPayback && index === rows.length - 1 ? row.cumulative : null,
      })),
    ];

    if (projectedPayback) {
      data.push({
        year: projectedPayback.x,
        inflow: projectedPayback.assumedAnnualInflow,
        cumulative: initialCost,
        remaining: 0,
        cumulativeActual: null,
        cumulativeProjected: initialCost,
        projected: true,
      });
    }

    return data;
  }, [initialCost, projectedPayback, rows]);

  const statusText = payback.recovered ? `Pays back in year ${payback.year}` : "No payback in 5 years";

  const resetToDefaults = () => {
    setInitialCost(DEFAULTS.initialCost);
    setInflows(DEFAULTS.inflows);
    setResetAnnouncement("");
    setTimeout(() => setResetAnnouncement("Values have been reset to defaults."), 50);
  };

  const updateInflow = (index, value) => {
    setInflows((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  return (
    <main className='min-h-full bg-white font-["Avenir_Next",Avenir,"Segoe_UI",Helvetica,Arial,sans-serif] text-slate-900'>
      <div aria-live="polite" aria-atomic="true" className="sr-only">{resetAnnouncement}</div>
      <div className="mx-auto max-w-[1120px] px-5 pb-14 pt-8 max-[1500px]:max-w-none max-[1500px]:px-0 max-[1500px]:pb-0 max-[1500px]:pt-0 max-sm:pb-0">
        <section className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-[1500px]:rounded-none max-[1500px]:border-x-0 max-[1500px]:shadow-none max-sm:p-[18px] max-[480px]:!px-0 max-[480px]:py-[18px]">
          <div className="mb-[18px] flex flex-col gap-4 max-[480px]:px-[18px] sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:max-w-[42%]">
              <h2 className="m-0 text-2xl leading-[1.1] tracking-[-0.03em] text-slate-900">
                Payback method
              </h2>
              <p className="mt-2 text-[0.95rem] leading-[1.6] text-slate-700">
                Adjust the initial equipment cost and each year&apos;s net cash inflow to see when the startup recovers its investment.
              </p>
            </div>
            <div className="flex items-center gap-3 max-[480px]:flex-col max-[480px]:items-stretch">
              <button
                onClick={resetToDefaults}
                className="whitespace-nowrap rounded-[14px] border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2 text-[0.88rem] font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                Reset to defaults
              </button>
              <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] px-4 py-3 text-left max-[480px]:-mx-[18px] max-[480px]:rounded-none max-[480px]:border-x-0 sm:text-right">
                <span className="block text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-700">
                  Current result
                </span>
                <strong className={`mt-1 block text-[1.15rem] ${payback.recovered ? "text-slate-900" : "text-orange-700"}`}>
                  {statusText}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputSlider
              id="initial-cost-slider"
              label="Initial equipment cost"
              value={initialCost}
              onChange={setInitialCost}
              min={INITIAL_COST_MIN}
              max={INITIAL_COST_MAX}
              step={1000}
              displayValue={formatCurrency(initialCost)}
              tickLeft={formatCurrency(INITIAL_COST_MIN)}
              tickRight={formatCurrency(INITIAL_COST_MAX)}
              fillColor="#334155"
            />
            {YEARS.map((year, index) => (
              <InputSlider
                key={year}
                id={`year-${year}-inflow-slider`}
                label={`Year ${year} net inflow`}
                value={inflows[index]}
                onChange={(value) => updateInflow(index, value)}
                min={INFLOW_MIN}
                max={INFLOW_MAX}
                step={1000}
                displayValue={formatCurrency(inflows[index])}
                tickLeft={formatCurrency(INFLOW_MIN)}
                tickRight={formatCurrency(INFLOW_MAX)}
                fillColor={year <= 2 ? "#0f62fe" : year <= 4 ? "#0891b2" : "#f59e0b"}
              />
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-[1500px]:rounded-none max-[1500px]:border-x-0 max-[1500px]:shadow-none max-sm:p-[18px] max-[480px]:!px-0 max-[480px]:py-[18px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] p-4 max-[480px]:rounded-none max-[480px]:border-x-0 max-[480px]:px-2">
              <div className="mb-3">
                <h3 className="m-0 text-[1.1rem] font-bold tracking-[-0.02em] text-slate-900">
                  Cumulative cash inflow by year
                </h3>
                <p className="mt-1 text-[0.92rem] leading-[1.5] text-slate-700">
                  Payback happens when the cumulative inflow line reaches the initial equipment cost.
                </p>
              </div>

              <div className="h-[320px]" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 24, right: 12, left: 0, bottom: 6 }}>
                    <CartesianGrid stroke="#dbe4ee" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      type="number"
                      domain={[0, chartEndYear]}
                      ticks={xTicks}
                      tick={{ fill: "#0f172a", fontSize: 13 }}
                      tickLine={false}
                      axisLine={{ stroke: "#64748b" }}
                      label={{ value: "Year", position: "insideBottom", offset: -2, fill: "#0f172a", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, chartMax]}
                      tickFormatter={formatAxisCurrency}
                      tick={{ fill: "#0f172a", fontSize: 13 }}
                      tickLine={false}
                      axisLine={{ stroke: "#64748b" }}
                      width={58}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ bottom: -8 }} />
                    <ReferenceLine
                      y={initialCost}
                      stroke="#334155"
                      strokeDasharray="5 5"
                      label={{ value: "Initial cost", fill: "#111827", position: "insideTopLeft", fontSize: 12, fontWeight: 600 }}
                    />
                    {payback.recovered ? (
                      <ReferenceLine
                        x={payback.year - 1 + payback.monthsIntoYear / 12}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={<AboveChartLabel value="Payback" fill="#92400e" />}
                      />
                    ) : null}
                    {!payback.recovered && projectedPayback ? (
                      <ReferenceLine
                        x={projectedPayback.x}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={<AboveChartLabel value="Projected payback" fill="#92400e" />}
                      />
                    ) : null}
                    <Line
                      type="monotone"
                      dataKey="cumulativeActual"
                      name="Cumulative inflow"
                      stroke="#0f62fe"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    {projectedPayback ? (
                      <Line
                        type="monotone"
                        dataKey="cumulativeProjected"
                        name="Projected continuation"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        strokeDasharray="6 5"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {projectedPayback ? (
                <p aria-hidden="true" className="mt-2 text-[0.86rem] leading-[1.5] text-slate-700">
                  The dashed continuation assumes the Year 5 inflow of {formatCurrency(projectedPayback.assumedAnnualInflow)} repeats beyond the known five-year period.
                </p>
              ) : null}

              <div className="sr-only">
                Graph description. The cumulative inflow after five years is {formatCurrency(totalInflows)} against an initial equipment cost of {formatCurrency(initialCost)}. {payback.recovered ? `The investment pays back in Year ${payback.year}, about ${formatMonths(payback.monthsIntoYear)} into that year.` : `The investment does not pay back within five years.${projectedPayback ? ` If the Year 5 inflow continued, it would pay back at about ${formatProjectedPayback(projectedPayback)}.` : ""}`}
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <caption className="text-left text-[0.9rem] font-semibold text-slate-700">
                    Payback calculation table
                  </caption>
                  <thead>
                    <tr className="text-left text-[0.78rem] uppercase tracking-[0.08em] text-slate-700">
                      <th scope="col" className="px-3 py-1 font-semibold">Year</th>
                      <th scope="col" className="px-3 py-1 font-semibold">Net inflow</th>
                      <th scope="col" className="px-3 py-1 font-semibold">Cumulative inflow</th>
                      <th scope="col" className="px-3 py-1 font-semibold">Still to recover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.year} className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                        <th scope="row" className="rounded-l-[14px] px-3 py-2 text-left text-[0.92rem] font-semibold text-slate-900">
                          {row.year}
                        </th>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">{formatCurrency(row.inflow)}</td>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">{formatCurrency(row.cumulative)}</td>
                        <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">
                          {formatCurrency(Math.max(row.remaining, 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <ResultCard
                label="Payback period"
                value={formatPayback(payback)}
                helper={payback.recovered ? "When cumulative inflows recover the initial cost" : "Total inflows do not recover the initial cost"}
                tone={payback.recovered ? "cyan" : "amber"}
              />
              <ResultCard
                label="Initial cost"
                value={formatCurrency(initialCost)}
                helper="Upfront server infrastructure investment"
                tone="slate"
              />
              <ResultCard
                label="Cumulative inflows"
                value={formatCurrency(totalInflows)}
                helper="Total net inflows over the five-year period"
                tone="blue"
              />
              <ResultCard
                label={surplusOrShortfall >= 0 ? "Surplus after payback" : "Shortfall after 5 years"}
                value={formatCurrency(Math.abs(surplusOrShortfall))}
                helper={surplusOrShortfall >= 0 ? "Cash inflows left after recovering the initial cost" : "Amount still unrecovered at the end of Year 5"}
                tone={surplusOrShortfall >= 0 ? "slate" : "amber"}
              />
              <ResultCard
                label="Recovery point"
                value={payback.recovered ? `Year ${payback.year}` : formatProjectedPayback(projectedPayback)}
                helper={payback.recovered ? `${formatCurrency(payback.remainingBeforePayback)} needed at the start of that year` : "Projection uses the Year 5 inflow rate beyond the known period"}
                tone={payback.recovered ? "blue" : "amber"}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
