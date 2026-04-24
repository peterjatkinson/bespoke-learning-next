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
  fixedCosts: 180000,
  sellingPrice: 3.5,
  variableCost: 1.6,
  forecastSales: 120000,
};

const FIXED_COST_MIN = 60000;
const FIXED_COST_MAX = 300000;
const SELLING_PRICE_MIN = 2.4;
const SELLING_PRICE_MAX = 5.0;
const VARIABLE_COST_MIN = 0.8;
const VARIABLE_COST_MAX = 3.2;
const FORECAST_MIN = 20000;
const FORECAST_MAX = 180000;

function formatCurrency(value, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatWholeCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("en-GB");
}

function formatPercent(value, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function formatSignedCurrency(value) {
  const rounded = Math.round(value);
  const prefix = rounded > 0 ? "+" : "";
  return `${prefix}${formatWholeCurrency(rounded)}`;
}

function ResultCard({ label, value, helper, tone }) {
  const toneClasses = {
    cyan: "bg-[#eefaf8] text-cyan-700",
    blue: "bg-[#eef4ff] text-blue-700",
    amber: "bg-[#fff5e8] text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] px-4 py-[15px] shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="m-0 text-[0.98rem] font-bold text-slate-900">{label}</p>
          <p className="mt-[6px] text-[0.9rem] leading-[1.45] text-slate-500">{helper}</p>
        </div>
        <p className={`m-0 rounded-full px-3 py-2 text-[1rem] font-bold tracking-[-0.02em] ${toneClasses[tone]}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function InputSlider({ id, label, value, onChange, min, max, step, displayValue, tickLeft, tickRight, accent }) {
  return (
    <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] px-[18px] pb-[14px] pt-[18px]">
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
        className={`mt-4 h-3 w-full ${accent}`}
      />
      <div className="mt-[10px] flex justify-between text-[0.82rem] text-slate-500" aria-hidden="true">
        <span>{tickLeft}</span>
        <span>{tickRight}</span>
      </div>
    </div>
  );
}

function RightSideReferenceLabel({ viewBox, value, fill, y = 18 }) {
  if (!viewBox) {
    return null;
  }

  return (
    <text
      x={viewBox.x + 6}
      y={y}
      fill={fill}
      fontSize={12}
      textAnchor="start"
    >
      {value}
    </text>
  );
}

export default function BreakEvenFormulaPage() {
  const [fixedCosts, setFixedCosts] = useState(DEFAULTS.fixedCosts);
  const [sellingPrice, setSellingPrice] = useState(DEFAULTS.sellingPrice);
  const [variableCost, setVariableCost] = useState(DEFAULTS.variableCost);
  const [forecastSales, setForecastSales] = useState(DEFAULTS.forecastSales);

  const calculations = useMemo(() => {
    const contributionPerUnit = sellingPrice - variableCost;
    const validContribution = contributionPerUnit > 0;
    const breakEvenUnits = validContribution ? Math.ceil(fixedCosts / contributionPerUnit) : 0;
    const breakEvenRevenue = breakEvenUnits * sellingPrice;
    const marginOfSafetyUnits = forecastSales - breakEvenUnits;
    const marginOfSafetyPercent = forecastSales > 0 ? (marginOfSafetyUnits / forecastSales) * 100 : 0;

    return {
      contributionPerUnit,
      validContribution,
      breakEvenUnits,
      breakEvenRevenue,
      marginOfSafetyUnits,
      marginOfSafetyPercent,
    };
  }, [fixedCosts, sellingPrice, variableCost, forecastSales]);

  const chartData = useMemo(() => {
    if (!calculations.validContribution) {
      return [];
    }

    const maxUnits = Math.max(
      140000,
      Math.ceil(calculations.breakEvenUnits * 1.3),
      Math.ceil(forecastSales * 1.2)
    );
    const step = Math.max(5000, Math.ceil(maxUnits / 24 / 1000) * 1000);
    const data = [];

    for (let units = 0; units <= maxUnits; units += step) {
      data.push({
        units,
        revenue: units * sellingPrice,
        totalCosts: fixedCosts + units * variableCost,
        fixedCosts,
      });
    }

    const lastPoint = data[data.length - 1];
    if (!lastPoint || lastPoint.units !== maxUnits) {
      data.push({
        units: maxUnits,
        revenue: maxUnits * sellingPrice,
        totalCosts: fixedCosts + maxUnits * variableCost,
        fixedCosts,
      });
    }

    return data;
  }, [calculations.breakEvenUnits, calculations.validContribution, fixedCosts, forecastSales, sellingPrice, variableCost]);

  const scenarioCards = [
    {
      label: "Contribution per bottle",
      value: formatCurrency(calculations.contributionPerUnit),
      helper: "Selling price minus variable cost",
      tone: "amber",
    },
    {
      label: "Break-even point",
      value: `${formatNumber(calculations.breakEvenUnits)} bottles`,
      helper: "Units required to cover all fixed costs",
      tone: "cyan",
    },
    {
      label: "Break-even revenue",
      value: formatWholeCurrency(calculations.breakEvenRevenue),
      helper: "Revenue needed before profit begins",
      tone: "blue",
    },
    {
      label: "Margin of safety",
      value: `${formatNumber(calculations.marginOfSafetyUnits)} bottles`,
      helper: "Forecast sales minus break-even output",
      tone: calculations.marginOfSafetyUnits >= 0 ? "slate" : "amber",
    },
  ];

  const graphKeyPoints = useMemo(() => {
    if (!calculations.validContribution) {
      return [];
    }

    const points = [
      { label: "0 bottles", units: 0 },
      { label: "Break-even point", units: calculations.breakEvenUnits },
      { label: "Forecast sales", units: forecastSales },
    ];

    return points.map((point) => {
      const revenue = point.units * sellingPrice;
      const totalCosts = fixedCosts + point.units * variableCost;
      const profit = revenue - totalCosts;

      let outcome = "Break-even";
      if (profit > 0) {
        outcome = "Profit";
      } else if (profit < 0) {
        outcome = "Loss";
      }

      return {
        ...point,
        revenue,
        totalCosts,
        profit,
        outcome,
      };
    });
  }, [calculations.breakEvenUnits, calculations.validContribution, fixedCosts, forecastSales, sellingPrice, variableCost]);

  return (
    <main className='min-h-full bg-white font-["Avenir_Next",Avenir,"Segoe_UI",Helvetica,Arial,sans-serif] text-slate-900'>
      <div className="mx-auto max-w-[1120px] px-5 pb-14 pt-8 max-[1500px]:max-w-none max-[1500px]:px-0 max-[1500px]:pb-0 max-[1500px]:pt-0 max-sm:pb-0">
        <section className="rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-[1500px]:rounded-none max-[1500px]:border-x-0 max-[1500px]:shadow-none max-sm:p-[18px]">
          <div className="mb-[18px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl leading-[1.1] tracking-[-0.03em] text-slate-900">
                Break-even formula
              </h2>
              <p className="mt-2 max-w-[700px] text-[0.95rem] leading-[1.6] text-slate-500">
                Use contribution margin to see when total revenue and total costs are exactly equal, then test how far forecast sales sit above or below that break-even point.
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-[#f8fbff] px-4 py-3 text-left sm:text-right">
              <span className="block text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">
                Innocent example
              </span>
              <strong className="mt-1 block text-[1.15rem] text-slate-900">
                {formatNumber(DEFAULTS.forecastSales)} bottles forecast
              </strong>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputSlider
              id="fixed-costs-slider"
              label="Fixed costs"
              value={fixedCosts}
              onChange={setFixedCosts}
              min={FIXED_COST_MIN}
              max={FIXED_COST_MAX}
              step={5000}
              displayValue={formatWholeCurrency(fixedCosts)}
              tickLeft={formatWholeCurrency(FIXED_COST_MIN)}
              tickRight={formatWholeCurrency(FIXED_COST_MAX)}
              accent="accent-[#0891b2]"
            />
            <InputSlider
              id="selling-price-slider"
              label="Selling price per bottle"
              value={sellingPrice}
              onChange={setSellingPrice}
              min={SELLING_PRICE_MIN}
              max={SELLING_PRICE_MAX}
              step={0.05}
              displayValue={formatCurrency(sellingPrice)}
              tickLeft={formatCurrency(SELLING_PRICE_MIN)}
              tickRight={formatCurrency(SELLING_PRICE_MAX)}
              accent="accent-[#0f62fe]"
            />
            <InputSlider
              id="variable-cost-slider"
              label="Variable cost per bottle"
              value={variableCost}
              onChange={setVariableCost}
              min={VARIABLE_COST_MIN}
              max={VARIABLE_COST_MAX}
              step={0.05}
              displayValue={formatCurrency(variableCost)}
              tickLeft={formatCurrency(VARIABLE_COST_MIN)}
              tickRight={formatCurrency(VARIABLE_COST_MAX)}
              accent="accent-[#f59e0b]"
            />
            <InputSlider
              id="forecast-slider"
              label="Forecast sales"
              value={forecastSales}
              onChange={setForecastSales}
              min={FORECAST_MIN}
              max={FORECAST_MAX}
              step={5000}
              displayValue={`${formatNumber(forecastSales)} bottles`}
              tickLeft={formatNumber(FORECAST_MIN)}
              tickRight={formatNumber(FORECAST_MAX)}
              accent="accent-[#334155]"
            />
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] max-[1500px]:rounded-none max-[1500px]:border-x-0 max-[1500px]:shadow-none max-sm:p-[18px]">
          {!calculations.validContribution ? (
            <div className="rounded-[20px] border border-[rgba(245,158,11,0.24)] bg-[rgba(255,247,237,0.92)] px-5 py-4 text-[0.95rem] leading-[1.6] text-amber-900">
              The selling price must be higher than the variable cost per bottle. Otherwise each sale fails to contribute towards fixed costs, so a break-even point cannot be calculated.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fcfdff_0%,#f6f9fd_100%)] p-4">
                <div className="mb-3">
                  <h3 className="m-0 text-[1.1rem] font-bold tracking-[-0.02em] text-slate-900">
                    Revenue and total cost at different output levels
                  </h3>
                  <p className="mt-1 text-[0.92rem] leading-[1.5] text-slate-500">
                    Break-even happens where the revenue line and the total cost line meet. To the left of that point the business makes a loss; to the right it moves into profit.
                  </p>
                </div>

                <div className="h-[320px]" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 6 }}>
                      <CartesianGrid stroke="#dbe4ee" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="units"
                        type="number"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#cbd5e1" }}
                        tickFormatter={(value) => formatNumber(value)}
                        label={{ value: "Bottles sold", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `£${Math.round(value / 1000)}k`}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#cbd5e1" }}
                        width={58}
                      />
                      <Tooltip
                        formatter={(value) => formatWholeCurrency(value)}
                        labelFormatter={(value) => `${formatNumber(value)} bottles`}
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid rgba(15,23,42,0.08)",
                          boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
                        }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ bottom: -8 }} />
                      <ReferenceLine
                        y={fixedCosts}
                        stroke="#0891b2"
                        strokeDasharray="5 5"
                        label={{ value: "Fixed costs", fill: "#0891b2", position: "insideTopRight", fontSize: 12 }}
                      />
                      <ReferenceLine
                        x={calculations.breakEvenUnits}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        label={<RightSideReferenceLabel value="Break-even" fill="#b45309" y={46} />}
                      />
                      <ReferenceLine
                        x={forecastSales}
                        stroke="#334155"
                        strokeDasharray="4 4"
                        label={{ value: "Forecast", fill: "#334155", position: "insideTopLeft", fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0f62fe" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="totalCosts" name="Total costs" stroke="#334155" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="sr-only" aria-live="polite">
                  The graph table below gives the key points for screen reader users. At zero bottles, revenue is {formatWholeCurrency(0)} and total costs are {formatWholeCurrency(fixedCosts)}. At the break-even point of {formatNumber(calculations.breakEvenUnits)} bottles, revenue and total costs are both about {formatWholeCurrency(calculations.breakEvenRevenue)}. At forecast sales of {formatNumber(forecastSales)} bottles, revenue is {formatWholeCurrency(forecastSales * sellingPrice)} and total costs are {formatWholeCurrency(fixedCosts + forecastSales * variableCost)}.
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <caption className="sr-only">
                      Worked example showing the main break-even figures.
                    </caption>
                    <thead>
                      <tr className="text-left text-[0.78rem] uppercase tracking-[0.08em] text-slate-500">
                        <th className="px-3 py-1 font-semibold">Step</th>
                        <th className="px-3 py-1 font-semibold">Calculation</th>
                        <th className="px-3 py-1 font-semibold">Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                        <td className="rounded-l-[14px] px-3 py-2 text-[0.92rem] font-semibold text-slate-900">1</td>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                          {formatCurrency(sellingPrice)} - {formatCurrency(variableCost)}
                        </td>
                        <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">
                          Contribution per unit = {formatCurrency(calculations.contributionPerUnit)}
                        </td>
                      </tr>
                      <tr className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                        <td className="rounded-l-[14px] px-3 py-2 text-[0.92rem] font-semibold text-slate-900">2</td>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                          {formatWholeCurrency(fixedCosts)} / {formatCurrency(calculations.contributionPerUnit)}
                        </td>
                        <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">
                          Break-even point = {formatNumber(calculations.breakEvenUnits)} bottles
                        </td>
                      </tr>
                      <tr className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                        <td className="rounded-l-[14px] px-3 py-2 text-[0.92rem] font-semibold text-slate-900">3</td>
                        <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                          {formatNumber(forecastSales)} - {formatNumber(calculations.breakEvenUnits)}
                        </td>
                        <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">
                          Margin of safety = {formatNumber(calculations.marginOfSafetyUnits)} bottles
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <caption className="text-left text-[0.9rem] font-semibold text-slate-700">
                      Graph key points table
                    </caption>
                    <thead>
                      <tr className="text-left text-[0.78rem] uppercase tracking-[0.08em] text-slate-500">
                        <th className="px-3 py-1 font-semibold">Point</th>
                        <th className="px-3 py-1 font-semibold">Output</th>
                        <th className="px-3 py-1 font-semibold">Revenue</th>
                        <th className="px-3 py-1 font-semibold">Total costs</th>
                        <th className="px-3 py-1 font-semibold">Profit or loss</th>
                        <th className="px-3 py-1 font-semibold">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {graphKeyPoints.map((point) => (
                        <tr key={point.label} className="rounded-[14px] bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                          <td className="rounded-l-[14px] px-3 py-2 text-[0.92rem] font-semibold text-slate-900">
                            {point.label}
                          </td>
                          <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                            {formatNumber(point.units)} bottles
                          </td>
                          <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                            {formatWholeCurrency(point.revenue)}
                          </td>
                          <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                            {formatWholeCurrency(point.totalCosts)}
                          </td>
                          <td className="px-3 py-2 text-[0.92rem] text-slate-700">
                            {formatSignedCurrency(point.profit)}
                          </td>
                          <td className="rounded-r-[14px] px-3 py-2 text-[0.92rem] text-slate-700">
                            {point.outcome}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                {scenarioCards.map((card) => (
                  <ResultCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    helper={card.helper}
                    tone={card.tone}
                  />
                ))}
                <ResultCard
                  label="Margin of safety percentage"
                  value={formatPercent(calculations.marginOfSafetyPercent)}
                  helper="How far forecast sales could fall before losses begin"
                  tone={calculations.marginOfSafetyPercent >= 0 ? "cyan" : "amber"}
                />
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
