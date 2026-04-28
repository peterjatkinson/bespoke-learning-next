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

const BASE_VARIABLE_COSTS = [
  { name: "Flour", amount: 0.4 },
  { name: "Water and salt", amount: 0.05 },
  { name: "Yeast", amount: 0.1 },
  { name: "Packaging bag", amount: 0.15 },
];

const BASE_FIXED_COSTS = [
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
const BASE_VARIABLE_COST_TOTAL = BASE_VARIABLE_COSTS.reduce((sum, item) => sum + item.amount, 0);
const BASE_FIXED_COST_TOTAL = BASE_FIXED_COSTS.reduce((sum, item) => sum + item.amount, 0);
const MIN_VARIABLE_COST_PER_LOAF = 0.4;
const MAX_VARIABLE_COST_PER_LOAF = 1.4;
const MIN_TOTAL_FIXED_COST = 4000;
const MAX_TOTAL_FIXED_COST = 10000;
const MAX_CHART_COST = MAX_TOTAL_FIXED_COST + (MAX_UNITS * MAX_VARIABLE_COST_PER_LOAF);
const Y_AXIS_TICKS = [0, 2000, 4000, 6000, 8000, 10000, 12000];
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
  return `£${Math.round(value / 1000)}k`;
}

function BehaviourRow({
  label,
  value,
  helper,
  tone,
  onInfoClick,
  infoLabel,
  buttonRef,
  formatter = formatWholePounds,
}) {
  const toneClasses = {
    teal: "bg-[#eefaf8] text-black",
    blue: "bg-[#eef4ff] text-black",
    amber: "bg-[#fff5e8] text-black",
    slate: "bg-slate-100 text-black",
  };

  return (
    <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] px-4 py-[15px] shadow-[0_10px_24px_rgba(15,23,42,0.05)] max-[480px]:rounded-none max-[480px]:border-x-0">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="m-0 text-[0.98rem] font-bold text-slate-900">{label}</p>
            {onInfoClick ? (
              <button
                ref={buttonRef}
                type="button"
                onClick={onInfoClick}
                aria-label={infoLabel}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(15,23,42,0.1)] bg-white text-xs font-semibold text-slate-700 transition hover:border-[rgba(15,98,254,0.22)] hover:text-[#0f62fe]"
              >
                i
              </button>
            ) : null}
          </div>
          <p className="mt-[6px] text-[0.9rem] leading-[1.45] text-slate-800">
            {helper}
          </p>
        </div>
        <p className={`m-0 rounded-full px-3 py-2 text-[1rem] font-bold tracking-[-0.02em] ${toneClasses[tone]}`}>
          {formatter(value)}
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
            <p className="mt-2 text-[0.94rem] leading-[1.6] text-slate-700">{subtitle}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close breakdown"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(15,23,42,0.1)] bg-slate-50 text-lg text-slate-700 transition hover:text-slate-900"
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

export default function FixedVariableCostsPage() {
  const [units, setUnits] = useState(400);
  const [variableCostPerLoaf, setVariableCostPerLoaf] = useState(BASE_VARIABLE_COST_TOTAL);
  const [totalFixedCostTarget, setTotalFixedCostTarget] = useState(BASE_FIXED_COST_TOTAL);
  const [openBreakdown, setOpenBreakdown] = useState(null);
  const variableInfoButtonRef = useRef(null);
  const fixedInfoButtonRef = useRef(null);

  const variableCostScale = variableCostPerLoaf / BASE_VARIABLE_COST_TOTAL;
  const fixedCostScale = totalFixedCostTarget / BASE_FIXED_COST_TOTAL;
  const variableCosts = BASE_VARIABLE_COSTS.map((item) => ({
    ...item,
    amount: item.amount * variableCostScale,
  }));
  const fixedCosts = BASE_FIXED_COSTS.map((item) => ({
    ...item,
    amount: item.amount * fixedCostScale,
  }));

  const totalVariablePerUnit = variableCosts.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedCosts = fixedCosts.reduce((sum, item) => sum + item.amount, 0);
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
    <main className='min-h-full bg-white font-["Avenir_Next",Avenir,"Segoe_UI",Helvetica,Arial,sans-serif] text-slate-900'>
      <div className="mx-auto max-w-[1120px] px-5 pb-14 pt-8 max-[1500px]:max-w-none max-[1500px]:px-0 max-[1500px]:pb-0 max-[1500px]:pt-0 max-sm:pb-0">
        <section className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-[1500px]:rounded-none max-[1500px]:border-x-0 max-[1500px]:shadow-none max-sm:p-[18px] max-[480px]:!px-0 max-[480px]:py-[18px]">
          <div className="mb-[18px] flex flex-col gap-4 max-[480px]:px-[18px] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl leading-[1.1] tracking-[-0.03em] text-slate-900">
                Fixed vs variable costs
              </h2>
              <p className="mt-2 max-w-[620px] text-[0.95rem] leading-[1.6] text-slate-700">
                Change output volume and compare what moves with production against what stays constant in total.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] px-4 py-3 text-left max-[480px]:-mx-[18px] max-[480px]:rounded-none max-[480px]:border-x-0 sm:text-right">
              <span className="block text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-700">
                Current output
              </span>
              <strong className="mt-1 block text-[1.15rem] text-slate-900">
                {units} loaves
              </strong>
            </div>
          </div>

          <InputSlider
            id="units-slider"
            label="Number of loaves"
            value={units}
            onChange={setUnits}
            min={MIN_UNITS}
            max={MAX_UNITS}
            step={25}
            displayValue={`${units} loaves`}
            tickLeft="0"
            tickRight="1,500"
            fillColor="#0f62fe"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputSlider
              id="variable-cost-slider"
              label="Variable cost per loaf"
              value={variableCostPerLoaf}
              onChange={setVariableCostPerLoaf}
              min={MIN_VARIABLE_COST_PER_LOAF}
              max={MAX_VARIABLE_COST_PER_LOAF}
              step={0.05}
              displayValue={formatCurrency(totalVariablePerUnit)}
              tickLeft={formatCurrency(MIN_VARIABLE_COST_PER_LOAF)}
              tickRight={formatCurrency(MAX_VARIABLE_COST_PER_LOAF)}
              fillColor="#f59e0b"
              ariaValueText={`${formatCurrency(totalVariablePerUnit)} per loaf`}
            />

            <InputSlider
              id="fixed-cost-slider"
              label="Total fixed cost"
              value={totalFixedCostTarget}
              onChange={setTotalFixedCostTarget}
              min={MIN_TOTAL_FIXED_COST}
              max={MAX_TOTAL_FIXED_COST}
              step={50}
              displayValue={formatWholePounds(totalFixedCosts)}
              tickLeft={formatWholePounds(MIN_TOTAL_FIXED_COST)}
              tickRight={formatWholePounds(MAX_TOTAL_FIXED_COST)}
              fillColor="#0891b2"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-[10px] max-[480px]:px-[18px]">
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

        </section>

        <section className="mt-5 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-[1500px]:rounded-none max-[1500px]:border-x-0 max-[1500px]:shadow-none max-sm:p-[18px] max-[480px]:!px-0 max-[480px]:py-[18px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] p-4 max-[480px]:rounded-none max-[480px]:border-x-0 max-[480px]:px-2">
              <div className="mb-3">
                <h3 className="m-0 text-[1.1rem] font-bold tracking-[-0.02em] text-slate-900">
                  Cost behaviour by output volume
                </h3>
                <p className="mt-1 text-[0.92rem] leading-[1.5] text-slate-700">
                  The chart shows fixed cost as a flat line, while variable and total costs rise as output increases.
                </p>
              </div>

              <div className="h-[320px]" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints} margin={{ top: 10, right: 12, left: 0, bottom: 6 }}>
                    <CartesianGrid stroke="#dbe4ee" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="volume"
                      type="number"
                      domain={[MIN_UNITS, MAX_UNITS]}
                      ticks={X_AXIS_TICKS}
                      tick={{ fill: "#0f172a", fontSize: 13 }}
                      tickLine={false}
                      axisLine={{ stroke: "#64748b" }}
                      label={{ value: "Loaves", position: "insideBottom", offset: -2, fill: "#0f172a", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, MAX_CHART_COST]}
                      ticks={Y_AXIS_TICKS}
                      tickFormatter={formatAxisPounds}
                      tick={{ fill: "#0f172a", fontSize: 13 }}
                      tickLine={false}
                      axisLine={{ stroke: "#64748b" }}
                      width={56}
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
                  <caption className="text-left text-[0.9rem] font-semibold text-slate-700">
                    Graph key points table
                  </caption>
                  <thead>
                    <tr className="text-left text-[0.78rem] uppercase tracking-[0.08em] text-slate-700">
                      <th scope="col" className="px-3 py-1 font-semibold">Loaves</th>
                      <th scope="col" className="px-3 py-1 font-semibold">Fixed cost</th>
                      <th scope="col" className="px-3 py-1 font-semibold">Variable cost</th>
                      <th scope="col" className="px-3 py-1 font-semibold">Total cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartPoints.map((point) => (
                      <tr key={point.volume} className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                        <th scope="row" className="rounded-l-[14px] px-3 py-2 text-[0.92rem] font-semibold text-slate-900">
                          {point.volume}
                        </th>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">{formatWholePounds(point.fixed)}</td>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">{formatWholePounds(point.variable)}</td>
                        <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">{formatWholePounds(point.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <BehaviourRow
                label="Variable cost per loaf"
                value={totalVariablePerUnit}
                helper="Same for each extra loaf"
                tone="amber"
                onInfoClick={() => setOpenBreakdown("variable")}
                infoLabel="Show variable cost breakdown"
                buttonRef={variableInfoButtonRef}
                formatter={formatCurrency}
              />
              <BehaviourRow
                label="Fixed cost per loaf"
                value={fixedCostPerUnit}
                helper="Falls as output increases"
                tone="teal"
                formatter={formatCurrency}
              />
              <BehaviourRow
                label="Average cost per loaf"
                value={totalCostPerUnit}
                helper="Total cost divided by output"
                tone="slate"
                formatter={formatCurrency}
              />
              <BehaviourRow
                label="Total fixed costs"
                value={totalFixedCosts}
                helper="Unchanged in total across the output range"
                tone="teal"
                onInfoClick={() => setOpenBreakdown("fixed")}
                infoLabel="Show fixed cost breakdown"
                buttonRef={fixedInfoButtonRef}
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
          </div>
        </section>

        {openBreakdown === "variable" ? (
          <BreakdownModal
            title="Variable cost ingredients"
            subtitle="These costs make up the per-loaf variable cost."
            rows={variableCosts}
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
            rows={fixedCosts}
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
