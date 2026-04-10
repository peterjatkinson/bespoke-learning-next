"use client";

import { useEffect } from "react";

const htmlContent = String.raw`
<aside class="sidebar">
  <div class="sidebar-header">
    <div class="course-label">Imperial College Business School</div>
    <div class="course-title">Accounting Primer</div>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section">
      <div class="nav-module active-module">
        Session 1: Financial Reporting
        <span class="pill pill-active">Active</span>
      </div>
      <div class="nav-item" onclick="showPage('s1-1')" id="nav-s1-1">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.1 Introduction
      </div>
      <div class="nav-item" onclick="showPage('s1-2')" id="nav-s1-2">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.2 Objectives of financial information
      </div>
      <div class="nav-item" onclick="showPage('s1-3')" id="nav-s1-3">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7zm0 6h2v2H7z"/></svg>
        1.3 Main financial statements
      </div>
      <div class="nav-item" onclick="showPage('s1-4')" id="nav-s1-4">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.4 Annual reports
      </div>
      <div class="nav-item" onclick="showPage('s1-4-1')" id="nav-s1-4-1" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M14 3H2v2h5v8h2V5h5V3z"/></svg>
        1.4.1 Exploring an annual report
      </div>
      <div class="nav-item" onclick="showPage('s1-5')" id="nav-s1-5">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7zm0 6h2v2H7z"/></svg>
        1.5 Session review
      </div>
    </div>

    <div class="nav-section" style="opacity:0.4">
      <div class="nav-module nav-locked">Session 2: Balance sheet</div>
      <div class="nav-module nav-locked">Session 3: Income statement</div>
      <div class="nav-module nav-locked">Session 4: Cash flows</div>
      <div class="nav-module nav-locked">Session 5: Sustainability</div>
      <div class="nav-module nav-locked">Session 6: Short-term decision-making</div>
      <div class="nav-module nav-locked">Session 7: Long-term decision-making</div>
    </div>
  </nav>
</aside>

<main class="main">
  <div class="topbar">
    <div class="breadcrumb">Accounting Primer &rsaquo; <span id="breadcrumb-text">1.1 Introduction</span></div>
  </div>

  <div class="content-area">
    <div class="page active" id="page-s1-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 1 · Financial Reporting</div>
        <h1 class="page-title">1.1 Introduction</h1>
      </div>
      <div class="page-body">
        <p>Welcome to session one! In this session, you'll be introduced to the world of financial reporting. You'll learn about the three core financial statements that businesses and other stakeholders rely on, and what to expect when you open an annual report.</p>
        <p>Now watch the following presentation where your AI facilitator, Laila, will explain what you can expect from this session.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Session introduction</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Please take the time to review the learning outcomes for this session below.</p>

        <div class="lo-box">
          <h2>Learning outcomes</h2>
          <h5>By the end of this session, you will be able to:</h5>
          <ul>
            <li>Identify the role of reporting frameworks in ensuring financial transparency and comparability</li>
            <li>Distinguish between the functions of the balance sheet, income statement and cash flow statement</li>
            <li>Describe the main sections of an annual report</li>
          </ul>
        </div>

        <p>In the next activity, you'll learn about some of the overarching objectives of financial information.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn primary" onclick="showPage('s1-2')">Next: 1.2 Objectives →</button>
      </div>
    </div>

    <div class="page" id="page-s1-2">
      <div class="page-header">
        <div class="page-eyebrow">Session 1 · Financial Reporting</div>
        <h1 class="page-title">1.2 Objectives of general-purpose financial information</h1>
      </div>
      <div class="page-body">
        <p>Before we introduce some of the main financial statements you might encounter, let's first consider the question of what financial information is actually for, and who is it for. In the following presentation, we'll address those questions and introduce two of the main frameworks that that govern how companies report their financials.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Objectives of general-purpose financial information</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>To get a sense of which frameworks are predominantly used in the countries and regions that you live and work in, complete the <mark style="background:#fbeeb8">poll/map exercise below.</mark></p>

        <div class="quiz-header">
          <h2>Activity</h2>
        </div>
        <div class="quiz-body" style="border-top:3px solid var(--gold)">
          <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
            <strong>Provisional</strong> — To be added if Rakel is OK with this suggestion; and if the map option, only if the tool we're going to use for this in Canvas is approved in time.
          </div>
          <p style="color:var(--ink-soft);font-size:0.93rem">Students are asked to share their location on a a map and indicate on their pin which framework is used in their country</p>
        </div>

        <p>In the next activity, you'll be introduced to the three main financial statements you should become familiar with.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s1-1')">← 1.1 Introduction</button>
        <button class="nav-btn primary" onclick="showPage('s1-3')">Next: 1.3 Main financial statements →</button>
      </div>
    </div>

    <div class="page" id="page-s1-3">
      <div class="page-header">
        <div class="page-eyebrow">Session 1 · Financial Reporting</div>
        <h1 class="page-title">1.3 Main financial statements</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>In the next presentation, Laila will provide an overview of what's covered in the three main financial statements: the <strong>balance sheet</strong>, the <strong>income statement</strong> and the <strong>cash flow statement.</strong></p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">The three main financial statements</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Based on what you've just learned, try to compelte the exercise below which should help you think through how different kinds of transactions impact different parts of the key finanical statements.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Below is a list of four transactions conducted by the fictional SouthKen Bakery:</p>
            <ul>
              <li>Transaction 1. SouthKen Bakery purchases £2,000 worth of flour and sugar on credit (i.e. not yet paid)</li>
              <li>Transaction 2. The bakery sells 500 loaves for £1,500 cash</li>
              <li>Transaction 3. The bakery pays £800 cash for the monthly electricity bill</li>
              <li>Transaction 4. The bakery buys a delivery van for £12,000 financed by a loan</li>
            </ul>
            <p>For each transaction, identify:</p>
            <ul>
              <li>Which of the three main financial statements will be affected (there may be more than one)</li>
              <li>Which section within each statement is affected</li>
              <li>Whether the effect is an increase or a decrease</li>
            </ul>
            <p>Copy and paste the template table provided below into your own answer and fill it in for each transaction. The first row has been completed for you as an example.</p>
            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Balance sheet (assets / liabilities / equity)</th>
                  <th>Income statement (revenue / expense)</th>
                  <th>Cash flow statement (operating / investing / financing)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. Purchase £2,000 of flour and sugar on credit</strong></td>
                  <td>Assets ↑ £2,000; Liabilities ↑ £2,000</td>
                  <td>No effect</td>
                  <td>No effect</td>
                </tr>
                <tr><td><strong>2. Sell 500 loaves for £1,500 cash</strong></td><td></td><td></td><td></td></tr>
                <tr><td><strong>3. Pay £800 cash for the monthly electricity bill</strong></td><td></td><td></td><td></td></tr>
                <tr><td><strong>4. Buy a delivery van for £12,000 financed by a loan</strong></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
            <p>Keep these two rules in mind as you work:</p>
            <ul>
              <li>Assets must always equal liabilities plus equity, no matter how any transactions have taken place</li>
              <li>Whatever net income the income statement (revenue minus expenses) produces flows directly into retained earnings on the balance sheet.</li>
            </ul>
            <p>The full answers will be provided in the feedback, once you've submitted your own.</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here, or use the table structure above as a guide…" rows="6"></textarea>
          <div class="feedback-box" id="fb-1-3">
            <div class="fb-label">✓ Model answer</div>
            <div class="fb-content">
              <table>
                <thead><tr><th>Transaction</th><th>Balance sheet (assets / liabilities / equity)</th><th>Income statement (revenue / expense)</th><th>Cash flow statement (operating / investing / financing)</th></tr></thead>
                <tbody>
                  <tr><td><strong>1. Purchase £2,000 of flour and sugar on credit</strong></td><td>Assets ↑ £2,000; Liabilities ↑ £2,000</td><td>No effect</td><td>No effect</td></tr>
                  <tr><td><strong>2. Sell 500 loaves for £1,500 cash</strong></td><td>Assets ↑ £1,500; Equity ↑ £1,500</td><td>Revenue ↑ £1,500</td><td>Operating ↑ £1,500</td></tr>
                  <tr><td><strong>3. Pay £800 cash for the monthly electricity bill</strong></td><td>Assets ↓ £800; Equity ↓ £800</td><td>Expense ↑ £800</td><td>Operating ↓ £800</td></tr>
                  <tr><td><strong>4. Buy a delivery van for £12,000 financed by a loan</strong></td><td>Assets ↑ £12,000; Liabilities ↑ £12,000</td><td>No effect</td><td>Investing ↓ £12,000; Financing ↑ £12,000</td></tr>
                </tbody>
              </table>
              <p>Don't worry if you didn't get everything right, that's exactly why you're doing this primer. The three financial statements are genuinely tricky at first, and the most common confusion (mixing up cash flow sections, or wondering why the income statement doesn't react when you buy an asset) trips up even experienced learners.</p>
              <p>In subsequent sessions of this primer, we will take a closer look into each financial statements and its components.</p>
              <p>Before we move on, here's an important point to remember: the three statements are not separate documents. They are three different perspectives on the same business reality, and they interact with each other constantly.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-1-3', this)">Submit &amp; see feedback</button>
      </div>

      <div class="text-block">
        <p>It's also important to know that the three statements you've heard about don't sit in isolation. They're also accompanied by notes that provide further detail and the context behind the numbers. In the following presentation, we'll look at what these notes contain and why they're important.</p>

        <div class="video-placeholder" style="margin: 1rem 0 0">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Notes to the financial statements</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>
        <p style="margin-top:1rem">In the next activity, we'll examine the role of annual reports.</p>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s1-2')">← 1.2 Objectives</button>
        <button class="nav-btn primary" onclick="showPage('s1-4')">Next: 1.4 Annual reports →</button>
      </div>
    </div>

    <div class="page" id="page-s1-4">
      <div class="page-header">
        <div class="page-eyebrow">Session 1 · Financial Reporting</div>
        <h1 class="page-title">1.4 Annual reports</h1>
      </div>
      <div class="page-body">
        <p>Now that you're familiar with the three main financial statements and their notes, let's look at where all of this information comes together. In the following presentation, we'll explore the structure of an <strong>annual report</strong> and what each section is designed to tell you.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Annual report</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>As you have learned, annual financial statements are typically a key part of an annual report. However, as the name suggests, these reports are only published once a year, and users of financial statements need information in between these long intervals. To meet that need, many regulators specify that particular entities must produce interim financial reports, and they specify the frequency with which those interim financial reports need to be prepared.</p>

        <div class="info-box">
          <h2>Interim reports</h2>
          <p><strong>Interim reports</strong> are often less detailed and less heavily audited than annual financial statements. In many cases, the numbers are reviewed by auditors rather than fully audited. This means they still provide useful information, but users should remember they may not have the same level of verification as year-end financial statements.</p>
          <p>Interim reports usually include comparisons with previous periods. For example, a half-year report might show results for the first six months of the current year alongside the same period from the previous year. This helps users see whether performance is improving or declining.</p>
          <p>Another reason interim reporting matters is that many businesses experience seasonal patterns. Retailers, for example, often generate a large portion of their sales during the holiday season. Interim reports help users see how performance changes throughout the year rather than relying only on the final annual figures.</p>
          <p>In short, interim reports act as regular updates, helping users stay informed about a company's financial performance between annual reporting cycles.</p>
        </div>

        <p>In the next activity, you'll choose a company and explore its annual report for yourself.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s1-3')">← 1.3 Financial statements</button>
        <button class="nav-btn primary" onclick="showPage('s1-4-1')">Next: 1.4.1 Exploring an annual report →</button>
      </div>
    </div>

    <div class="page" id="page-s1-4-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 1 · Financial Reporting</div>
        <h1 class="page-title">1.4.1 Exploring an annual report</h1>
      </div>
      <div class="page-body">
        <div class="discussion-header">
          <div class="discussion-header-icon">💬</div>
          <h2>Discussion</h2>
        </div>
        <div class="quiz-body discussion-body-box">
          <p style="color:var(--ink-soft);font-size:0.93rem">Find the annual report of a company you genuinely like or use. Most publicly listed companies publish their annual reports on their websites (sometimes under an 'Investors' or 'Investor Relations' section).</p>
          <p style="color:var(--ink-soft);font-size:0.93rem">In your chosen annual report, try to locate the sections listed below and answer these questions:</p>
          <ul style="margin:0.5rem 0 0.75rem 1.4rem;color:var(--ink-soft);font-size:0.93rem">
            <li>Letter to Shareholders: What does the CEO identify as the main challenge of the year?</li>
            <li>Auditor's Report: Is the opinion qualified or unqualified?</li>
            <li>Financial Statements: Do they cover more than one year, and which three statements can you find?</li>
            <li>Business Overview/Management Discussion: what reason does management give for a change in performance?</li>
            <li>ESG section: Is there one at all, and if so what sort of commitments does the company make?</li>
          </ul>
          <p style="color:var(--ink-soft);font-size:0.93rem">Note that some US companies' sometimes use a form called a '10-K' as their annual report, and not all annual reports will always include all of the same sections with the same headings that were outlined in the presentation in the previous page.</p>
          <p style="color:var(--ink-soft);font-size:0.93rem">Share your findings with your cohort below. <em>(Discussion forum — available on Canvas)</em></p>
        </div>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s1-4')">← 1.4 Annual reports</button>
        <button class="nav-btn primary" onclick="showPage('s1-5')">Next: 1.5 Session review →</button>
      </div>
    </div>

    <div class="page" id="page-s1-5">
      <div class="page-header">
        <div class="page-eyebrow">Session 1 · Financial Reporting</div>
        <h1 class="page-title">1.5 Session review</h1>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <p style="font-size:0.88rem;color:var(--ink-soft);margin-bottom:1.5rem">For each learning outcome from this session, select the option that best describes where you are right now.</p>

        <div class="self-review">
          <div class="self-review-header">
            <div>Learning outcome</div>
            <div style="text-align:center">Confident</div>
            <div style="text-align:center">Need to review</div>
            <div style="text-align:center">Need support</div>
          </div>
          <div class="self-review-row">
            <div>Identify the role of reporting frameworks in ensuring financial transparency and comparability</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Distinguish between the functions of the balance sheet, income statement and cash flow statement</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Describe the main sections of an annual report</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
        </div>

        <div class="q-block" style="margin-top:1.5rem">
          <div class="q-number">Timing feedback</div>
          <div class="q-text"><p>Was the estimated timing accurate for this session?</p></div>
          <div class="mcq-options" id="mcq-timing">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-timing')">
              <div class="mcq-radio"></div>
              It took less time to complete the tasks and exercises than estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-timing')">
              <div class="mcq-radio"></div>
              It took about the same amount of time to complete the tasks and exercises as estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-timing')">
              <div class="mcq-radio"></div>
              It took more time to complete the tasks and exercises than estimated
            </div>
          </div>
        </div>

        <div class="q-block">
          <div class="q-number">Open feedback</div>
          <div class="q-text"><p>Please provide any feedback on the content covered in this session.</p></div>
          <textarea class="q-textarea" placeholder="Your thoughts on this session…" rows="4"></textarea>
        </div>

        <div class="feedback-box" id="fb-session-review" style="display:none">
          <div class="fb-label">✓ Submitted</div>
          <div class="fb-content">
            <p>Congratulations on finishing session one! In the next session, we will explore the balance sheet in more detail.</p>
          </div>
        </div>

        <button class="submit-btn" onclick="toggleFeedback('fb-session-review', this)">Submit session review</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s1-4-1')">← 1.4.1 Discussion</button>
        <button class="nav-btn" style="opacity:0.5;cursor:default">Session 2 coming soon →</button>
      </div>
    </div>
  </div>
</main>
`;

