"use client";

import { useEffect } from "react";

const htmlContent = String.raw`
<aside class="sidebar">
  <nav class="sidebar-nav">
    <div class="nav-section">
      <div class="nav-module active-module">
        Session 1: Financial Reporting
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
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.3 Main financial statements
      </div>
      <div class="nav-item" onclick="showPage('s1-4')" id="nav-s1-4">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.4 Annual reports
      </div>
      <div class="nav-item" onclick="showPage('s1-4-1')" id="nav-s1-4-1" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.4.1 Exploring an annual report
      </div>
      <div class="nav-item" onclick="showPage('s1-5')" id="nav-s1-5">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        1.5 Session review
      </div>
    </div>

    <div class="nav-section">
      <div class="nav-module active-module">
        Session 2: Balance sheet
      </div>
      <div class="nav-item" onclick="showPage('s2-1')" id="nav-s2-1">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        2.1 Introduction
      </div>
      <div class="nav-item" onclick="showPage('s2-2')" id="nav-s2-2">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        2.2 What is the balance sheet?
      </div>
      <div class="nav-item" onclick="showPage('s2-2-1')" id="nav-s2-2-1" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        2.2.1 Examining a balance sheet
      </div>
      <div class="nav-item" onclick="showPage('s2-3')" id="nav-s2-3">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        2.3 Assets
      </div>
      <div class="nav-item" onclick="showPage('s2-4')" id="nav-s2-4">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        2.4 Liabilities and equity
      </div>
      <div class="nav-item" onclick="showPage('s2-5')" id="nav-s2-5">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        2.5 Session review
      </div>
    </div>

    <div class="nav-section">
      <div class="nav-module active-module">
        Session 3: Income statement
      </div>
      <div class="nav-item" onclick="showPage('s3-1')" id="nav-s3-1">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        3.1 Introduction
      </div>
      <div class="nav-item" onclick="showPage('s3-2')" id="nav-s3-2">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        3.2 Revenue
      </div>
      <div class="nav-item" onclick="showPage('s3-3')" id="nav-s3-3">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        3.3 Expenses
      </div>
      <div class="nav-item" onclick="showPage('s3-4')" id="nav-s3-4">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        3.4 Depreciation
      </div>
      <div class="nav-item" onclick="showPage('s3-5')" id="nav-s3-5">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        3.5 Calculating the profit
      </div>
      <div class="nav-item" onclick="showPage('s3-6')" id="nav-s3-6">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        3.6 Session review
      </div>
    </div>

    <div class="nav-section" style="opacity:0.4">
    </div>

    <div class="nav-section">
      <div class="nav-module active-module">
        Session 4: Cash Flow Statement
      </div>
      <div class="nav-item" onclick="showPage('s4-1')" id="nav-s4-1">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        4.1 Introduction
      </div>
      <div class="nav-item" onclick="showPage('s4-2')" id="nav-s4-2">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        4.2 Structure of cash flow statements
      </div>
      <div class="nav-item" onclick="showPage('s4-3')" id="nav-s4-3">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        4.3 Is all cash equal?
      </div>
      <div class="nav-item" onclick="showPage('s4-4')" id="nav-s4-4">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        4.4 Examining a cash flow statement
      </div>
      <div class="nav-item" onclick="showPage('s4-5')" id="nav-s4-5">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        4.5 Session review
      </div>
    </div>

    <div class="nav-section">
      <div class="nav-module active-module">
        Session 5: Management accounting: Part 1
      </div>
      <div class="nav-item" onclick="showPage('s5-1')" id="nav-s5-1">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.1 Introduction
      </div>
      <div class="nav-item" onclick="showPage('s5-2')" id="nav-s5-2">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.2 Why do we need management accounting?
      </div>
      <div class="nav-item" onclick="showPage('s5-3')" id="nav-s5-3">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.3 Cost classification: Direct vs indirect
      </div>
      <div class="nav-item" onclick="showPage('s5-4')" id="nav-s5-4">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.4 Cost classification: Fixed vs variable
      </div>
      <div class="nav-item" onclick="showPage('s5-5')" id="nav-s5-5">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.5 Short-term decision making
      </div>
      <div class="nav-item" onclick="showPage('s5-5-1')" id="nav-s5-5-1" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.5.1 The special order
      </div>
      <div class="nav-item" onclick="showPage('s5-5-2')" id="nav-s5-5-2" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.5.2 The make or buy decision
      </div>
      <div class="nav-item" onclick="showPage('s5-5-3')" id="nav-s5-5-3" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.5.3 Continue or discontinue?
      </div>
      <div class="nav-item" onclick="showPage('s5-5-4')" id="nav-s5-5-4" style="padding-left: 2.8rem;">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.5.4 Limiting factors
      </div>
      <div class="nav-item" onclick="showPage('s5-6')" id="nav-s5-6">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.6 The break-even formula
      </div>
      <div class="nav-item" onclick="showPage('s5-7')" id="nav-s5-7">
        <svg class="item-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>
        5.7 Session review
      </div>
    </div>

    <div class="nav-section" style="opacity:0.4">
      <div class="nav-module nav-locked">Session 6: Management accounting: Part 2</div>
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

        <p>Different countries follow different reporting frameworks, and you are studying alongside people from a range of professional and geographic backgrounds. In the activity below, share where you are based and let your cohort see just how widely the two frameworks are used across the world.</p>

        <div class="quiz-header">
          <h2>Activity</h2>
        </div>
        <div class="quiz-body" style="border-top:3px solid var(--gold)">
          <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
            There will be an interactive map activity here on Canvas.
          </div>
          <p style="color:var(--ink-soft);font-size:0.93rem">Drop a pin on the map to show where you are based, and indicate whether your country follows IFRS or a local GAAP framework. If you are unsure, a quick search for your country's name alongside 'accounting standards' or 'financial reporting framework' should give you the answer.</p>
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
              <li>Assets must always equal liabilities plus equity, no matter how many transactions have taken place</li>
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
          <p style="color:var(--ink-soft);font-size:0.93rem">Find the annual report of a company you genuinely like or use. Most publicly listed companies publish their annual reports on their websites, usually under an 'Investors' or 'Investor Relations' section. Once you have found one, work through the questions below. You may not find every section in every report, but try to locate as many as you can.</p>
          <p style="color:var(--ink-soft);font-size:0.93rem">Note that some US companies file a document called a 10-K in place of a traditional annual report, and not all reports will use exactly the same section headings as those covered in the presentation.</p>
          <ul style="margin:0.5rem 0 0.75rem 1.4rem;color:var(--ink-soft);font-size:0.93rem">
            <li>Which company have you chosen and what is the reporting period?</li>
            <li>Were you able to locate the Letter to Shareholders and the Business Overview/Management Discussion?</li>
            <li>What does the CEO identify as the main challenge of the year?</li>
            <li>What reason does management give for that year's performance?</li>
            <li>Did you come across the Auditor's Report, and if so is the opinion qualified or unqualified?</li>
            <li>Were you able to find all three financial statements, and do they cover more than one year? How many periods exactly?</li>
            <li>Is there an ESG section, and if so what sort of commitments does the company make?</li>
          </ul>
          <p style="color:var(--ink-soft);font-size:0.93rem">Completing this task, will help you learn how to navigate a company’s annual report and to identify key sections such as the Letter to Shareholders and Management Discussion, the Auditor’s Report and the financial statements</p>

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

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>We have now reached the end of the first session of this primer.</p>
        <p>In this session, you had an opportunity to explore the world of financial reporting, including the frameworks that make it reliable and the three core financial statements. You also saw how this information comes together in an annual report.</p>
        <p>Let's now return to the learning outcomes outlined in the session introduction. To what extent do you feel you have achieved each of this session's learning outcomes?</p>
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
        <button class="nav-btn" onclick="showPage('s2-1')">Next: 2.1 Introduction →</button>
      </div>
    </div>

    <!-- SESSION 2 -->

    <div class="page" id="page-s2-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 2 · Balance sheet</div>
        <h1 class="page-title">2.1 Introduction</h1>
      </div>
      <div class="page-body">
        <p>Welcome to session two! In this session, we take a closer look at one of those core financial statements: the balance sheet. You'll explore what it contains and how to read it, building on the foundations laid in session one.</p>
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
            <li>Analyse a simple balance sheet</li>
            <li>Distinguish between current and non-current assets</li>
            <li>Identify the main categories of liabilities and equity.</li>
          </ul>
        </div>

        <p>In the next activity, we'll start examining balance sheets in more detail.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s1-5')">← 1.5 Session review</button>
        <button class="nav-btn primary" onclick="showPage('s2-2')">Next: 2.2 What is the balance sheet? →</button>
      </div>
    </div>

    <div class="page" id="page-s2-2">
      <div class="page-header">
        <div class="page-eyebrow">Session 2 · Balance sheet</div>
        <h1 class="page-title">2.2 What is the balance sheet?</h1>
      </div>
      <div class="page-body">
        <p>In the next presentation, Laila discusses what kind of information is typically included balance sheets.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">What is the balance sheet?</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>You may have noticed in the presentation that equity is also an important part of the balance sheet. We'll explore that further later in this session.</p>
        <p>In the next activity, you'll return to the annual report you looked at earlier to take a closer look at its balance sheet.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s2-1')">← 2.1 Introduction</button>
        <button class="nav-btn primary" onclick="showPage('s2-2-1')">Next: 2.2.1 Examining a balance sheet →</button>
      </div>
    </div>

    <div class="page" id="page-s2-2-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 2 · Balance sheet</div>
        <h1 class="page-title">2.2.1 Examining a balance sheet</h1>
      </div>
      <div class="page-body">
        <div class="discussion-header">
          <div class="discussion-header-icon">💬</div>
          <h2>Discussion</h2>
        </div>
        <div class="quiz-body discussion-body-box">
          <p style="color:var(--ink-soft);font-size:0.93rem">Return to the annual report you found in session one. This time, locate the balance sheet (it may also be labelled the 'statement of financial position').</p>
          <p style="color:var(--ink-soft);font-size:0.93rem">Using what you have learned in this session, answer the following questions:</p>
          <ul style="margin:0.5rem 0 0.75rem 1.4rem;color:var(--ink-soft);font-size:0.93rem">
            <li>What does the company own (its assets)?</li>
            <li>What is the largest asset the company owns?</li>
            <li>Is this asset tangible (physical) or intangible (e.g. brand, patents, goodwill)?</li>
            <li>What might this tell you about the nature of the business?</li>
            <li>What does the company owe (its liabilities)?</li>
            <li>What is the company worth to shareholders (its equity)?</li>
          </ul>
          <p>By completing this task, you'll get a better understanding of the basic structure of a balance sheet and how it provides a snapshot of what a company owns and owes, as well as what it's worth.</p>
          <p style="color:var(--ink-soft);font-size:0.93rem">Share your findings with your cohort below. <em>(Discussion forum — available on Canvas)</em></p>
        </div>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s2-2')">← 2.2 What is the balance sheet?</button>
        <button class="nav-btn primary" onclick="showPage('s2-3')">Next: 2.3 Assets →</button>
      </div>
    </div>

    <div class="page" id="page-s2-3">
      <div class="page-header">
        <div class="page-eyebrow">Session 2 · Balance sheet</div>
        <h1 class="page-title">2.3 Assets</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>In the next presentation, Laila looks at how assets are formally defined and how they are divided into current and non-current categories.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Assets</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Now complete the exercise below to check your understanding of current and non-current assets.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Sort the items below into the correct category based on whether they are current or non-current assets.</p>
          </div>
          <div class="categorize-grid">
            <div class="categorize-item" id="cat-cash">
              <span class="cat-label">Cash in bank</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-cash')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-cash')">Non-current</div>
              </div>
            </div>
            <div class="categorize-item" id="cat-vans">
              <span class="cat-label">Delivery vans</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-vans')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-vans')">Non-current</div>
              </div>
            </div>
            <div class="categorize-item" id="cat-store">
              <span class="cat-label">Store buildings</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-store')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-store')">Non-current</div>
              </div>
            </div>
            <div class="categorize-item" id="cat-sti">
              <span class="cat-label">Short-term investments</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-sti')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-sti')">Non-current</div>
              </div>
            </div>
            <div class="categorize-item" id="cat-raw">
              <span class="cat-label">Raw materials</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-raw')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-raw')">Non-current</div>
              </div>
            </div>
            <div class="categorize-item" id="cat-software">
              <span class="cat-label">Computer software</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-software')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-software')">Non-current</div>
              </div>
            </div>
            <div class="categorize-item" id="cat-inventory">
              <span class="cat-label">Inventory (products for sale)</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat-inventory')">Current</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat-inventory')">Non-current</div>
              </div>
            </div>
          </div>
          <div class="feedback-box" id="fb-2-3">
            <div class="fb-label">✓ Answers</div>
            <div class="fb-content">
              <p><strong>Current assets:</strong> Cash in bank, Short-term investments, Raw materials, Inventory (products for sale)</p>
              <p><strong>Non-current assets:</strong> Delivery vans, Store buildings, Computer software</p>

            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-2-3', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>The presentation also touched on intangible assets, which don't have a physical form but can still be enormously valuable. Now complete the exercise below to check your understanding of how different types of assets tend to reflect different kinds of business.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Choose the type of business each statement most likely describes.</p>
          </div>
          <div class="categorize-grid">
            <div class="categorize-item" id="match-intangible">
              <span class="cat-label">Likely to have almost entirely intangible assets (platform, users, brand)</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'match-intangible')">Social media platform</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-intangible')">Supermarket</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-intangible')">Car manufacturer</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-intangible')">Software company</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-intangible')">Pharmaceutical company</div>
              </div>
            </div>
            <div class="categorize-item" id="match-supermarket">
              <span class="cat-label">Likely to have tangible assets (leased or owned) as well as large inventory with very quick turnaround</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'match-supermarket')">Social media platform</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-supermarket')">Supermarket</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-supermarket')">Car manufacturer</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-supermarket')">Software company</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-supermarket')">Pharmaceutical company</div>
              </div>
            </div>
            <div class="categorize-item" id="match-factories">
              <span class="cat-label">Likely to have factories, machinery, and raw materials</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'match-factories')">Social media platform</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-factories')">Supermarket</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-factories')">Car manufacturer</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-factories')">Software company</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-factories')">Pharmaceutical company</div>
              </div>
            </div>
            <div class="categorize-item" id="match-software">
              <span class="cat-label">Likely to have mainly licenses and intangible assets</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'match-software')">Social media platform</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-software')">Supermarket</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-software')">Car manufacturer</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-software')">Software company</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-software')">Pharmaceutical company</div>
              </div>
            </div>
            <div class="categorize-item" id="match-patents">
              <span class="cat-label">Likely to have patents, research assets, and intellectual property</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'match-patents')">Social media platform</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-patents')">Supermarket</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-patents')">Car manufacturer</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-patents')">Software company</div>
                <div class="cat-opt" onclick="selectCat(this, 'match-patents')">Pharmaceutical company</div>
              </div>
            </div>
          </div>
          <div class="feedback-box" id="fb-2-3-match">
            <div class="fb-label">✓ Answers</div>
            <div class="fb-content">
              <p><strong>Social media platform</strong> — Likely to have almost entirely intangible assets (platform, users, brand)</p>
              <p><strong>Supermarket</strong> — Likely to have tangible assets (leased or owned) as well as large inventory with very quick turnaround</p>
              <p><strong>Car manufacturer</strong> — Likely to have factories, machinery, and raw materials</p>
              <p><strong>Software company</strong> — Likely to have mainly licenses and intangible assets</p>
              <p><strong>Pharmaceutical company</strong> — Likely to have patents, research assets, and intellectual property</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-2-3-match', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-body" style="margin-top:1.5rem">
        <p>Well done for attempting this activity. You are hopefully now beginning to recognise the key links between business nature (economics) and the balance sheet.</p>
        <p>In the next activity, you'll examine the other key elements of the balance sheet further: liabilities and equity.</p>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s2-2-1')">← 2.2.1 Examining a balance sheet</button>
        <button class="nav-btn primary" onclick="showPage('s2-4')">Next: 2.4 Liabilities and equity →</button>
      </div>
    </div>

    <div class="page" id="page-s2-4">
      <div class="page-header">
        <div class="page-eyebrow">Session 2 · Balance sheet</div>
        <h1 class="page-title">2.4 Liabilities and equity</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>The balance sheet also shows how a business's assets are financed. In the next presentation, Laila covers liabilities and equity, including what each represents and how they make up the other side of the balance sheet equation.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Liabilities and equity</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Now complete the following exercise to check your understanding of the difference between liabilities and equity.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>You're launching a small business and need £10,000 to get started. You must raise this from a combination of your own investment and a bank loan; you cannot use just one source. Choose a split from the options below, but note that your two choices must add up to £10,000.</p>
            <p>How much will you invest yourself?</p>
            <ul>
              <li>£2,000</li>
              <li>£5,000</li>
              <li>£8,000</li>
            </ul>
            <p>How much will you borrow from a bank?</p>
            <ul>
              <li>£2,000</li>
              <li>£5,000</li>
              <li>£8,000</li>
            </ul>
            <p>Now imagine the bank agrees to lend you money, but it is split into two types:</p>
            <ul>
              <li>Current Liability (pay soon – within 12 months)</li>
              <li>Non-Current Liability (pay later – over several years)</li>
            </ul>
            <p>The £10,000 you raise will sit in the business as cash (as an asset). But that cash has come from two different sources, each representing a different kind of claim on the business.</p>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:0.88rem;margin:0.75rem 0 1.25rem">
            <thead>
              <tr>
                <th style="background:var(--accent);color:#fff;padding:0.5rem 0.75rem;text-align:left">Assets</th>
                <th style="background:var(--accent);color:#fff;padding:0.5rem 0.75rem;text-align:left">Liabilities &amp; Equity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:0.5rem 0.75rem;border:1px solid var(--border);vertical-align:top">£10,000</td>
                <td style="padding:0.5rem 0.75rem;border:1px solid var(--border);vertical-align:top">
                  Non-current liability &nbsp;&nbsp; £ ______<br>
                  Current liability &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; £ ______<br>
                  Equity &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; £ ______
                </td>
              </tr>
            </tbody>
          </table>

          <div class="q-text" style="margin-top:1rem">
            <p><strong>Debt financing</strong></p>
            <p>Which part of your loan creates immediate pressure on your business?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="2"></textarea>

          <div class="q-text" style="margin-top:1rem">
            <p>Which part gives you more time and flexibility?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="2"></textarea>

          <div class="q-text" style="margin-top:1.5rem">
            <p><strong>Who has a claim on the business?</strong></p>
            <p>What percentage of the business is funded by you (equity)?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="2"></textarea>

          <div class="q-text" style="margin-top:1rem">
            <p>What percentage is funded by debt (liability)?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="2"></textarea>

          <div class="q-text" style="margin-top:1.5rem">
            <p><strong>Implications</strong></p>
            <p>If you chose more borrowing, what does that mean for financial risk?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="2"></textarea>

          <div class="q-text" style="margin-top:1rem">
            <p>If you chose more equity, what does that mean for control and ownership?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="2"></textarea>

          <div class="feedback-box" id="fb-2-4">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>This simple activity should provide you a good understanding of how a business is financed through a combination of equity (owner investment) and liabilities (borrowing). You are beginning to see that not all money in a business is the same: some represents ownership, while some represents obligations that must be repaid.</p>
              <p>You have also started to distinguish between current liabilities (short-term pressure) and non-current liabilities (long-term borrowing), which is an important concept in understanding financial risk and stability.</p>
              <p><strong>Which part creates immediate pressure?</strong> The current liability, because it must be repaid within 12 months.</p>
              <p><strong>Which part gives more time and flexibility?</strong> The non-current liability. Because repayment is spread over several years, the business has time to generate returns before the full obligation falls due.</p>
              <p><strong>What percentage of the business is funded by you (equity)?</strong> For example, £2,000 invested = 20% equity-funded. £5,000 = 50%. £8,000 = 80%.</p>
              <p><strong>What percentage is funded by debt (liability)?</strong> The remainder, i.e. 100% minus your equity percentage.</p>
              <p><strong>If you chose more borrowing, what does that mean for financial risk?</strong> Higher borrowing means more of the business's cash flow is committed to repaying lenders, regardless of how well the business is performing. If revenue falls, the business may struggle to meet those obligations. Lenders also have a prior claim over owners if the business fails.</p>
              <p><strong>If you chose more equity, what does that mean for control and ownership?</strong> Investing more yourself means you retain greater ownership and control. There is no repayment obligation and no interest. However, you are taking on more personal financial risk, and any profits remain with you rather than being shared with a lender.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-2-4', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s2-3')">← 2.3 Assets</button>
        <button class="nav-btn primary" onclick="showPage('s2-5')">Next: 2.5 Session review →</button>
      </div>
    </div>

    <div class="page" id="page-s2-5">
      <div class="page-header">
        <div class="page-eyebrow">Session 2 · Balance sheet</div>
        <h1 class="page-title">2.5 Session review</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>We have now reached the end of this session of this primer.</p>
        <p>In this session, you had an opportunity to take a closer look at the balance sheet, including what it contains and what it can tell you about how a business is financed and what it owns.</p>
        <p>Let's now return to the learning outcomes outlined in the session introduction. To what extent do you feel you have achieved each of this session's learning outcomes?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="self-review">
          <div class="self-review-header">
            <div>Learning outcome</div>
            <div style="text-align:center">Confident</div>
            <div style="text-align:center">Need to review</div>
            <div style="text-align:center">Need support</div>
          </div>
          <div class="self-review-row">
            <div>Analyse a simple balance sheet</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Distinguish between current and non-current assets</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Identify the main categories of liabilities and equity</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
        </div>

        <div class="q-block" style="margin-top:1.5rem">
          <div class="q-number">Timing feedback</div>
          <div class="q-text"><p>Was the estimated timing accurate?</p></div>
          <div class="mcq-options" id="mcq-s2-timing">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s2-timing')">
              <div class="mcq-radio"></div>
              It took less time to complete the tasks and exercises than estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s2-timing')">
              <div class="mcq-radio"></div>
              It took about the same amount of time to complete the tasks and exercises as estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s2-timing')">
              <div class="mcq-radio"></div>
              It took more time to complete the tasks and exercises than estimated
            </div>
          </div>
        </div>

        <div class="q-block">
          <div class="q-number">Open feedback</div>
          <div class="q-text"><p>Please provide feedback on the content covered.</p></div>
          <textarea class="q-textarea" placeholder="Your thoughts on this session…" rows="4"></textarea>
        </div>

        <div class="feedback-box" id="fb-s2-review" style="display:none">
          <div class="fb-label">✓ Submitted</div>
          <div class="fb-content">
            <p>Congratulations on finishing session two! In the next session, we will explore the income statement in more detail.</p>
          </div>
        </div>

        <button class="submit-btn" onclick="toggleFeedback('fb-s2-review', this)">Submit session review</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s2-4')">← 2.4 Liabilities and equity</button>
        <button class="nav-btn primary" onclick="showPage('s3-1')">Next: 3.1 Introduction →</button>
      </div>
    </div>

    <!-- SESSION 3 -->

    <div class="page" id="page-s3-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 3 · Income statement</div>
        <h1 class="page-title">3.1 Introduction</h1>
      </div>
      <div class="page-body">
        <p>Welcome to session three! In this session, we turn to the income statement, the financial statement that tells you not what a business owns but how it has performed. You'll explore how revenue and costs are recorded and what they reveal about a company's profitability.</p>
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
            <li>Explain the purpose of the income statement</li>
            <li>Distinguish between revenue and expenses</li>
            <li>Calculate straight-line depreciation for a long-term asset</li>
            <li>Recognise the steps that lead from revenue to net profit on an income statement.</li>
          </ul>
        </div>

        <p>In the next activity, you'll learn about how companies recognise revenue.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s2-5')">← 2.5 Session review</button>
        <button class="nav-btn primary" onclick="showPage('s3-2')">Next: 3.2 Revenue →</button>
      </div>
    </div>

    <div class="page" id="page-s3-2">
      <div class="page-header">
        <div class="page-eyebrow">Session 3 · Income statement</div>
        <h1 class="page-title">3.2 Revenue</h1>
      </div>
      <div class="page-body">
        <p>Revenue is where the income statement begins. It represents the income a business earns from its ordinary activities. In the next presentation, Laila looks at how revenue is formally defined and when it should be recognised, which is not always the moment cash arrives.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Revenue</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>A key idea from the presentation is that revenue is recognised when a service or good has been delivered, not simply when cash changes hands. The scenarios below let you apply that principle directly. For each transaction, identify whether revenue should be recognised under accrual accounting, and what the impact on cash is.</p>

        <div class="quiz-header">
          <h2>Activity</h2>
        </div>
        <div class="quiz-body">
          <div class="q-block">
            <div class="q-text">
              <p>For each transaction identify whether we should recognise revenue under accrual accounting and the impact on cash.</p>
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Revenue</th>
                    <th>Cash</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A customer pays £300 upfront for a 3-month gym membership</td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                  </tr>
                  <tr>
                    <td>A customer attends a personal training session and pays £50 immediately after.</td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                  </tr>
                  <tr>
                    <td>A customer buys a £100 gift card but hasn't used it yet.</td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                  </tr>
                  <tr>
                    <td>A customer completes a corporate fitness workshop worth £500 but hasn't paid yet.</td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                    <td><input type="text" class="q-input-cell" placeholder="e.g. no or £..." /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="feedback-box" id="fb-3-2">
              <div class="fb-label">✓ Answers</div>
              <div class="fb-content">
                <table>
                  <thead>
                    <tr><th>Transaction</th><th>Revenue</th><th>Cash</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>A customer pays £300 upfront for a 3-month gym membership</td><td>No</td><td>£300</td></tr>
                    <tr><td>A customer attends a personal training session and pays £50 immediately after.</td><td>£50</td><td>£50</td></tr>
                    <tr><td>A customer buys a £100 gift card but hasn't used it yet.</td><td>No</td><td>£100</td></tr>
                    <tr><td>A customer completes a corporate fitness workshop worth £500 but hasn't paid yet.</td><td>£500</td><td>No</td></tr>
                  </tbody>
                </table>
                <p style="margin-top:0.75rem"><strong>Gym membership (£300 upfront)</strong><br>The cash has been received, but the service hasn't been delivered yet. The gym still owes the customer three months of access. Under accrual accounting, revenue is only recognised as each month passes.</p>
                <p><strong>Personal training session (£50)</strong><br>The service has been delivered and payment received immediately, so both revenue and cash are recognised at the same time.</p>
                <p><strong>Gift card (£100)</strong><br>Like the gym membership, cash has been received but no service delivered. Revenue cannot be recognised until the customer actually uses the card.</p>
                <p><strong>Corporate workshop (£500, unpaid)</strong><br>The service has been delivered, so revenue is recognised, but no cash has yet been received.</p>
              </div>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-2', this)">Submit &amp; see answers</button>
        </div>

        <p>In the next activity, we'll move down the income statement to look at how costs are recorded and when they should be recognised.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s3-1')">← 3.1 Introduction</button>
        <button class="nav-btn primary" onclick="showPage('s3-3')">Next: 3.3 Expenses →</button>
      </div>
    </div>

    <div class="page" id="page-s3-3">
      <div class="page-header">
        <div class="page-eyebrow">Session 3 · Income statement</div>
        <h1 class="page-title">3.3 Expenses</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>Generating revenue always comes at a cost. In the next presentation, Laila looks at how expenses are defined and when they should be recognised.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Expenses</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Now that you've heard about the matching principle, put it to the test.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>The two income statements below both contain an error relating to the matching principle. For each one, identify the error and explain how it should be corrected.</p>
            <div class="info-box" style="margin:1rem 0 0.5rem">
              <h2 style="font-size:1rem;margin-bottom:0.5rem">SouthKen Bakery — Year 1 Income Statement</h2>
              <table>
                <tbody>
                  <tr><td>Revenue</td><td>£160,000</td></tr>
                  <tr><td>Cost of goods sold</td><td>£100,000 <span style="font-weight:normal;color:var(--ink-soft)">(flour, sugar and packaging purchased in November, none yet sold by 31 December)</span></td></tr>
                  <tr><td><strong>Gross profit</strong></td><td><strong>£60,000</strong></td></tr>
                </tbody>
              </table>
            </div>
            <p>What is the error, and how should it be corrected?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="4"></textarea>
          <div class="feedback-box" id="fb-3-3-y1">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>The £100,000 of inventory purchased in November should not appear as an expense in Year 1 because none of it has yet helped to generate revenue. It remains unsold at 31 December. Under the matching principle, expenses are recognised in the same period as the revenues they helped generate. The £100,000 should sit on the balance sheet as an asset (inventory) until it is sold, at which point it becomes a cost of goods sold and is recognised as an expense.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-3-y1', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text">
            <div class="info-box" style="margin:0 0 0.5rem">
              <h2 style="font-size:1rem;margin-bottom:0.5rem">SouthKen Bakery — Year 2 Income Statement</h2>
              <table>
                <tbody>
                  <tr><td>Revenue</td><td>£200,000</td></tr>
                  <tr><td>Cost of goods sold</td><td>£40,000 <span style="font-weight:normal;color:var(--ink-soft)">(only includes purchases made during Year 2)</span></td></tr>
                  <tr><td><strong>Gross profit</strong></td><td><strong>£160,000</strong></td></tr>
                </tbody>
              </table>
            </div>
            <p>What is the error, and how should it be corrected?</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="4"></textarea>
          <div class="feedback-box" id="fb-3-3-y2">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>The cost of goods sold only includes new purchases (£40,000) but ignores the inventory that was actually used and sold during the year. The £100,000 of inventory carried over from Year 1 should be included as cost of goods sold in Year 2, since that is the period in which it helped generate revenue.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-3-y2', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>
      </div>

      <div class="page-body" style="margin-top:1.5rem">
        <p>In the next activity, we look at one particular type of expense that requires its own treatment: depreciation.</p>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s3-2')">← 3.2 Revenue</button>
        <button class="nav-btn primary" onclick="showPage('s3-4')">Next: 3.4 Depreciation →</button>
      </div>
    </div>

    <div class="page" id="page-s3-4">
      <div class="page-header">
        <div class="page-eyebrow">Session 3 · Income statement</div>
        <h1 class="page-title">3.4 Depreciation</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>In the previous activity, you saw how the matching principle determines when a cost should be recognised as an expense. Depreciation is a direct application of that same principle. It is a method used to spread the cost of a long-term asset across the periods in which it generates value. You'll learn more about this in the next presentation.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Depreciation</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>In the presentation, you saw how the matching principle means the cost of a long-term asset shouldn't be expensed all at once. Let's have a bit more practice at applying that idea now.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Imagine you are opening a new fashion retail store. You spend £100,000 on store fixtures and fittings (shelving, lighting, displays).</p>
            <p>You expect these to last five years, after which they will have a resale/scrap value of £100,000.</p>
            <p>Should the full £100,000 be recorded as an expense in Year 1 (keep in mind the 'matching principle' that you have just learned about)?</p>
          </div>
          <div class="mcq-options" id="mcq-s3-4-q1">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s3-4-q1')"><div class="mcq-radio"></div>Yes</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s3-4-q1')"><div class="mcq-radio"></div>No</div>
          </div>
          <div class="feedback-box" id="fb-3-4-q1">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>The correct answer is no. As you learned in the presentation on expenses, expensing the full cost upfront would be inconsistent with the matching principle. It would make Year 1 look less profitable than it really is, and make Years 2–5 look artificially more profitable than they are.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-4-q1', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text">
            <p>Using the straight-line depreciation formula that was shown in presentation, calculate the annual depreciation charge.</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your calculation here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-3-4-q2">
            <div class="fb-label">✓ Model answer</div>
            <div class="fb-content">
              <p>Annual depreciation = (Cost − Residual Value) / Useful Life.</p>
              <p>Straight-line depreciation divides the depreciable cost evenly across the asset's useful life. The residual value is subtracted first because that portion of the cost is expected to be recovered when the asset is eventually sold, so it doesn't need to be expensed. Thus, the correct calculation to use here is:</p>
              <p>Annual depreciation = (£100,000 – £10,000)/5 = £18,000 per year.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-4-q2', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text">
            <p>Your store generates steady profits each year. How should the cost of the store fit-out appear in the income statement each year? Your answer to the previous question should help with this.</p>
          </div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-3-4-q3">
            <div class="fb-label">✓ Model answer</div>
            <div class="fb-content">
              <p>Rather than a one-off £100,000 expense, each year's income statement absorbs £18,000, matching the cost to the period in which the fixtures are helping to generate revenue. Meanwhile, on the balance sheet, the asset's value reduces by £18,000 each year, as shown in the schedule below:</p>
              <table>
                <thead>
                  <tr><th>Year-end</th><th>Depreciation expense on the income statement (£)</th><th>Asset value on the balance sheet (£)</th></tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>18,000</td><td>82,000</td></tr>
                  <tr><td>2</td><td>18,000</td><td>64,000</td></tr>
                  <tr><td>3</td><td>18,000</td><td>46,000</td></tr>
                  <tr><td>4</td><td>18,000</td><td>28,000</td></tr>
                  <tr><td>5</td><td>18,000</td><td>10,000 (residual value)</td></tr>
                </tbody>
              </table>
              <p>In the next section, we bring revenue and costs together and work through the income statement step by step to calculate profit.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-4-q3', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s3-3')">← 3.3 Expenses</button>
        <button class="nav-btn primary" onclick="showPage('s3-5')">Next: 3.5 Calculating the profit →</button>
      </div>
    </div>

    <div class="page" id="page-s3-5">
      <div class="page-header">
        <div class="page-eyebrow">Session 3 · Income statement</div>
        <h1 class="page-title">3.5 Calculating the profit</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>So far in this session you have looked at revenue and how it is recognised, and at the costs a business incurs to generate it. In the next presentation, let's bring these together to show how the income statement is structured and how profit is calculated step by step.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Calclating the profit</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>In the presentation, you heard that profit isn't just one final number but rather a step-by-step process where costs are stripped away gradually, with each stage answering a different question about the business. To check your understanding, work through the example below. You may wish to refer back to the presentation to check you are doing the correct calculations at each stage.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Imagine you are analysing a retail business. Your task is to calculate its profit step-by-step and understand what each stage reveals. Use the figures below:</p>
            <ul style="list-style-type: disc;">
              <li>Revenue: £200,000</li>
              <li>Cost of Goods Sold: £120,000</li>
              <li>Operating Expenses: £50,000</li>
              <li>Interest Expense: £5,000</li>
              <li>Tax: £7,500</li>
            </ul>
          </div>
        </div>

        <div class="q-block">
          <div class="q-text"><p><strong>Layer 1: Gross profit</strong></p><p>What is the gross profit of the business?</p></div>
          <textarea class="q-textarea" placeholder="Write your calculation here…" rows="2"></textarea>
          <div class="feedback-box" id="fb-3-5-gp">
            <div class="fb-label">✓ Answer</div>
            <div class="fb-content"><p>Gross profit = £200,000 – £120,000 = <strong>£80,000</strong>.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-5-gp', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p>What does this tell you?</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-3-5-gp-why">
            <div class="fb-label">✓ Model answer</div>
            <div class="fb-content"><p>Gross profit strips away everything except the core production cost. It tells you how efficiently the business produces its product, and for a retailer like this one, the cost of goods sold is the purchase cost of the goods being resold.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-5-gp-why', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p><strong>Layer 2: Operating profit</strong></p><p>What is the operating profit of the business?</p></div>
          <textarea class="q-textarea" placeholder="Write your calculation here…" rows="2"></textarea>
          <div class="feedback-box" id="fb-3-5-op">
            <div class="fb-label">✓ Answer</div>
            <div class="fb-content"><p>Operating profit = £80,000 – £50,000 = <strong>£30,000</strong>.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-5-op', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p>What does this tell you?</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-3-5-op-why">
            <div class="fb-label">✓ Model answer</div>
            <div class="fb-content"><p>Operating profit shows how much the business earns from its core operations, before the effects of how it is financed and before tax. It is a useful figure for capturing core business performance.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-5-op-why', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p><strong>Layer 3: Net profit</strong></p><p>What is the net profit of the business?</p></div>
          <textarea class="q-textarea" placeholder="Write your calculation here…" rows="2"></textarea>
          <div class="feedback-box" id="fb-3-5-np">
            <div class="fb-label">✓ Answer</div>
            <div class="fb-content"><p>Net profit = £30,000 – £5,000 – £7,500 = <strong>£17,500</strong>.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-5-np', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p>What does this tell you?</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-3-5-np-why">
            <div class="fb-label">✓ Model answer</div>
            <div class="fb-content">
              <p>Net profit is what remains after every obligation has been met. Each layer above it tells a different part of the story: gross profit speaks to production efficiency. Operating profit tells you how well the business is run. And finally net profit shows you what shareholders can expect in return.</p>
              <p>This brings us to the end of the session. In the next activity, you will review what you've learned in this session.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-3-5-np-why', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s3-4')">← 3.4 Depreciation</button>
        <button class="nav-btn primary" onclick="showPage('s3-6')">Next: 3.6 Session review →</button>
      </div>
    </div>

    <div class="page" id="page-s3-6">
      <div class="page-header">
        <div class="page-eyebrow">Session 3 · Income statement</div>
        <h1 class="page-title">3.6 Session review</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>We have now reached the end of this session of this primer.</p>
        <p>In this session, you explored how the income statement works and the principles that determine when revenue and costs should be recorded.</p>
        <p>Let's now return to the learning outcomes outlined in the session introduction. To what extent do you feel you have achieved each of this session's learning outcomes?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="self-review">
          <div class="self-review-header">
            <div>Learning outcome</div>
            <div style="text-align:center">Confident</div>
            <div style="text-align:center">Need to review</div>
            <div style="text-align:center">Need support</div>
          </div>
          <div class="self-review-row">
            <div>Explain the purpose of the income statement</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Distinguish between revenue and expenses</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Calculate straight-line depreciation for a long-term asset</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Recognise the steps that lead from revenue to net profit on an income statement</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
        </div>

        <div class="q-block" style="margin-top:1.5rem">
          <div class="q-number">Timing feedback</div>
          <div class="q-text"><p>Was the estimated timing accurate?</p></div>
          <div class="mcq-options" id="mcq-s3-timing">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s3-timing')">
              <div class="mcq-radio"></div>
              It took less time to complete the tasks and exercises than estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s3-timing')">
              <div class="mcq-radio"></div>
              It took about the same amount of time to complete the tasks and exercises as estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s3-timing')">
              <div class="mcq-radio"></div>
              It took more time to complete the tasks and exercises than estimated
            </div>
          </div>
        </div>

        <div class="q-block">
          <div class="q-number">Open feedback</div>
          <div class="q-text"><p>Please provide feedback on the content covered.</p></div>
          <textarea class="q-textarea" placeholder="Your thoughts on this session…" rows="4"></textarea>
        </div>

        <div class="feedback-box" id="fb-s3-review" style="display:none">
          <div class="fb-label">✓ Submitted</div>
          <div class="fb-content">
            <p>Congratulations on finishing session three! In the next session, we will examine the third main financial statement: the cash flow statement.</p>
          </div>
        </div>

        <button class="submit-btn" onclick="toggleFeedback('fb-s3-review', this)">Submit session review</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s3-5')">← 3.5 Calculating the profit</button>
        <button class="nav-btn" onclick="showPage('s4-1')">Next: 4.1 Introduction →</button>
      </div>
    </div>

    <!-- SESSION 4 -->

    <div class="page" id="page-s4-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 4 · Cash Flow Statement</div>
        <h1 class="page-title">4.1 Introduction</h1>
      </div>
      <div class="page-body">
        <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
          <strong>Note</strong> — This session is currently a bit light; we may add more exercises in due course.
        </div>
        <p>Welcome to session four!&nbsp;In this session, we turn to the final core financial statement: the cash flow statement. You'll explore why cash and profit can tell very different stories about a business, and what it means for a company's financial health.</p>
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
            <li>Distinguish between the three sections of the cash flow statement and what should be included in each&nbsp;</li>
            <li>Identify the sources of a company's cash flows and what these imply about its financial health.</li>
          </ul>
        </div>

        <p>In the next activity, you'll learn about the structure of the cash flow statement.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s3-6')">← 3.6 Session review</button>
        <button class="nav-btn primary" onclick="showPage('s4-2')">Next: 4.2 Structure of cash flow statements →</button>
      </div>
    </div>

    <div class="page" id="page-s4-2">
      <div class="page-header">
        <div class="page-eyebrow">Session 4 · Cash Flow Statement</div>
        <h1 class="page-title">4.2 Structure of cash flow statements</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>The cash flow statement is built around three distinct sections, each answering a specific question about how a business generates and uses cash. In the next presentation, Laila walks through each one in turn.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Structure of cash flow statements</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Now test your understanding in the next exercise.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Imagine you are reviewing a company's cash movements for the year. Your task is to classify each cash flow and interpret what it means.</p>
            <p>Put each item into the correct category.</p>
          </div>
          <div class="categorize-grid">
            <div class="categorize-item" id="cat4-customers">
              <span class="cat-label">Cash received from customers</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-customers')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-customers')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-customers')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-suppliers">
              <span class="cat-label">Cash paid to suppliers</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-suppliers')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-suppliers')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-suppliers')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-salaries">
              <span class="cat-label">Salaries paid</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-salaries')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-salaries')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-salaries')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-machinery">
              <span class="cat-label">Purchase of new machinery</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-machinery')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-machinery')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-machinery')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-disposal">
              <span class="cat-label">Disposal of business operations</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-disposal')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-disposal')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-disposal')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-loan-recv">
              <span class="cat-label">Bank loan received</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-loan-recv')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-loan-recv')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-loan-recv')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-loan-rep">
              <span class="cat-label">Loan repayment</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-loan-rep')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-loan-rep')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-loan-rep')">Financing</div>
              </div>
            </div>
            <div class="categorize-item" id="cat4-equity">
              <span class="cat-label">Equity issuance</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat4-equity')">Operating</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-equity')">Investing</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat4-equity')">Financing</div>
              </div>
            </div>
          </div>
          <div class="feedback-box" id="fb-4-2-cat">
            <div class="fb-label">✓ Answers</div>
            <div class="fb-content">
              <p><strong>Operating activities:</strong> Cash received from customers, Cash paid to suppliers, Salaries paid</p>
              <p><strong>Investing activities:</strong> Purchase of new machinery, Disposal of business operations</p>
              <p><strong>Financing activities:</strong> Bank loan received, Loan repayment, Equity issuance</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-2-cat', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
            <strong>Note</strong> — The following questions are still to be checked/finalised.
          </div>
          <div class="q-text">
            <p>Now that you have sorted the cash flows into their correct sections, test your understanding of the three main types of activities covered on a cash flow statement a little further.</p>
            <p>Most companies use the indirect method to present operating activities. What does this method start from?</p>
          </div>
          <div class="mcq-options" id="mcq-4-2-q2">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q2')"><div class="mcq-radio"></div>The total cash collected from customers during the year</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q2')"><div class="mcq-radio"></div>Net profit, adjusted for non-cash items and working capital movements</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q2')"><div class="mcq-radio"></div>The opening cash balance from the previous year</div>
          </div>
          <div class="feedback-box" id="fb-4-2-q2">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content"><p>The indirect method starts from net profit and works backwards, adjusting for non-cash items like depreciation and for changes in working capital.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-2-q2', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
            <strong>Note</strong> — The following question is still to be checked/finalised.
          </div>
          <div class="q-text">
            <p>A company buys a new piece of manufacturing machinery for £100,000. How does this cash outflow appear in the cash flow statement?</p>
          </div>
          <div class="mcq-options" id="mcq-4-2-q3">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q3')"><div class="mcq-radio"></div>As a £100,000 expense in operating activities</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q3')"><div class="mcq-radio"></div>As a £100,000 outflow in investing activities</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q3')"><div class="mcq-radio"></div>As a £100,000 outflow in financing activities</div>
          </div>
          <div class="feedback-box" id="fb-4-2-q3">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content"><p>The full £100,000 appears in investing activities as the purchase of a long-term asset. Only the annual depreciation charge appears on the income statement, not the full purchase price. This is one of the key reasons profit and cash can diverge.</p></div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-2-q3', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
            <strong>Note</strong> — The following question is still to be checked/finalised.
          </div>
          <div class="q-text">
            <p>A company issues new shares and uses the proceeds to repay an existing bank loan. Where would both of these appear in the cash flow statement?</p>
          </div>
          <div class="mcq-options" id="mcq-4-2-q4">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q4')"><div class="mcq-radio"></div>Operating activities</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q4')"><div class="mcq-radio"></div>Investing activities</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-4-2-q4')"><div class="mcq-radio"></div>Financing activities</div>
          </div>
          <div class="feedback-box" id="fb-4-2-q4">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>Both sit within financing activities, which captures cash flows between the business and its investors and lenders.</p>
              <p>Thank you for your answers. In the next activity, we'll consider an important question: is all cash equal?</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-2-q4', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s4-1')">← 4.1 Introduction</button>
        <button class="nav-btn primary" onclick="showPage('s4-3')">Next: 4.3 Is all cash equal? →</button>
      </div>
    </div>

    <div class="page" id="page-s4-3">
      <div class="page-header">
        <div class="page-eyebrow">Session 4 · Cash Flow Statement</div>
        <h1 class="page-title">4.3 Is all cash equal?</h1>
      </div>
      <div class="page-body">
        <p>Now that you understand how the cash flow statement is structured, in the next presentation you'll see that where cash comes from matters just as much as how much of it there is.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Is all cash equal?</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>In the next activity, you'll apply what you've just learned to a real company's cash flow statement.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s4-2')">← 4.2 Structure of cash flow statements</button>
        <button class="nav-btn primary" onclick="showPage('s4-4')">Next: 4.4 Examining a cash flow statement →</button>
      </div>
    </div>

    <div class="page" id="page-s4-4">
      <div class="page-header">
        <div class="page-eyebrow">Session 4 · Cash Flow Statement</div>
        <h1 class="page-title">4.4 Examining a cash flow statement</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>Explore the <a href="https://www.cocacolaep.com/assets/Global/Investors/2025-Annual-Report/CCEP-Annual-Report-and-Form-20-F-2025.pdf" target="_blank" style="color:var(--accent)">Cash Flow Statement of Coca-Cola Europacific Partners</a>, world's largest independent Coca-Cola bottler, page 213 in the PDF or 211 of the report.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text"><p>Is operating cash flow positive? Is the core business generating real cash?</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-4-3-1-q1">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>Net cash flow from operations is positive for 2025 (€11m), but was negative in 2024 (€137m).</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-3-1-q1', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p>What did the company spend money on in investing activities? Is it growing or maintaining?</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-4-3-1-q2">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>Under the investing section, the company lists €15m investment in subsidiaries for 2025 and €567m for 2024. The much larger 2024 figure was primarily due to an investment writedown rather than ongoing capital expenditure.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-3-1-q2', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>

        <div class="q-block">
          <div class="q-text"><p>Did the company pay dividends or repay loans?</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="3"></textarea>
          <div class="feedback-box" id="fb-4-3-1-q3">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>In 2025 the company paid €386m in dividends and repaid €1,750m in borrowings (listed under financing activities), plus €141m in interest. In 2024 the figures were €4,050m in dividends, €3,650m in loan repayments, and €154m in interest.</p>
            </div>
          </div>
          <button class="submit-btn" onclick="toggleFeedback('fb-4-3-1-q3', this)" style="margin-top:1rem">Submit &amp; see feedback</button>
        </div>
      </div>

      <div class="page-body" style="margin-top:1.5rem">
        <p>This brings us to the end of the session. In the next activity, you will review what you’ve learned in this session.</p>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s4-3')">← 4.3 Is all cash equal?</button>
        <button class="nav-btn primary" onclick="showPage('s4-5')">Next: 4.5 Session review →</button>
      </div>
    </div>

    <div class="page" id="page-s4-5">
      <div class="page-header">
        <div class="page-eyebrow">Session 4 · Cash Flow Statement</div>
        <h1 class="page-title">4.5 Session review</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>We have now reached the end of this session of this primer.</p>
        <p>In this session, you explored the cash flow statement and what it can reveal about a business that the income statement alone cannot.</p>
        <p>Let's now return to the learning outcomes outlined in the session introduction. To what extent do you feel you have achieved each of this session's learning outcomes?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="self-review">
          <div class="self-review-header">
            <div>Learning outcome</div>
            <div style="text-align:center">Confident</div>
            <div style="text-align:center">Need to review</div>
            <div style="text-align:center">Need support</div>
          </div>
          <div class="self-review-row">
            <div>Distinguish between the three sections of the cash flow statement and what should be included in each</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Identify the sources of a company's cash flows and what these imply about its financial health</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
        </div>

        <div class="q-block" style="margin-top:1.5rem">
          <div class="q-number">Timing feedback</div>
          <div class="q-text"><p>Was the estimated timing accurate?</p></div>
          <div class="mcq-options" id="mcq-s4-timing">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s4-timing')">
              <div class="mcq-radio"></div>
              It took less time to complete the tasks and exercises than estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s4-timing')">
              <div class="mcq-radio"></div>
              It took about the same amount of time to complete the tasks and exercises as estimated
            </div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s4-timing')">
              <div class="mcq-radio"></div>
              It took more time to complete the tasks and exercises than estimated
            </div>
          </div>
        </div>

        <div class="q-block">
          <div class="q-number">Open feedback</div>
          <div class="q-text"><p>Please provide feedback on the content covered.</p></div>
          <textarea class="q-textarea" placeholder="Your thoughts on this session…" rows="4"></textarea>
        </div>

        <div class="feedback-box" id="fb-s4-review" style="display:none">
          <div class="fb-label">✓ Submitted</div>
          <div class="fb-content">
            <p>Congratulations on finishing session three! In the next session, we turn to a different area of accounting, one focused not on communicating with the outside world, but on helping managers make better decisions from within.</p>
          </div>
        </div>

        <button class="submit-btn" onclick="toggleFeedback('fb-s4-review', this)">Submit session review</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s4-4')">← 4.4 Examining a cash flow statement</button>
        <button class="nav-btn" onclick="showPage('s5-1')">Next: 5.1 Introduction →</button>
      </div>
    </div>

    <!-- SESSION 5 -->

    <div class="page" id="page-s5-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.1 Introduction</h1>
      </div>
      <div class="page-body">
        <p>Welcome to session five! In this session, we shift focus from financial reporting to management accounting. This branch of accounting is concerned less with communicating to the outside world, and more with helping managers make better decisions from within the business</p>
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
            <li>Explain what management accounting is and how it differs from financial accounting</li>
            <li>Classify costs by allocation and by behaviour</li>
            <li>Calculate contribution margin and use it to determine a break-even point</li>
            <li>Apply management accounting principles to short-term decision-making</li>
          </ul>
        </div>

        <p>In the next activity, we'll consider why management accounting is important in the first place.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s4-5')">← 4.5 Session review</button>
        <button class="nav-btn primary" onclick="showPage('s5-2')">Next: 5.2 Why do we need management accounting? →</button>
      </div>
    </div>

    <div class="page" id="page-s5-2">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.2 Why do we need management accounting?</h1>
      </div>
      <div class="page-body">
        <p>As you have learned, financial accounting helps stakeholders of the business understand how it is performing. But do the kinds of statements you have examined so far provide enough information for the people running the business from within? In the next presentation, Laila explores what a standard income statement cannot tell you, and what becomes visible when you look at the same numbers in more detail.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Why do we need management accounting?</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>In the next activity, we start looking at some of the ways in which costs are classified.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-1')">← 5.1 Introduction</button>
        <button class="nav-btn primary" onclick="showPage('s5-3')">Next: 5.3 Cost classification: Direct vs indirect →</button>
      </div>
    </div>

    <div class="page" id="page-s5-3">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.3 Cost classification by allocation: Direct vs indirect</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>To manage a business effectively, you first need to understand its costs and how to classify them. In the next presentation, you'll learn about a key distinction in management accounting: whether a cost can be traced to a specific product or service (a direct cost), or whether it is shared across the business more broadly (an indirect cost).</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Cost classification by allocation: Direct vs Indirect</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>Now check your understanding of this distinction by completing the exercise below.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <p>Sort the following costs into the correct category based on what you have just learned.</p>
          </div>
          <div class="categorize-grid">
            <div class="categorize-item" id="cat5-rawmat">
              <span class="cat-label">Raw materials</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-rawmat')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-rawmat')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-labour">
              <span class="cat-label">Direct labour wages</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-labour')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-labour')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-components">
              <span class="cat-label">Component parts</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-components')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-components')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-packaging">
              <span class="cat-label">Packaging per unit</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-packaging')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-packaging')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-fabric">
              <span class="cat-label">Fabric for a garment</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-fabric')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-fabric')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-rent">
              <span class="cat-label">Factory rent</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-rent')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-rent')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-electricity">
              <span class="cat-label">Building electricity</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-electricity')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-electricity')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-supervisor">
              <span class="cat-label">Supervisor's salary</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-supervisor')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-supervisor')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-depreciation">
              <span class="cat-label">Machinery depreciation</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-depreciation')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-depreciation')">Indirect costs</div>
              </div>
            </div>
            <div class="categorize-item" id="cat5-admin">
              <span class="cat-label">Office administration</span>
              <div class="cat-options">
                <div class="cat-opt" onclick="selectCat(this, 'cat5-admin')">Direct costs</div>
                <div class="cat-opt" onclick="selectCat(this, 'cat5-admin')">Indirect costs</div>
              </div>
            </div>
          </div>
          <div class="feedback-box" id="fb-5-3-sort">
            <div class="fb-label">✓ Answers</div>
            <div class="fb-content">
              <p><strong>Direct costs:</strong> Raw materials, Direct labour wages, Component parts, Packaging per unit, Fabric for a garment</p>
              <p><strong>Indirect costs:</strong> Factory rent, Building electricity, Supervisor's salary, Machinery depreciation, Office administration</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-5-3-sort', this)">Submit &amp; see answers</button>
      </div>

      <div class="page-body" style="margin-top:1.5rem">
        <p>Direct costs are made up of three distinct components. In the next presentation, let's consider each one in turn.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">The three components of direct cost</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>It is worth noting that the line between direct and indirect is not always as clean in practice as it appears in a textbook. A cost that can be measured and traced in one business may be impossible to trace in another. In the next activity, we turn to a second important way of classifying costs: by how they behave.</p>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-2')">← 5.2 Why do we need management accounting?</button>
        <button class="nav-btn primary" onclick="showPage('s5-4')">Next: 5.4 Cost classification: Fixed vs variable →</button>
      </div>
    </div>

    <div class="page" id="page-s5-4">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.4 Cost classification by behaviour: Fixed vs variable</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>You have seen how costs can be classified by whether they can be traced to a specific product. There is a second equally important way to think about costs: how they behave as the volume of activity changes. In the next presentation, let's examine the distinction between fixed and variable costs using the same bakery context from the previous activity.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Cost classification by behaviour: Fixed vs Variable</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>The presentation introduced the core distinction, but the most important implications only become clear when you see the numbers move. Use the interactive tool below to explore how the bakery's costs respond to changes in output and to changes in the cost structure itself.</p>
        <p>Use the three sliders in the tool to explore the questions set out further below. (<em>Note:</em> the cost figures in the simulator are designed to illustrate how fixed and variable costs behave, not to reflect a realistic bakery operation.)</p>

        <div class="video-placeholder" style="aspect-ratio:unset;height:200px;padding:1.5rem 0">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>
            <div style="margin-bottom:0.75rem;font-size:0.9rem">Fixed versus variable costs interactive tool</div>
            <a href="https://bespoke-learning-next.vercel.app/accounting-primer-mba-man/fixed-variable-costs" target="_blank" style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:0.45rem 1rem;border-radius:6px;font-size:0.82rem;font-weight:600;text-decoration:none;margin-bottom:0.75rem">Open tool in new tab ↗</a>
            <div class="video-label-pending">This tool will be embedded directly in Canvas — the button above opens it in a new tab for now.</div>
          </div>
        </div>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text">
            <ol>
              <li>Keep the variable cost and fixed costs at their default values. Move the output slider from 400 to 1,500 loaves. Total fixed costs don't change, so why does the fixed cost per loaf fall?</li>
              <li>With output set to 400 loaves, drag the variable cost per loaf slider up to £1.40. What happens to the total fixed cost figure? What does this tell you about the relationship between fixed and variable costs?</li>
              <li>What is the total cost at 400 loaves? Now increase output to 800 loaves. How much has total cost risen, and why does it rise by less than double?</li>
            </ol>
          </div>
          <textarea class="q-textarea" placeholder="Write your answers here…" rows="6"></textarea>
          <div class="feedback-box" id="fb-5-4">
            <div class="fb-label">✓ Model answers</div>
            <div class="fb-content">
              <p><strong>1.</strong> Average fixed cost per loaf falls because you're spreading the same total fixed cost over more loaves. In other words, each loaf carries a smaller share of that burden as more loaves are produced.</p>
              <p><strong>2.</strong> When you drag the variable cost per loaf up to £1.40 (with output at 400 loaves), the total fixed cost figure doesn't change at all. No matter how high or low you set the variable cost, fixed costs remain completely unaffected.</p>
              <p><strong>3.</strong> The total costs at 400 loaves are £10,400 and they shift to 10,800 at 800 loaves. Note that fixed costs don't change when output increases, only the variable part doubles.</p>
              <p>In the next activity, you'll start to apply your growing understanding of costs to some short-term decision making scenarios.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-5-4', this)">Submit &amp; see answers</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-3')">← 5.3 Cost classification: Direct vs indirect</button>
        <button class="nav-btn primary" onclick="showPage('s5-5')">Next: 5.5 Short-term decision making →</button>
      </div>
    </div>

    <div class="page" id="page-s5-5">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.5 Short-term decision making</h1>
      </div>
      <div class="page-body">
        <p>You now have the tools to classify costs by how they behave. In the next presentation, Laila introduces how this understanding feeds directly into one of the most practical areas of management accounting: making decisions in the short term.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">Short-term decision-making</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>The presentation outlined four types of short-term decision a business commonly faces. In the activities that follow, you will work through a scenario illustrating each one. In the next activity, you will tackle the first of these: the special order decision.</p>
      </div>
      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-4')">← 5.4 Cost classification: Fixed vs variable</button>
        <button class="nav-btn primary" onclick="showPage('s5-5-1')">Next: 5.5.1 The special order →</button>
      </div>
    </div>

    <div class="page" id="page-s5-5-1">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.5.1 Short-term decisions: The special order</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>A hotel chain wants 5,000 branded notebooks at £14 each. Your normal price is £20. Your variable cost is £12.</p>
        <p>Do you accept?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text"><p>What would you do? Submit your reflections below, then read the feedback afterwards.</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="4"></textarea>
          <div class="feedback-box" id="fb-5-5-1">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>Your instinct might be to say no. Perhaps £14 feels too cheap or too damaging to the brand. But if the business has spare capacity, the relevant question is not whether £14 covers all costs. It is whether £14 covers the additional costs of fulfilling the order. It does, by £2 per unit. That is £10,000 of contribution that would not otherwise exist:</p>
              <table style="margin:0.5rem 0 0.75rem">
                <tbody>
                  <tr><td>Special order price</td><td style="padding-left:2rem">£14</td></tr>
                  <tr><td>Variable cost</td><td style="padding-left:2rem">(£12)</td></tr>
                  <tr><td>Contribution per unit</td><td style="padding-left:2rem">£2</td></tr>
                  <tr><td>Order size</td><td style="padding-left:2rem">5,000 units</td></tr>
                  <tr><td><strong>Total contribution</strong></td><td style="padding-left:2rem"><strong>£10,000</strong></td></tr>
                </tbody>
              </table>
              <p>If spare capacity exists, then accept.</p>
              <p>In the next activity, you will work through the make or buy decision.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-5-5-1', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-5')">← 5.5 Short-term decision making</button>
        <button class="nav-btn primary" onclick="showPage('s5-5-2')">Next: 5.5.2 The make or buy decision →</button>
      </div>
    </div>

    <div class="page" id="page-s5-5-2">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.5.2 The make or buy decision</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>Meet Richardson's, a family-run bakery based in Yorkshire, now in its third generation. Richardson's produces a range of artisan preserves: jams, marmalades and chutneys that are sold alongside its baked goods in the shop and supplied to a handful of local delicatessens.</p>
        <p>To make its preserves, Richardson's currently produces its own glass jars in a small on-site facility using a semi-automated moulding machine the family bought outright several years ago. A regional packaging supplier has approached them offering to supply equivalent jars for £1.20 per unit. Richardson's produces 30,000 jars per year.</p>
        <p>The family's first instinct is to run the numbers on what it currently costs to make each jar:</p>
        <table style="margin-bottom:1.5rem">
          <thead><tr><th>Cost element</th><th>Cost per unit</th></tr></thead>
          <tbody>
            <tr><td>Raw materials (sand, soda ash, cullet)</td><td>£0.42</td></tr>
            <tr><td>Direct labour (part-time operative)</td><td>£0.28</td></tr>
            <tr><td>Variable energy costs</td><td>£0.15</td></tr>
            <tr><td>Allocated fixed overhead (depreciation, space, insurance)</td><td>£0.55</td></tr>
            <tr><td><strong>Total cost per unit</strong></td><td><strong>£1.40</strong></td></tr>
          </tbody>
        </table>
        <p>The family's initial reaction is to outsource it. It seems this would save £0.20 per jar and free up the operative for other work. That is £6,000 saved per year. It seems obvious. But is it correct?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text"><p>Is the family's initial reaction right? Share your reflections below, then read the feedback.</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="4"></textarea>
          <div class="feedback-box" id="fb-5-5-2">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>The correct approach compares the supplier price to the avoidable costs of making it internally, the costs that genuinely disappear if you stop making it. Fixed costs that remain regardless, like the factory space, the supervisory salaries and the equipment already owned, are irrelevant to the decision.</p>
              <p>Let's look at that £0.55 fixed overhead allocation. It includes depreciation on the moulding machine, which the family already owns outright and cannot sell for meaningful value. It also includes a share of the building's insurance and rates, costs that continue whether the machine runs or not.</p>
              <p>None of these costs go away if Richardson's stops making jars. They are not avoidable. The relevant comparison is:</p>
              <table>
                <thead><tr><th>Avoidable costs</th><th>Cost per unit</th></tr></thead>
                <tbody>
                  <tr><td>Raw materials (sand, soda ash, cullet)</td><td>£0.42</td></tr>
                  <tr><td>Direct labour (part-time operative)</td><td>£0.28</td></tr>
                  <tr><td>Variable energy costs</td><td>£0.15</td></tr>
                  <tr><td><strong>Total cost per unit</strong></td><td><strong>£0.85</strong></td></tr>
                </tbody>
              </table>
              <p>The avoidable cost of making jars in-house is £0.85. The supplier wants £1.20. Richardson's should keep making its own jars: it is £0.35 per unit cheaper to do so, saving £10,500 per year compared to outsourcing.</p>
              <p>In the next activity, you will work through a continue or discontinue decision.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-5-5-2', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-5-1')">← 5.5.1 The special order</button>
        <button class="nav-btn primary" onclick="showPage('s5-5-3')">Next: 5.5.3 Continue or discontinue? →</button>
      </div>
    </div>

    <div class="page" id="page-s5-5-3">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.5.3 Continue or discontinue?</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>Pinnacle Consumer Goods is a listed consumer products company with three divisions:</p>
        <ol>
          <li>Personal Care</li>
          <li>Home Cleaning</li>
          <li>Nutritional Supplements.</li>
        </ol>
        <p>The Supplements division was acquired five years ago as part of a strategic push into health and wellness. It has never quite delivered on its promise, and at the annual strategy review the board is under pressure from shareholders to improve returns.</p>
        <p>The divisional profit and loss tells an uncomfortable story:</p>
        <table style="margin-bottom:1.5rem">
          <thead>
            <tr><th></th><th>Personal care</th><th>Home cleaning</th><th>Nutritional supplements</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr><td>Revenue</td><td>£42m</td><td>£38m</td><td>£11m</td><td>£91m</td></tr>
            <tr><td>Variable costs</td><td>(£18m)</td><td>(£16m)</td><td>(£8m)</td><td>(£42m)</td></tr>
            <tr><td>Contribution</td><td>£24m</td><td>£22m</td><td>£3m</td><td>£49m</td></tr>
            <tr><td>Allocated fixed costs</td><td>(£12m)</td><td>(£12m)</td><td>(£12m)</td><td>(£36m)</td></tr>
            <tr><td><strong>Net profit / (loss)</strong></td><td><strong>£12m</strong></td><td><strong>£10m</strong></td><td><strong>(£9m)</strong></td><td><strong>£13m</strong></td></tr>
          </tbody>
        </table>
        <p><em>Note:</em> The allocated fixed costs represent Pinnacle's shared corporate overhead. These are costs like the group head office, technology infrastructure and central functions, which are divided equally across the three divisions.</p>
        <p>The Nutritional Supplements division is loss-making to the tune of £9m. The board has been presented with a recommendation from a strategy consultancy to close it, reallocate resources to the two performing divisions, and return the freed-up capital to shareholders.</p>
        <p>Should the business divest from the division?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text"><p>Share your reflections below, then look at the feedback.</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="4"></textarea>
          <div class="feedback-box" id="fb-5-5-3">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>Before the board votes, the CFO asks a simple question. What costs actually disappear if Nutritional Supplements is closed?</p>
              <p>The variable costs of £8m disappear (like raw material inputs, contract manufacturing fees, packaging and distribution costs specific to the supplements range). Those are genuinely avoidable. But the £12m of fixed costs allocated to Supplements represents Pinnacle's corporate overhead, and none of it goes away when supplements is closed. Every pound of it is reallocated across Personal Care and Home Cleaning.</p>
              <p>Here is what the picture looks like after closing supplements:</p>
              <table>
                <thead>
                  <tr><th></th><th>Personal care</th><th>Home cleaning</th><th>Total</th></tr>
                </thead>
                <tbody>
                  <tr><td>Revenue</td><td>£42m</td><td>£38m</td><td>£80m</td></tr>
                  <tr><td>Variable costs</td><td>(£18m)</td><td>(£16m)</td><td>(£34m)</td></tr>
                  <tr><td>Contribution</td><td>£24m</td><td>£22m</td><td>£46m</td></tr>
                  <tr><td>Allocated fixed costs</td><td>(£18m)</td><td>(£18m)</td><td>(£36m)</td></tr>
                  <tr><td><strong>Net profit / (loss)</strong></td><td><strong>£6m</strong></td><td><strong>£4m</strong></td><td><strong>£10m</strong></td></tr>
                </tbody>
              </table>
              <p>Total group profit falls from £13m to £10m. The board could have just made the business £3m worse off, precisely equal to the contribution the supplements division was generating before closure (if the allocated fixed costs were taken off).</p>
              <p>The £9m loss that looked so damaging was almost entirely a function of £12m of shared corporate overhead being allocated to a division too small to absorb it comfortably. Strip out that allocation, and supplements was contributing £3m towards the group's fixed cost base.</p>
              <p>In the next activity, you will work through the limiting factor decision.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-5-5-3', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-5-2')">← 5.5.2 The make or buy decision</button>
        <button class="nav-btn primary" onclick="showPage('s5-5-4')">Next: 5.5.4 Limiting factors →</button>
      </div>
    </div>

    <div class="page" id="page-s5-5-4">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.5.4 Limiting factors</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>Lumière is a premium skincare brand which is sold through high-end department stores and online. The business produces three product lines: a daily moisturiser, a vitamin C serum and an overnight repair mask.</p>
        <p>All three are manufactured at Lumière's production facility. At the facility, a specialist blending and filling line is used to mix and bottle every product. This represents the single constrained resource in the operation.</p>
        <p>The blending line can run for a maximum of 6,000 hours per quarter. Consumer demand, particularly through the online channel, consistently outstrips what the line can produce. The head of finance has been asked to determine the optimal production mix for the coming quarter to maximise contribution.</p>
        <table style="margin-bottom:1.5rem">
          <thead>
            <tr><th></th><th>Moisturiser</th><th>Vitamin C serum</th><th>Overnight mask</th></tr>
          </thead>
          <tbody>
            <tr><td>Selling price per unit</td><td>£48</td><td>£65</td><td>£54</td></tr>
            <tr><td>Variable cost per unit</td><td>£18</td><td>£22</td><td>£16</td></tr>
            <tr><td><strong>Contribution per unit</strong></td><td><strong>£30</strong></td><td><strong>£43</strong></td><td><strong>£38</strong></td></tr>
            <tr><td>Blending line hours per unit</td><td>0.5 hours</td><td>1.2 hours</td><td>0.8 hours</td></tr>
            <tr><td>Maximum quarterly demand</td><td>8,000 units</td><td>4,000 units</td><td>5,000 units</td></tr>
          </tbody>
        </table>
        <p>Contribution per unit is simply the selling price minus the variable cost per unit. This is the amount each sale contributes towards covering fixed costs and, once those are covered, generating profit. You will explore this concept in more depth in the next activity on break-even analysis, so this will prepare you for thinking about that concept further. Also bear in mind that when a scarce resource exists, the correct approach is not to rank products by contribution per unit, but by contribution per unit of the scarce resource (contribution margin per limiting factor), which in this case is the contribution per blending line hour.</p>
        <p>The marketing director's instinct is to prioritise the vitamin C serum, which has the highest contribution per unit at £43 and is the brand's most talked-about product. Are they right? You might want to rewatch the very end of the presentation on Short-term decision making for a hint.</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="q-block">
          <div class="q-text"><p>Share your reflections below, then read the feedback.</p></div>
          <textarea class="q-textarea" placeholder="Write your answer here…" rows="4"></textarea>
          <div class="feedback-box" id="fb-5-5-4">
            <div class="fb-label">✓ Feedback</div>
            <div class="fb-content">
              <p>Ranking by contribution margin per blending line hour changes the view entirely:</p>
              <table>
                <thead>
                  <tr><th></th><th>Moisturiser</th><th>Vitamin C serum</th><th>Overnight mask</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Contribution per unit</strong></td><td>£30</td><td>£43</td><td>£38</td></tr>
                  <tr><td><strong>Blending line hours per unit</strong></td><td>0.5 hours</td><td>1.2 hours</td><td>0.8 hours</td></tr>
                  <tr><td><strong>Contribution per blending line hour</strong></td><td>£60</td><td>£35.83</td><td>£47.50</td></tr>
                  <tr><td><strong>Ranking</strong></td><td>1</td><td>3</td><td>2</td></tr>
                </tbody>
              </table>
              <p>The moisturiser (the cheapest) is actually the most valuable use of the blending line's time. It generates £60 of contribution for every hour the line runs, far ahead of the serum that everyone assumed should take priority.</p>
              <p>The serum, despite its premium positioning and high per-unit margin, drops to last place because it is so demanding of the one resource the business cannot expand in the short term.</p>
              <p>With the correct ranking established, Lumière should allocate blending line hours in order of priority, subject to maximum quarterly demand. The company will not be able to produce any units of the Vitamin C serum as the line hours are fully consumed by the moisturiser and overnight mask.</p>
              <table>
                <thead>
                  <tr><th>Priority</th><th>Product</th><th>Line hours allocated</th><th>Units produced</th><th>Contribution</th></tr>
                </thead>
                <tbody>
                  <tr><td>1st</td><td>Moisturiser</td><td>4,000</td><td>8,000</td><td>£240,000</td></tr>
                  <tr><td>2nd</td><td>Overnight Mask</td><td>2,000</td><td>2,500</td><td>£95,000</td></tr>
                  <tr><td><strong>Total</strong></td><td></td><td>6,000</td><td></td><td><strong>£335,000</strong></td></tr>
                </tbody>
              </table>
              <p>That brings us to the end of these scenarios. In the next activity, we turn to break-even analysis, which builds directly on the cost behaviour and contribution thinking you have developed in this session.</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" onclick="toggleFeedback('fb-5-5-4', this)">Submit &amp; see feedback</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-5-3')">← 5.5.3 Continue or discontinue?</button>
        <button class="nav-btn primary" onclick="showPage('s5-6')">Next: 5.6 The break-even formula →</button>
      </div>
    </div>

    <div class="page" id="page-s5-6">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.6 The break-even formula</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>The short-term decision activities you have just worked through depended on understanding the distinction between fixed and variable costs. That same distinction is important when conducting a break-even analysis, one of the most practical tools in management accounting. In the next presentation, you'll learn more about the contribution margin and how it is used to calculate the point at which a business covers all its costs and begins to generate profit.</p>

        <div class="video-placeholder">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
            <div style="margin-bottom:0.4rem">The break-even formula</div>
            <div class="video-label-pending">Video to be added</div>
          </div>
        </div>

        <p>The interactive tool below is set up using the Innocent Drinks example you've just heard about. At the default settings you should recognise the numbers from the presentation. Try adjusting the four sliders — fixed costs, selling price, variable cost per bottle and forecast sales — to see how each one shifts the break-even point and the margin of safety. Then complete the exercise that follows.</p>

        <div class="video-placeholder" style="aspect-ratio:unset;height:200px;padding:1.5rem 0">
          <div class="video-inner">
            <div class="video-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg></div>
            <div style="margin-bottom:0.75rem;font-size:0.9rem">Break-even calculator tool</div>
            <a href="https://bespoke-learning-next.vercel.app/accounting-primer-mba-man/break-even-formula" target="_blank" style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:0.45rem 1rem;border-radius:6px;font-size:0.82rem;font-weight:600;text-decoration:none;margin-bottom:0.75rem">Open tool in new tab ↗</a>
            <div class="video-label-pending">This tool will be embedded directly in Canvas — the button above opens it in a new tab for now.</div>
          </div>
        </div>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body" style="border-top:3px solid var(--gold)">
        <div style="background:var(--gold-light);border:1px solid #e8c86a;border-radius:6px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:#7a5a1a">
          <strong>Provisional</strong> — Questions and feedback still to be added.
        </div>
        <p style="color:var(--ink-soft);font-size:0.93rem">This brings us to the end of the session. In the next activity, you will review what you've learned in this session.</p>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-5-4')">← 5.5.4 Limiting factors</button>
        <button class="nav-btn primary" onclick="showPage('s5-7')">Next: 5.7 Session review →</button>
      </div>
    </div>

    <div class="page" id="page-s5-7">
      <div class="page-header">
        <div class="page-eyebrow">Session 5 · Management accounting: Part 1</div>
        <h1 class="page-title">5.7 Session review</h1>
      </div>

      <div class="page-body" style="margin-bottom:1.5rem">
        <p>We have now reached the end of this session of this primer.</p>
        <p>In this session, you explored how management accounting equips the people running a business with useful cost analysis and decision-making tools.</p>
        <p>Let's now return to the learning outcomes outlined in the session introduction. To what extent do you feel you have achieved each of this session's learning outcomes?</p>
      </div>

      <div class="quiz-header">
        <h2>Activity</h2>
      </div>
      <div class="quiz-body">
        <div class="self-review">
          <div class="self-review-header">
            <div>Learning outcome</div>
            <div style="text-align:center">Confident</div>
            <div style="text-align:center">Need to review</div>
            <div style="text-align:center">Need support</div>
          </div>
          <div class="self-review-row">
            <div>Explain what management accounting is and how it differs from financial accounting</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Classify costs by allocation and by behaviour</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Calculate contribution margin and use it to determine a break-even point</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
          <div class="self-review-row">
            <div>Apply management accounting principles to short-term decision-making</div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
            <div class="sr-radio-group"><div class="sr-radio" onclick="selectSR(this)"></div></div>
          </div>
        </div>

        <div class="q-block" style="margin-top:1.5rem">
          <div class="q-number">Timing feedback</div>
          <div class="q-text"><p>Was the estimated timing accurate?</p></div>
          <div class="mcq-options" id="mcq-s5-timing">
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s5-timing')"><div class="mcq-radio"></div>It took less time to complete the tasks and exercises than estimated</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s5-timing')"><div class="mcq-radio"></div>It took about the same amount of time to complete the tasks and exercises as estimated</div>
            <div class="mcq-option" onclick="selectMCQ(this, 'mcq-s5-timing')"><div class="mcq-radio"></div>It took more time to complete the tasks and exercises than estimated</div>
          </div>
        </div>

        <div class="q-block">
          <div class="q-number">Open feedback</div>
          <div class="q-text"><p>Please provide feedback on the content covered.</p></div>
          <textarea class="q-textarea" placeholder="Your thoughts on this session…" rows="4"></textarea>
        </div>

        <div class="feedback-box" id="fb-s5-review" style="display:none">
          <div class="fb-label">✓ Submitted</div>
          <div class="fb-content">
            <p>Congratulations on finishing session five! In the next session, we consider some further concepts and calculations that are relevant to management accounting.</p>
          </div>
        </div>

        <button class="submit-btn" onclick="toggleFeedback('fb-s5-review', this)">Submit session review</button>
      </div>

      <div class="page-nav">
        <button class="nav-btn" onclick="showPage('s5-6')">← 5.6 The break-even formula</button>
        <button class="nav-btn" style="opacity:0.5;cursor:default">Session 6 coming soon →</button>
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
  "s1-4-1": "1.4.1 Examining an annual report",
  "s1-5": "1.5 Session review",
  "s2-1": "2.1 Introduction",
  "s2-2": "2.2 What is the balance sheet?",
  "s2-2-1": "2.2.1 Examining a balance sheet",
  "s2-3": "2.3 Assets",
  "s2-4": "2.4 Liabilities and equity",
  "s2-5": "2.5 Session review",
  "s3-1": "3.1 Introduction",
  "s3-2": "3.2 Revenue",
  "s3-3": "3.3 Expenses",
  "s3-4": "3.4 Depreciation",
  "s3-5": "3.5 Calculating the profit",
  "s3-6": "3.6 Session review",
  "s4-1": "4.1 Introduction",
  "s4-2": "4.2 Structure of cash flow statements",
  "s4-3": "4.3 Is all cash equal?",
  "s4-4": "4.4 Examining a cash flow statement",
  "s4-5": "4.5 Session review",
  "s5-1": "5.1 Introduction",
  "s5-2": "5.2 Why do we need management accounting?",
  "s5-3": "5.3 Cost classification: Direct vs indirect",
  "s5-4": "5.4 Cost classification: Fixed vs variable",
  "s5-5": "5.5 Short-term decision making",
  "s5-5-1": "5.5.1 The special order",
  "s5-5-2": "5.5.2 The make or buy decision",
  "s5-5-3": "5.5.3 Continue or discontinue?",
  "s5-5-4": "5.5.4 Limiting factors",
  "s5-6": "5.6 The break-even formula",
  "s5-7": "5.7 Session review",
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

    window.selectCat = function selectCat(el, groupId) {
      const group = document.getElementById(groupId);
      if (!group) return;
      group.querySelectorAll(".cat-opt").forEach((opt) => {
        opt.classList.remove("selected");
      });
      el.classList.add("selected");
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
          height: 100vh;
          background: var(--accent);
          color: #fff;
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          overflow: hidden;
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
          height: 100vh;
          position: sticky;
          top: 0;
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
        .accounting-primer-session1 .page-body ul,
        .accounting-primer-session1 .q-text ul,
        .accounting-primer-session1 .quiz-body ul,
        .accounting-primer-session1 .text-block ul {
          list-style: disc;
        }
        .accounting-primer-session1 .page-body ol,
        .accounting-primer-session1 .q-text ol,
        .accounting-primer-session1 .quiz-body ol,
        .accounting-primer-session1 .text-block ol {
          list-style: decimal;
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
        .accounting-primer-session1 .fb-content table,
        .accounting-primer-session1 .page-body table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin: 0.75rem 0;
        }
        .accounting-primer-session1 .q-text th,
        .accounting-primer-session1 .page-body th {
          background: var(--accent);
          color: #fff;
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-weight: 600;
        }
        .accounting-primer-session1 .q-text td,
        .accounting-primer-session1 .page-body td {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border);
          vertical-align: top;
        }
        .accounting-primer-session1 .q-text tr:nth-child(even) td,
        .accounting-primer-session1 .page-body tr:nth-child(even) td { background: var(--bg); }
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

        .accounting-primer-session1 .q-input-cell {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.35rem 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem;
          color: var(--ink);
          background: var(--bg);
          min-width: 80px;
        }
        .accounting-primer-session1 .q-input-cell:focus {
          outline: none;
          border-color: var(--accent);
          background: var(--white);
        }

        .accounting-primer-session1 .categorize-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .accounting-primer-session1 .categorize-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.6rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--white);
          flex-wrap: wrap;
        }
        .accounting-primer-session1 .cat-label {
          font-size: 0.88rem;
          color: var(--ink);
          flex: 1;
        }
        .accounting-primer-session1 .cat-options {
          display: flex;
          gap: 0.4rem;
        }
        .accounting-primer-session1 .cat-opt {
          padding: 0.35rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--ink-soft);
          background: var(--bg);
          transition: all 0.15s;
          user-select: none;
        }
        .accounting-primer-session1 .cat-opt:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        .accounting-primer-session1 .cat-opt.selected {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }

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