"use client";

import { useState, useRef, useEffect } from "react";

// ─── Formatting ───
const fmt = (n) => `£${Math.abs(n).toLocaleString("en-GB")}`;

// ─── Challenge Data ───

const CHALLENGES = [
  {
    id: "p1",
    event: "Supplier prices rose 15%",
    context: "A retailer's main supplier increases raw material prices by 15%. The company does not change its own selling prices or any other costs.",
    data: { revenue: 600000, cogs: 240000, selling: 60000, admin: 80000, depreciation: 20000, finance: 15000, taxRate: 0.25 },
    layers: [
      { id: "revenue", label: "Revenue", affected: false, explanation: "Revenue depends on sales volume and selling price — neither changed." },
      { id: "cogs", label: "Cost of Goods Sold", affected: true, explanation: "COGS will rise because raw material costs are a direct production cost." },
      { id: "gross", label: "Gross Profit", affected: true, explanation: "Gross Profit = Revenue − COGS. If COGS rises and Revenue stays flat, Gross Profit falls." },
      { id: "selling", label: "Selling & Marketing", affected: false, explanation: "Marketing and sales costs are unrelated to supplier pricing." },
      { id: "admin", label: "General & Admin", affected: false, explanation: "Office overheads don't change because a supplier raised prices." },
      { id: "depr", label: "Depreciation", affected: false, explanation: "Depreciation depends on asset values and useful life, not supplier costs." },
      { id: "operating", label: "Operating Profit", affected: true, explanation: "Operating Profit = Gross Profit − OPEX. The Gross Profit decline flows down even though OPEX is unchanged." },
      { id: "finance", label: "Finance Costs", affected: false, explanation: "Interest payments depend on the company's debt, not its supplier costs." },
      { id: "tax", label: "Tax", affected: true, explanation: "Tax is calculated on taxable profit — if profit before tax falls, the tax amount falls too." },
      { id: "net", label: "Net Profit", affected: true, explanation: "Net Profit inherits the full impact. Every layer below the affected line carries the hit through to the bottom." },
    ],
  },
  {
    id: "p2",
    event: "Major new advertising campaign launched",
    context: "The company launches an expensive new marketing campaign. Sales haven't changed yet — the campaign just started. No other costs are affected.",
    data: { revenue: 900000, cogs: 360000, selling: 80000, admin: 100000, depreciation: 30000, finance: 20000, taxRate: 0.25 },
    layers: [
      { id: "revenue", label: "Revenue", affected: false, explanation: "Revenue hasn't changed yet — the campaign only just launched." },
      { id: "cogs", label: "Cost of Goods Sold", affected: false, explanation: "COGS relates to production costs, not marketing spend." },
      { id: "gross", label: "Gross Profit", affected: false, explanation: "Since neither Revenue nor COGS changed, Gross Profit is unaffected. This is a key insight — marketing spend doesn't touch production efficiency." },
      { id: "selling", label: "Selling & Marketing", affected: true, explanation: "The advertising campaign sits squarely in Selling & Marketing — this is the specific OPEX line that's hit." },
      { id: "admin", label: "General & Admin", affected: false, explanation: "Admin overheads are unrelated to the marketing campaign." },
      { id: "depr", label: "Depreciation", affected: false, explanation: "Asset depreciation doesn't change because of a marketing campaign." },
      { id: "operating", label: "Operating Profit", affected: true, explanation: "Higher OPEX (specifically S&M) means lower Operating Profit, even though Gross Profit is untouched." },
      { id: "finance", label: "Finance Costs", affected: false, explanation: "Debt payments are unrelated to the marketing campaign." },
      { id: "tax", label: "Tax", affected: true, explanation: "Lower profit before tax means a lower tax charge." },
      { id: "net", label: "Net Profit", affected: true, explanation: "The S&M increase flows through Operating Profit and reduces Net Profit." },
    ],
  },
  {
    id: "p3",
    event: "Company refinances debt at a higher interest rate",
    context: "The company's bank loan is refinanced at a significantly higher interest rate. Operations, pricing and costs are all unchanged.",
    data: { revenue: 1500000, cogs: 750000, selling: 100000, admin: 150000, depreciation: 60000, finance: 30000, taxRate: 0.25 },
    layers: [
      { id: "revenue", label: "Revenue", affected: false, explanation: "Financing decisions don't affect sales." },
      { id: "cogs", label: "Cost of Goods Sold", affected: false, explanation: "Production costs are unchanged." },
      { id: "gross", label: "Gross Profit", affected: false, explanation: "Unaffected — this is purely about production economics." },
      { id: "selling", label: "Selling & Marketing", affected: false, explanation: "Marketing costs have nothing to do with the company's debt structure." },
      { id: "admin", label: "General & Admin", affected: false, explanation: "Admin overheads are unrelated to financing." },
      { id: "depr", label: "Depreciation", affected: false, explanation: "Asset depreciation is unchanged by refinancing." },
      { id: "operating", label: "Operating Profit", affected: false, explanation: "This is exactly why Operating Profit is used for cross-industry comparison — it excludes financing decisions. A change in interest rates doesn't touch it." },
      { id: "finance", label: "Finance Costs", affected: true, explanation: "Higher interest rate means higher finance costs — this is the only line directly hit." },
      { id: "tax", label: "Tax", affected: true, explanation: "Higher finance costs reduce profit before tax, so the tax charge also falls." },
      { id: "net", label: "Net Profit", affected: true, explanation: "Net Profit falls because finance costs increased, but every line above is untouched. The operational story is unchanged — only the financing story changed." },
    ],
  },
];