const pages = {
  "s1-1": "1.1 Introduction",
  "s1-2": "1.2 Objectives",
  "s1-3": "1.3 Main financial statements",
  "s1-4": "1.4 Annual reports",
  "s1-4-1": "1.4.1 Exploring an annual report",
  "s1-5": "1.5 Session review",
};

export default function AccountingPrimerSession1Page() {
  useEffect(() => {
    window.showPage = function showPage(id) {
      document.querySelectorAll(".accounting-primer-session1 .page").forEach((page) => {
        page.classList.remove("active");
      });
      document.querySelectorAll(".accounting-primer-session1 .nav-item").forEach((item) => {
        item.classList.remove("active");
      });

      const page = document.getElementById(`page-${id}`);
      if (page) page.classList.add("active");

      const nav = document.getElementById(`nav-${id}`);
      if (nav) nav.classList.add("active");

      const breadcrumb = document.getElementById("breadcrumb-text");
      if (breadcrumb) breadcrumb.textContent = pages[id] || "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.toggleFeedback = function toggleFeedback(id, btn) {
      const feedback = document.getElementById(id);
      if (!feedback) return;
      feedback.classList.add("visible");
      feedback.style.display = "block";

      if (btn) {
        btn.textContent = "✓ Submitted";
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "default";
      }

      feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    window.selectMCQ = function selectMCQ(el, groupId) {
      document.querySelectorAll(`#${groupId} .mcq-option`).forEach((option) => {
        option.classList.remove("selected");
      });
      el.classList.add("selected");
    };

    window.selectSR = function selectSR(el) {
      const row = el.closest(".self-review-row");
      if (!row) return;
      row.querySelectorAll(".sr-radio").forEach((radio) => {
        radio.classList.remove("checked");
      });
      el.classList.add("checked");
    };

    window.showPage("s1-1");

    return () => {
      delete window.showPage;
      delete window.toggleFeedback;
      delete window.selectMCQ;
      delete window.selectSR;
    };
  }, []);

  return (
    <>
      <div className="accounting-primer-session1" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .accounting-primer-session1 {
          --ink: #1a1a2e;
          --ink-soft: #4a4a6a;
          --ink-faint: #8888aa;
          --bg: #f7f6f2;
          --white: #ffffff;
          --accent: #003e6b;
          --accent-light: #e8f0f8;
          --gold: #c8922a;
          --gold-light: #fdf3e3;
          --coral: #d4463a;
          --coral-light: #fdf0ef;
          --lavender: #e6e6fa;
          --green: #2d6a4f;
          --green-light: #e8f4ee;
          --border: #e2e0da;
          --sidebar-w: 280px;
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--ink);
          line-height: 1.7;
          display: flex;
          min-height: 100vh;
        }

        .accounting-primer-session1 * { box-sizing: border-box; margin: 0; padding: 0; }
        .accounting-primer-session1 button { cursor: pointer; }
        .accounting-primer-session1 .sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: var(--accent);
          color: #fff;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        .accounting-primer-session1 .sidebar-header {
          padding: 2rem 1.5rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .accounting-primer-session1 .course-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.5rem;
        }
        .accounting-primer-session1 .course-title,
        .accounting-primer-session1 .page-title,
        .accounting-primer-session1 .page-body h2,
        .accounting-primer-session1 .lo-box h2,
        .accounting-primer-session1 .info-box h2,
        .accounting-primer-session1 .discussion-header h2,
        .accounting-primer-session1 .quiz-header h2,
        .accounting-primer-session1 .overview-lo h2 {
          font-family: 'DM Serif Display', serif;
        }
        .accounting-primer-session1 .course-title {
          font-size: 1.2rem;
          line-height: 1.3;
          color: #fff;
        }
        .accounting-primer-session1 .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }
        .accounting-primer-session1 .nav-section { margin-bottom: 0.25rem; }
        .accounting-primer-session1 .nav-module {
          padding: 0.6rem 1.5rem;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .accounting-primer-session1 .nav-module.active-module { color: rgba(255,255,255,0.9); }
        .accounting-primer-session1 .nav-item {
          padding: 0.5rem 1.5rem 0.5rem 2rem;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .accounting-primer-session1 .nav-item:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.9);
        }
        .accounting-primer-session1 .nav-item.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-left-color: var(--gold);
        }
        .accounting-primer-session1 .nav-item .item-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          opacity: 0.7;
        }
        .accounting-primer-session1 .nav-locked {
          opacity: 0.4;
          cursor: default;
          font-style: italic;
        }
        .accounting-primer-session1 .pill {
          font-size: 0.6rem;
          padding: 2px 6px;
          border-radius: 20px;
          font-weight: 600;
          margin-left: auto;
          flex-shrink: 0;
        }
        .accounting-primer-session1 .pill-draft { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
        .accounting-primer-session1 .pill-active { background: rgba(200,146,42,0.3); color: #f0c06a; }
        .accounting-primer-session1 .main {
          margin-left: var(--sidebar-w);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .accounting-primer-session1 .topbar {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 1rem 2.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .accounting-primer-session1 .breadcrumb {
          font-size: 0.78rem;
          color: var(--ink-faint);
        }
        .accounting-primer-session1 .breadcrumb span { color: var(--ink-soft); }
        .accounting-primer-session1 .content-area {
          padding: 2.5rem 3rem 4rem;
          max-width: 860px;
        }
        .accounting-primer-session1 .page { display: none; }
        .accounting-primer-session1 .page.active { display: block; }
        .accounting-primer-session1 .page-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .accounting-primer-session1 .page-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .accounting-primer-session1 .page-title {
          font-size: 2.2rem;
          color: var(--ink);
          line-height: 1.2;
        }
        .accounting-primer-session1 .page-body p { margin-bottom: 1rem; color: var(--ink-soft); }
        .accounting-primer-session1 .page-body p:last-child { margin-bottom: 0; }
        .accounting-primer-session1 .page-body strong { color: var(--ink); }
        .accounting-primer-session1 .page-body em { color: var(--ink-soft); }
        .accounting-primer-session1 .page-body h2 {
          font-size: 1.4rem;
          margin: 1.5rem 0 0.75rem;
          color: var(--ink);
        }
        .accounting-primer-session1 .page-body ul,
        .accounting-primer-session1 .page-body ol {
          margin: 0.5rem 0 1rem 1.5rem;
          color: var(--ink-soft);
        }
        .accounting-primer-session1 .page-body li { margin-bottom: 0.4rem; }
        .accounting-primer-session1 .lo-box,
        .accounting-primer-session1 .overview-lo {
          border: 1px solid var(--border);
          border-left: 4px solid var(--accent);
          padding: 1.25rem 1.5rem;
          margin: 1.5rem 0;
          background: var(--accent-light);
          border-radius: 0 6px 6px 0;
        }
        .accounting-primer-session1 .lo-box h2,
        .accounting-primer-session1 .overview-lo h2 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem;
          color: var(--accent);
        }
        .accounting-primer-session1 .lo-box h5 {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .accounting-primer-session1 .lo-box ul,
        .accounting-primer-session1 .overview-lo ul { margin-left: 1.2rem; color: var(--ink-soft); }
        .accounting-primer-session1 .lo-box li,
        .accounting-primer-session1 .overview-lo li { margin-bottom: 0.35rem; font-size: 0.92rem; }
        .accounting-primer-session1 .info-box {
          background: var(--lavender);
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin: 1.5rem 0;
        }
        .accounting-primer-session1 .info-box h2 {
          font-size: 1.1rem;
          margin: 0 0 0.75rem;
          color: var(--ink);
        }
        .accounting-primer-session1 .video-placeholder {
          background: #1a1a2e;
          border-radius: 10px;
          aspect-ratio: 16/9;
          max-width: 760px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 1rem;
          margin: 1.5rem 0;
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          position: relative;
          overflow: hidden;
        }
        .accounting-primer-session1 .video-placeholder::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,62,107,0.4) 0%, rgba(26,26,46,0.8) 100%);
        }
        .accounting-primer-session1 .video-inner {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .accounting-primer-session1 .video-icon {
          width: 52px;
          height: 52px;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
        }
        .accounting-primer-session1 .video-icon svg { fill: rgba(255,255,255,0.7); }
        .accounting-primer-session1 .video-label-pending {
          display: inline-block;
          background: var(--coral-light);
          color: var(--coral);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }
        .accounting-primer-session1 .discussion-header,
        .accounting-primer-session1 .quiz-header {
          background: var(--gold);
          color: #fff;
          padding: 1.5rem 2rem;
          border-radius: 10px 10px 0 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .accounting-primer-session1 .quiz-header {
          background: var(--accent);
          margin-bottom: 0;
        }
        .accounting-primer-session1 .discussion-header h2,
        .accounting-primer-session1 .quiz-header h2 {
          font-size: 1.4rem;
          color: #fff;
          margin: 0;
        }
        .accounting-primer-session1 .discussion-header-icon {
          font-size: 1.2rem;
          line-height: 1;
        }
        .accounting-primer-session1 .discussion-body-box { border-top: none; border-radius: 0 0 10px 10px; }
        .accounting-primer-session1 .page-nav {
          display: flex;
          gap: 1rem;
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .accounting-primer-session1 .nav-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-size: 0.83rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--white);
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.15s;
        }
        .accounting-primer-session1 .nav-btn:hover { border-color: var(--accent); color: var(--accent); }
        .accounting-primer-session1 .nav-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
        .accounting-primer-session1 .nav-btn.primary:hover { background: #002e52; }
        .accounting-primer-session1 .quiz-body {
          background: var(--white);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 10px 10px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .accounting-primer-session1 .q-block {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }
        .accounting-primer-session1 .q-block:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .accounting-primer-session1 .q-number {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .accounting-primer-session1 .q-text { color: var(--ink); margin-bottom: 1rem; font-size: 0.95rem; }
        .accounting-primer-session1 .q-text p { margin-bottom: 0.6rem; }
        .accounting-primer-session1 .q-text ul,
        .accounting-primer-session1 .q-text ol { margin-left: 1.5rem; margin-bottom: 0.6rem; }
        .accounting-primer-session1 .q-text li { margin-bottom: 0.3rem; }
        .accounting-primer-session1 .q-text table,
        .accounting-primer-session1 .fb-content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin: 0.75rem 0;
        }
        .accounting-primer-session1 .q-text th {
          background: var(--accent);
          color: #fff;
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .accounting-primer-session1 .q-text td {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border);
          vertical-align: top;
        }
        .accounting-primer-session1 .q-text tr:nth-child(even) td { background: var(--bg); }
        .accounting-primer-session1 .q-textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: var(--ink);
          resize: vertical;
          min-height: 120px;
          background: var(--bg);
          transition: border-color 0.15s;
        }
        .accounting-primer-session1 .q-textarea:focus { outline: none; border-color: var(--accent); background: var(--white); }
        .accounting-primer-session1 .feedback-box {
          background: var(--green-light);
          border: 1px solid #a8d5b5;
          border-radius: 6px;
          padding: 1rem 1.25rem;
          margin-top: 1rem;
          display: none;
        }
        .accounting-primer-session1 .feedback-box.visible { display: block; }
        .accounting-primer-session1 .feedback-box .fb-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--green);
          margin-bottom: 0.5rem;
        }
        .accounting-primer-session1 .feedback-box .fb-content { font-size: 0.88rem; color: var(--ink-soft); }
        .accounting-primer-session1 .feedback-box .fb-content p { margin-bottom: 0.5rem; }
        .accounting-primer-session1 .feedback-box .fb-content th {
          background: var(--green);
          color: #fff;
          padding: 0.4rem 0.6rem;
          text-align: left;
        }
        .accounting-primer-session1 .feedback-box .fb-content td {
          padding: 0.4rem 0.6rem;
          border: 1px solid #a8d5b5;
          vertical-align: top;
        }
        .accounting-primer-session1 .feedback-box .fb-content tr:nth-child(even) td { background: rgba(255,255,255,0.5); }
        .accounting-primer-session1 .mcq-options { display: flex; flex-direction: column; gap: 0.5rem; }
        .accounting-primer-session1 .mcq-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          background: var(--white);
          transition: all 0.15s;
          font-size: 0.88rem;
          color: var(--ink-soft);
          user-select: none;
        }
        .accounting-primer-session1 .mcq-option:hover { border-color: var(--accent); background: var(--accent-light); color: var(--ink); }
        .accounting-primer-session1 .mcq-option.selected { border-color: var(--accent); background: var(--accent-light); color: var(--ink); font-weight: 500; }
        .accounting-primer-session1 .mcq-radio {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid var(--border);
          flex-shrink: 0;
          transition: all 0.15s;
          position: relative;
        }
        .accounting-primer-session1 .mcq-option.selected .mcq-radio {
          border-color: var(--accent);
          background: var(--accent);
          box-shadow: inset 0 0 0 3px var(--white);
        }
        .accounting-primer-session1 .submit-btn {
          margin-top: 1.5rem;
          padding: 0.7rem 1.8rem;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .accounting-primer-session1 .submit-btn:hover { background: #002e52; }
        .accounting-primer-session1 .self-review {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .accounting-primer-session1 .self-review-header {
          background: #f0f0f8;
          padding: 0.75rem 1.25rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--ink-soft);
          display: grid;
          grid-template-columns: 1fr repeat(3, 120px);
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .accounting-primer-session1 .self-review-row {
          padding: 0.9rem 1.25rem;
          font-size: 0.88rem;
          color: var(--ink-soft);
          display: grid;
          grid-template-columns: 1fr repeat(3, 120px);
          gap: 0.5rem;
          align-items: center;
          border-top: 1px solid var(--border);
        }
        .accounting-primer-session1 .self-review-row:first-of-type { border-top: none; }
        .accounting-primer-session1 .sr-radio-group { display: flex; gap: 0.5rem; justify-content: center; }
        .accounting-primer-session1 .sr-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--border);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .accounting-primer-session1 .sr-radio:hover { border-color: var(--accent); }
        .accounting-primer-session1 .sr-radio.checked { border-color: var(--accent); background: var(--accent); box-shadow: inset 0 0 0 3px var(--white); }
        .accounting-primer-session1 .session-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .accounting-primer-session1 .session-card {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.25rem;
          background: var(--white);
          cursor: pointer;
          transition: all 0.15s;
        }
        .accounting-primer-session1 .session-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,62,107,0.08); }
        .accounting-primer-session1 .session-card.available { border-left: 4px solid var(--accent); }
        .accounting-primer-session1 .session-card.locked { opacity: 0.5; cursor: default; }
        .accounting-primer-session1 .session-card .s-num { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: var(--ink-faint); text-transform: uppercase; margin-bottom: 0.3rem; }
        .accounting-primer-session1 .session-card .s-title { font-weight: 600; font-size: 0.9rem; color: var(--ink); }
        .accounting-primer-session1 .session-card .s-badge { font-size: 0.65rem; margin-top: 0.5rem; color: var(--ink-faint); }
        .accounting-primer-session1 .text-block {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .accounting-primer-session1 .text-block p { color: var(--ink-soft); font-size: 0.93rem; margin-bottom: 0.75rem; }
        .accounting-primer-session1 .text-block p:last-child { margin-bottom: 0; }

        @media (max-width: 900px) {
          .accounting-primer-session1 {
            display: block;
          }
          .accounting-primer-session1 .sidebar {
            position: static;
            width: 100%;
            min-height: auto;
          }
          .accounting-primer-session1 .main {
            margin-left: 0;
          }
          .accounting-primer-session1 .topbar,
          .accounting-primer-session1 .content-area {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .accounting-primer-session1 .content-area {
            max-width: none;
            padding-bottom: 2rem;
          }
          .accounting-primer-session1 .self-review-header,
          .accounting-primer-session1 .self-review-row {
            grid-template-columns: 1fr;
          }
          .accounting-primer-session1 .self-review-header > div:not(:first-child) {
            display: none;
          }
          .accounting-primer-session1 .sr-radio-group {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
}
