"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VARIABLE_COSTS = [
  { name: "Flour", amount: 0.4 },
  { name: "Water and salt", amount: 0.05 },
  { name: "Yeast", amount: 0.1 },
  { name: "Packaging bag", amount: 0.15 },
];

const FIXED_COSTS = [
  { name: "Rent", amount: 2000 },
  { name: "Business rates", amount: 400 },
  { name: "Owner salary", amount: 3500 },
  { name: "Insurance", amount: 150 },
  { name: "Equipment loan", amount: 600 },
  { name: "Depreciation", amount: 300 },
];

const SCENARIOS = [200, 400, 800];
const MIN_UNITS = 0;
const MAX_UNITS = 1500;
const X_AXIS_TICKS = [0, 250, 500, 750, 1000, 1250, 1500];
const CHART_POINTS = [0, 200, 400, 800, 1500];

function formatCurrency(value, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatWholePounds(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisPounds(value) {
  return `£${Math.round(value).toLocaleString("en-GB")}`;
}

function StatCard({ label, value, note, accent, onInfoClick, infoLabel, buttonRef }) {
  const accentClasses = {
    amber: "bg-[linear-gradient(180deg,#f59e0b_0%,#f97316_100%)]",
    blue: "bg-[linear-gradient(180deg,#0f62fe_0%,#3b82f6_100%)]",
    teal: "bg-[linear-gradient(180deg,#0891b2_0%,#14b8a6_100%)]",
    slate: "bg-[linear-gradient(180deg,#475569_0%,#0f172a_100%)]",
  };

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(252,253,255,0.98)_0%,rgba(246,249,253,0.92)_100%)] p-[18px]">
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 top-0 w-1 ${accentClasses[accent]}`}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[0.76rem] font-bold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        {onInfoClick ? (
          <button
            ref={buttonRef}
            type="button"
            onClick={onInfoClick}
            aria-label={infoLabel}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(15,23,42,0.1)] bg-white text-sm font-semibold text-slate-500 transition hover:border-[rgba(15,98,254,0.22)] hover:text-[#0f62fe]"
          >
            i
          </button>
        ) : null}
      </div>
      <p className="mt-[10px] text-[2rem] leading-none font-bold tracking-[-0.03em] text-slate-900">
        {value}
      </p>
      <p className="mt-[10px] text-[0.95rem] leading-[1.55] text-slate-600">
        {note}
      </p>
    </div>
  );
}

function BehaviourRow({ label, value, helper, tone }) {
  const toneClasses = {
    teal: "bg-[#eefaf8] text-cyan-700",
    blue: "bg-[#eef4ff] text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] px-4 py-[15px] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="m-0 text-[0.98rem] font-bold text-slate-900">{label}</p>
          <p className="mt-[6px] text-[0.9rem] leading-[1.45] text-slate-500">
            {helper}
          </p>
        </div>
        <p className={`m-0 rounded-full px-3 py-2 text-[1rem] font-bold tracking-[-0.02em] ${toneClasses[tone]}`}>
          {formatWholePounds(value)}
        </p>
      </div>
    </div>
  );
}

function BreakdownModal({ title, subtitle, rows, total, totalLabel, onClose, rowFormatter = formatCurrency }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.36)] px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="breakdown-modal-title"
        className="max-h-[85vh] w-full max-w-[620px] overflow-y-auto rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="breakdown-modal-title"
              className="m-0 text-[1.25rem] leading-[1.1] tracking-[-0.03em] text-slate-900"
            >
              {title}
            </h3>
            <p className="mt-2 text-[0.94rem] leading-[1.6] text-slate-500">{subtitle}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close breakdown"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(15,23,42,0.1)] bg-slate-50 text-lg text-slate-500 transition hover:text-slate-900"
          >
            ×
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {rows.map((row) => (
            <div
              key={row.name}
              className="flex items-start justify-between gap-4 rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-4 py-[14px] text-[0.95rem] text-slate-700"
            >
              <span className="block leading-[1.35]">{row.name}</span>
              <strong className="ml-4 block shrink-0 leading-[1.35] font-bold text-slate-900">
                {rowFormatter(row.amount)}
              </strong>
            </div>
          ))}
          <div className="flex items-start justify-between gap-4 rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(238,244,255,0.92)_0%,rgba(248,251,255,0.86)_100%)] px-4 py-[14px] text-[0.95rem] text-slate-700">
            <span className="block leading-[1.35]">{totalLabel}</span>
            <strong className="ml-4 block shrink-0 leading-[1.35] font-bold text-slate-900">
              {total}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FixedVariableCostsPage() {
  const [units, setUnits] = useState(400);
  const [openBreakdown, setOpenBreakdown] = useState(null);
  const variableInfoButtonRef = useRef(null);
  const fixedInfoButtonRef = useRef(null);

  const totalVariablePerUnit = VARIABLE_COSTS.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedCosts = FIXED_COSTS.reduce((sum, item) => sum + item.amount, 0);
  const totalVariableCosts = units * totalVariablePerUnit;
  const totalCosts = totalFixedCosts + totalVariableCosts;
  const fixedCostPerUnit = units === 0 ? 0 : totalFixedCosts / units;
  const totalCostPerUnit = units === 0 ? 0 : totalCosts / units;
  const chartPoints = CHART_POINTS.map((volume) => ({
      volume,
      fixed: totalFixedCosts,
      variable: volume * totalVariablePerUnit,
      total: totalFixedCosts + volume * totalVariablePerUnit,
    }));

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,98,254,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(8,145,178,0.12),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#f2f6fb_100%)] font-["Avenir_Next",Avenir,"Segoe_UI",Helvetica,Arial,sans-serif] text-slate-900'>
      <div className="mx-auto max-w-[1120px] px-5 pb-14 pt-8 max-sm:px-[14px] max-sm:pb-10">
        <section className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[16px] max-sm:p-[18px]">
          <div className="mb-[18px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl leading-[1.1] tracking-[-0.03em] text-slate-900">
                Fixed vs variable costs
              </h2>
              <p className="mt-2 max-w-[620px] text-[0.95rem] leading-[1.6] text-slate-500">
                Change output volume and compare what moves with production against what stays constant in total.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] px-4 py-3 text-left sm:text-right">
              <span className="block text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">
                Current output
              </span>
              <strong className="mt-1 block text-[1.15rem] text-slate-900">
                {units} loaves
              </strong>
            </div>
          </div>

          <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-[18px] pb-[14px] pt-[18px]">
            <label htmlFor="units-slider" className="sr-only">
              Output volume in loaves
            </label>
            <input
              id="units-slider"
              type="range"
              min={MIN_UNITS}
              max={MAX_UNITS}
              step={25}
              value={units}
              onChange={(event) => setUnits(Number(event.target.value))}
              className="h-3 w-full accent-[#0f62fe]"
            />
            <div className="mt-[10px] flex justify-between text-[0.82rem] text-slate-500" aria-hidden="true">
              <span>0</span>
              <span>750</span>
              <span>1,500</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-[10px]">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario}
                type="button"
                onClick={() => setUnits(scenario)}
                className={
                  units === scenario
                    ? "rounded-full border border-slate-900 bg-slate-900 px-[14px] py-[10px] text-[0.94rem] font-semibold text-white transition"
                    : "rounded-full border border-[rgba(15,23,42,0.1)] bg-[rgba(255,255,255,0.92)] px-[14px] py-[10px] text-[0.94rem] font-semibold text-slate-700 transition hover:-translate-y-px hover:border-[rgba(15,98,254,0.22)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                }
              >
                {scenario} loaves
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Variable cost per loaf"
              value={formatCurrency(totalVariablePerUnit)}
              note="Same for each extra loaf."
              accent="amber"
              onInfoClick={() => setOpenBreakdown("variable")}
              infoLabel="Show variable cost breakdown"
              buttonRef={variableInfoButtonRef}
            />
            <StatCard
              label="Total costs"
              value={formatWholePounds(totalCosts)}
              note="Fixed plus variable combined."
              accent="slate"
            />
            <StatCard
              label="Total variable cost"
              value={formatWholePounds(totalVariableCosts)}
              note="Rises with output."
              accent="blue"
            />
            <StatCard
              label="Total fixed cost"
              value={formatWholePounds(totalFixedCosts)}
              note="Flat in total."
              accent="teal"
              onInfoClick={() => setOpenBreakdown("fixed")}
              infoLabel="Show fixed cost breakdown"
              buttonRef={fixedInfoButtonRef}
            />
          </div>

          <div className="mt-[14px] grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-4 py-[14px]">
              <span className="text-[0.94rem] text-slate-600">Fixed cost per loaf</span>
              <strong className="text-base font-bold text-slate-900">
                {formatCurrency(fixedCostPerUnit)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-4 py-[14px]">
              <span className="text-[0.94rem] text-slate-600">Average cost per loaf</span>
              <strong className="text-base font-bold text-slate-900">
                {formatCurrency(totalCostPerUnit)}
              </strong>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-[16px] max-sm:p-[18px]">
          <div className="grid gap-3 md:grid-cols-3">
            <BehaviourRow
              label="Total fixed costs"
              value={totalFixedCosts}
              helper="Unchanged in total across the output range"
              tone="teal"
            />
            <BehaviourRow
              label="Total variable costs"
              value={totalVariableCosts}
              helper="Moves directly with every extra loaf"
              tone="blue"
            />
            <BehaviourRow
              label="Total costs"
              value={totalCosts}
              helper="Fixed and variable costs together"
              tone="slate"
            />
          </div>

          <div className="mt-5 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] p-4">
            <div className="mb-3">
              <h3 className="m-0 text-[1.1rem] font-bold tracking-[-0.02em] text-slate-900">
                Cost behaviour by output volume
              </h3>
              <p className="mt-1 text-[0.92rem] leading-[1.5] text-slate-500">
                The chart shows fixed cost as a flat line, while variable and total costs rise as output increases.
              </p>
            </div>

            <div className="h-[320px]" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints} margin={{ top: 10, right: 16, left: 8, bottom: 6 }}>
                  <CartesianGrid stroke="#dbe4ee" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="volume"
                    type="number"
                    domain={[MIN_UNITS, MAX_UNITS]}
                    ticks={X_AXIS_TICKS}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    label={{ value: "Loaves", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={formatAxisPounds}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#cbd5e1" }}
                    width={84}
                  />
                  <Tooltip
                    formatter={(value) => formatWholePounds(value)}
                    labelFormatter={(value) => `${value} loaves`}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="fixed" name="Fixed cost" stroke="#0891b2" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="variable" name="Variable cost" stroke="#0f62fe" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="total" name="Total cost" stroke="#334155" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="sr-only" aria-live="polite">
              At {units} loaves, fixed cost is {formatWholePounds(totalFixedCosts)}, variable cost is {formatWholePounds(totalVariableCosts)}, and total cost is {formatWholePounds(totalCosts)}.
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <caption className="sr-only">
                  Cost values shown in the chart for selected output volumes.
                </caption>
                <thead>
                  <tr className="text-left text-[0.78rem] uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-3 py-1 font-semibold">Loaves</th>
                    <th className="px-3 py-1 font-semibold">Fixed cost</th>
                    <th className="px-3 py-1 font-semibold">Variable cost</th>
                    <th className="px-3 py-1 font-semibold">Total cost</th>
                  </tr>
                </thead>
                <tbody>
                  {chartPoints.map((point) => (
                    <tr key={point.volume} className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                      <td className="rounded-l-[14px] px-3 py-2 text-[0.92rem] font-semibold text-slate-900">
                        {point.volume}
                      </td>
                      <td className="px-3 py-2 text-[0.92rem] text-slate-700">{formatWholePounds(point.fixed)}</td>
                      <td className="px-3 py-2 text-[0.92rem] text-slate-700">{formatWholePounds(point.variable)}</td>
                      <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">{formatWholePounds(point.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {openBreakdown === "variable" ? (
          <BreakdownModal
            title="Variable cost ingredients"
            subtitle="These costs make up the per-loaf variable cost."
            rows={VARIABLE_COSTS}
            total={formatCurrency(totalVariablePerUnit)}
            totalLabel="Total variable cost per loaf"
            onClose={() => {
              setOpenBreakdown(null);
              variableInfoButtonRef.current?.focus();
            }}
          />
        ) : null}

        {openBreakdown === "fixed" ? (
          <BreakdownModal
            title="Fixed monthly costs"
            subtitle="These costs remain fixed in total across the output range shown here."
            rows={FIXED_COSTS}
            total={formatWholePounds(totalFixedCosts)}
            totalLabel="Total fixed costs"
            rowFormatter={formatWholePounds}
            onClose={() => {
              setOpenBreakdown(null);
              fixedInfoButtonRef.current?.focus();
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