// ─── Predict Challenge Component ───

function PredictChallenge({ challenge, onComplete }) {
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => {
    if (submitted) return;
    setSelections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const data = challenge.data;
  const gp = data.revenue - data.cogs;
  const totalOpex = data.selling + data.admin + data.depreciation;
  const op = gp - totalOpex;
  const pbt = op - data.finance;
  const tax = Math.round(pbt * data.taxRate);
  const net = pbt - tax;

  const statementLines = [
    { key: "revenue", label: "Revenue", value: data.revenue, bold: true },
    { key: "cogs", label: "Cost of Goods Sold", value: -data.cogs },
    { key: "gross", label: "Gross Profit", value: gp, bold: true, sub: true },
    { key: "opex_header", label: "Operating Expenses", header: true },
    { key: "selling", label: "Selling & Marketing", value: -data.selling, indent: true },
    { key: "admin", label: "General & Admin", value: -data.admin, indent: true },
    { key: "depr", label: "Depreciation", value: -data.depreciation, indent: true },
    { key: "operating", label: "Operating Profit", value: op, bold: true, sub: true },
    { key: "finance", label: "Finance Costs", value: -data.finance },
    { key: "tax", label: "Tax", value: -tax },
    { key: "net", label: "Net Profit", value: net, bold: true, final: true },
  ];

  const layerMap = {};
  challenge.layers.forEach((l) => { layerMap[l.id] = l; });
  const selectableKeys = new Set(challenge.layers.map((l) => l.id));

  const results = challenge.layers.map((l) => ({
    ...l,
    chosen: !!selections[l.id],
    isCorrect: !!selections[l.id] === l.affected,
  }));
  const resultMap = {};
  results.forEach((r) => { resultMap[r.id] = r; });

  const score = results.filter((r) => r.isCorrect).length;
  const allCorrect = score === challenge.layers.length;
  const selectedCount = Object.values(selections).filter(Boolean).length;

  return (
    <div>
      <div style={{
        padding: "18px 22px", borderRadius: 12, marginBottom: 18,
        background: "linear-gradient(135deg, #1a3a5c, #2a5a8c)", color: "#fff",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 4 }}>
          Business Event
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 6 }}>
          {challenge.event}
        </div>
        <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.55 }}>{challenge.context}</div>
      </div>

      {!submitted && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 14,
          background: "#f7f5f0", border: "1px solid #e8e3da",
          fontSize: 13, color: "#5a5347", lineHeight: 1.5,
        }}>
          👆 Click on each row in the statement below to mark it as <strong style={{ color: "#c9a96e" }}>affected</strong> by this event. Click again to deselect.
          <span style={{ color: "#8a7e6b", marginLeft: 4 }}>({selectedCount} selected)</span>
        </div>
      )}

      <div style={{ borderRadius: 12, border: "1px solid #ddd8d0", overflow: "hidden", marginBottom: 20 }}>
        {statementLines.map((line, i) => {
          if (line.header) {
            return (
              <div key={line.key} style={{
                padding: "7px 14px", background: "#f7f5f0", fontSize: 11,
                fontWeight: 600, color: "#8a7e6b", textTransform: "uppercase", letterSpacing: "0.06em",
                borderTop: "1px solid #e8e3da",
              }}>{line.label}</div>
            );
          }

          const isSelectable = selectableKeys.has(line.key);
          const isSelected = !!selections[line.key];
          const layer = layerMap[line.key];
          const result = submitted && layer ? resultMap[line.key] : null;
          const isFinal = line.final;

          let bg = "#fff";
          let leftAccent = "transparent";

          if (!submitted) {
            if (isSelectable && isSelected) {
              bg = isFinal ? "#2a4a6c" : "#fef6e8";
              leftAccent = "#c9a96e";
            } else if (isFinal) {
              bg = "#1a3a5c";
            }
          } else if (result) {
            bg = result.isCorrect ? "#f5faf4" : "#fef5f5";
            leftAccent = result.isCorrect ? "#5a8a54" : "#b84a4a";
            if (isFinal) bg = result.isCorrect ? "#1a4a3c" : "#4a1a1a";
          } else if (isFinal) {
            bg = "#1a3a5c";
          }

          return (
            <div key={line.key}>
              <div
                onClick={() => isSelectable && !submitted && toggle(line.key)}
                role={isSelectable && !submitted ? "button" : undefined}
                tabIndex={isSelectable && !submitted ? 0 : undefined}
                aria-pressed={isSelectable ? isSelected : undefined}
                aria-label={isSelectable ? `${line.label}: ${isSelected ? "marked as affected" : "not marked"}` : undefined}
                onKeyDown={(e) => { if (isSelectable && !submitted && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(line.key); } }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: `${line.sub || isFinal ? 10 : 8}px 14px`,
                  paddingLeft: line.indent ? 32 : 14,
                  borderTop: line.sub || isFinal ? "2px solid #1a3a5c" : i > 0 && !statementLines[i - 1]?.header ? "1px solid #f0ece5" : "none",
                  background: bg,
                  cursor: isSelectable && !submitted ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  borderLeft: `4px solid ${leftAccent}`,
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontWeight: line.bold ? 700 : 400,
                    fontSize: line.bold ? 14 : 13,
                    color: isFinal ? "#fff" : "#1a3a5c",
                    fontFamily: line.bold ? "'DM Serif Display', Georgia, serif" : "inherit",
                  }}>{line.label}</span>

                  {!submitted && isSelectable && isSelected && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                      background: "#c9a96e", color: "#fff", flexShrink: 0,
                    }}>AFFECTED</span>
                  )}

                  {submitted && result && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: result.chosen ? "#c9a96e" : "#e8e3da",
                        color: result.chosen ? "#fff" : "#5a5347",
                        textDecoration: !result.isCorrect ? "line-through" : "none",
                        opacity: !result.isCorrect ? 0.65 : 1,
                      }}>
                        You: {result.chosen ? "Affected" : "Not affected"}
                      </span>
                      {!result.isCorrect && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                          background: layer.affected ? "#5a8a54" : "#1a3a5c",
                          color: "#fff",
                        }}>
                          → {layer.affected ? "Affected" : "Not affected"}
                        </span>
                      )}
                      <span style={{ fontSize: 13, flexShrink: 0 }}>{result.isCorrect ? "✅" : "❌"}</span>
                    </div>
                  )}
                </div>

                {line.value !== undefined && (
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontWeight: line.bold ? 700 : 400,
                    fontSize: line.bold ? 14 : 13, flexShrink: 0,
                    color: isFinal ? "#fff" : line.value < 0 ? "#a04040" : "#2c6e49",
                  }}>{fmt(line.value)}</span>
                )}
              </div>

              {submitted && layer && (
                <div style={{
                  padding: "8px 14px 10px 18px", fontSize: 12, lineHeight: 1.55,
                  color: "#5a5347",
                  background: result.isCorrect ? "#f0f7ef" : "#fdf4f4",
                  borderTop: "1px dashed #e8e3da",
                  borderLeft: `4px solid ${result.isCorrect ? "#5a8a54" : "#b84a4a"}`,
                }}>
                  {layer.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {!submitted ? (
          <button onClick={() => setSubmitted(true)} style={{
            padding: "12px 28px", borderRadius: 10, border: "none",
            background: "#1a3a5c", color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>Check Predictions</button>
        ) : (
          <>
            <div style={{
              padding: "8px 16px", borderRadius: 8,
              background: allCorrect ? "#eef4ed" : "#fef9f0",
              border: `1px solid ${allCorrect ? "#b8d4b2" : "#e8d4a0"}`,
              fontSize: 13, fontWeight: 600,
              color: allCorrect ? "#2c6e49" : "#8a6e2e",
            }}>
              {score}/{challenge.layers.length} correct
            </div>
            <button onClick={() => onComplete(score)} style={{
              padding: "10px 22px", borderRadius: 8, border: "none",
              background: "#1a3a5c", color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Next Challenge →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ───

export default function IncomeStatementDetective() {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalQs, setTotalQs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const topRef = useRef(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const current = CHALLENGES[challengeIdx];

  const handleComplete = (score) => {
    setTotalScore(totalScore + score);
    setTotalQs(totalQs + current.layers.length);
    const newCompleted = new Set(completed);
    newCompleted.add(challengeIdx);
    setCompleted(newCompleted);

    if (newCompleted.size === CHALLENGES.length) {
      setFinished(true);
    } else {
      let next = (challengeIdx + 1) % CHALLENGES.length;
      while (newCompleted.has(next) && next !== challengeIdx) {
        next = (next + 1) % CHALLENGES.length;
      }
      setChallengeIdx(next);
      scrollTop();
    }
  };

  const restart = () => {
    setChallengeIdx(0);
    setTotalScore(0);
    setTotalQs(0);
    setFinished(false);
    setCompleted(new Set());
    scrollTop();
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f4f1eb",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: "#2c2c2c",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Source+Serif+4:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        button { font-family:inherit; }
      `}</style>

      <div ref={topRef} />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f2338 0%, #1a3a5c 40%, #2a5a8c 100%)",
        padding: "32px 24px 24px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 80%, rgba(201,169,110,0.1) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 6 }}>
            Session 3.1.4 · Interactive Exercise
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Predict the Impact
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6, maxWidth: 520, margin: "6px auto 0" }}>
            A business event occurs. Click on the income statement rows you think are affected — then see if the impact cascades the way you predicted.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Challenge Selector */}
        {!finished && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#8a7e6b" }}>Select a scenario</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a3a5c" }}>
                Score: {totalScore}/{totalQs}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CHALLENGES.map((c, i) => {
                const isActive = i === challengeIdx;
                const isDone = completed.has(i);
                return (
                  <button key={c.id} onClick={() => setChallengeIdx(i)}
                    style={{
                      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: isActive ? "2px solid #1a3a5c" : "2px solid #e2ddd5",
                      background: isActive ? "#1a3a5c" : isDone ? "#eef4ed" : "#fff",
                      color: isActive ? "#fff" : isDone ? "#5a8a54" : "#5a5347",
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                    {isDone && !isActive && <span style={{ fontSize: 12 }}>✓</span>}
                    {c.event}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge */}
        {!finished && current && (
          <div style={{ animation: "fadeUp 0.4s ease" }} key={current.id}>
            <PredictChallenge challenge={current} onComplete={handleComplete} />
          </div>
        )}

        {/* Finished */}
        {finished && (
          <div style={{ textAlign: "center", padding: "48px 20px", animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontSize: 28, fontWeight: 400, fontFamily: "'DM Serif Display', Georgia, serif", color: "#1a3a5c", marginBottom: 12 }}>
              All Scenarios Complete
            </h2>
            <div style={{
              display: "inline-block", padding: "12px 24px", borderRadius: 12,
              background: "#1a3a5c", color: "#fff", fontSize: 20, fontWeight: 700,
              fontFamily: "'DM Mono', monospace", marginBottom: 20,
            }}>
              {totalScore} / {totalQs}
            </div>
            <p style={{ fontSize: 15, color: "#5a5347", maxWidth: 500, margin: "0 auto 8px", lineHeight: 1.6 }}>
              The income statement is a layered story. Each event enters at a specific point — and its impact cascades downward, but never upward. That's why we calculate profit in stages: each line is a diagnostic checkpoint.
            </p>
            <div style={{
              padding: "16px 20px", borderRadius: 10, maxWidth: 420, margin: "20px auto",
              background: "#f7f5f0", border: "1px solid #e8e3da", textAlign: "left",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#8a7e6b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Key takeaway</div>
              <div style={{ fontSize: 14, color: "#3a3530", lineHeight: 1.6 }}>
                <strong style={{ color: "#1a3a5c" }}>Gross Profit</strong> — How efficiently can you produce your product?<br />
                <strong style={{ color: "#1a3a5c" }}>Operating Profit</strong> — How well is the core business being run?<br />
                <strong style={{ color: "#1a3a5c" }}>Net Profit</strong> — What is left for shareholders after all obligations?
              </div>
            </div>
            <button onClick={restart} style={{
              padding: "12px 28px", borderRadius: 10, border: "none", marginTop: 16,
              background: "#1a3a5c", color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}