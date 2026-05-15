"use client";

import React, { useMemo, useState } from "react";

const feedbackSets = [
  {
    "id": "gpt54-mini",
    "shortLabel": "GPT-5.4 mini",
    "label": "GPT-5.4 mini",
    "detail": "Reasoning high, verbosity medium",
    "file": "GPT-5-4-mini Reasoning high, verbosity medium – AI Vs Human Feedback - improved matching.html",
    "blocks": [
      {
        "key": "Example 1 – Distinction__Q1 — Drivers of change",
        "example": "Example 1 – Distinction",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">You identify the key pressures well: overcapacity, price volatility and margin squeeze</span>. <span class=\"m\" data-n=\"1\">The argument is clear</span> and <span class=\"u\">the link to digital platforms is sensible</span>. To strengthen it further, <span class=\"m\" data-n=\"2\">make the theoretical lens more explicit. The brief points you towards Porter's Five Forces</span>, so <span class=\"m\" data-n=\"3\">state more directly how intense rivalry, buyer power and low switching costs made the old distribution model unattractive</span>. <span class=\"u\">Also keep the focus on why the industry structure forced change, rather than moving too quickly into internal resource arguments</span>. <span class=\"u\">A sharper opening sentence would help the whole answer</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Thoughtful answer</span>. Additionally you could have <span class=\"m\" data-n=\"2\">applied 5 forces</span> <span class=\"m\" data-n=\"3\">to demonstrate why the industry faces structural problems with profitability (as well as inefficiencies)</span> — which would have made the approach more analytical (and less descriptive).</p>\n      <p><span class=\"m\" data-n=\"1\">Very good narrative answer</span> — better if <span class=\"m\" data-n=\"2\">a strategy framework had been used (5 forces etc.)</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 1 – Distinction__Q2 — Resources & capabilities",
        "example": "Example 1 – Distinction",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">This is a solid attempt to contrast the old and new resource base</span>, and <span class=\"u\">kloeckner.i is a relevant example</span>. The main thing to improve is precision: <span class=\"u\">several items you mention, such as divestments, renewables and cloud/AI tools, are not in the case, so they weaken the evidence base</span>. It would be better to <span class=\"m\" data-n=\"2\">separate resources from capabilities more clearly</span> and to <span class=\"u\">stay with the case evidence: digital infrastructure, online sales channels, ERP integration, the Berlin hub and the Digital Experience Programme</span>. That would let you <span class=\"m\" data-n=\"3\">show more clearly what must be retained, what must change, and why</span>. <span class=\"u\">Remember to reference the course material when you apply it</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Again — <span class=\"m\" data-n=\"1\">a good but rather descriptive answer</span> (<span class=\"u\">the question was future focused — whereas this describes what has already happened</span>). It's not bad — but <span class=\"m\" data-n=\"2\">it could do more to demonstrate what is meant by resources and capabilities</span>.</p>\n      <p>Good — but <span class=\"m\" data-n=\"3\">could have been clearer about which R&amp;C they will continue to need and which need to change</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 1 – Distinction__Q3 — Strengths & challenges for Rühl",
        "example": "Example 1 – Distinction",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You make a strong start here</span>, especially in identifying <span class=\"u\">Rühl's direct style, digital vision and willingness to tolerate mistakes</span>. <span class=\"u\">It is also good to see you recognising the value of the legacy brand and customer relationships</span>. The answer would be stronger if you <span class=\"u\">made a clearer distinction between strengths in Rühl himself and strengths in the wider business</span>, and if you <span class=\"u\">anchored the challenges more tightly in the case</span>. <span class=\"u\">The most important ones are employee fear, transferring tacit knowledge, and keeping kloeckner.i connected to the core business without losing speed or focus</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Good answer which directly addresses the question</span> (however again — <span class=\"u\">the question was future facing — not asking about what has already happened — watch out for this</span>).</p>\n      <p><span class=\"m\" data-n=\"1\">Good, insightful answer</span>, <span class=\"u\">using some of the theory relating to R&amp;C</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q1 — Drivers of change",
        "example": "Example 2 – Merit",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You give a clear answer and the key points are there</span>: <span class=\"u\">overcapacity, volatile prices, inefficient information flows and dissatisfied customers</span>. The argument would be stronger if you were <span class=\"m\" data-n=\"2\">a little more selective with the theory and used the course material to drive the analysis</span>, <span class=\"u\">rather than layering in several external ideas</span>. <span class=\"m\" data-n=\"3\">The case evidence on the linear supply chain is strong enough to show why the old model was under pressure, so try to state that main conclusion more directly before adding explanation</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Q1 focuses on the opportunities afforded by DT — which is fine. A better answer would have <span class=\"m\" data-n=\"3\">analysed why the industry is unprofitable</span> <span class=\"m\" data-n=\"2\">(5 forces)</span> and explained how DT can help Kloeckner to restructure the industry.</p>\n      <p><span class=\"m\" data-n=\"1\">Good, thoughtful reasons for Kloeckner to embrace DT</span>. An even better answer would have provided <span class=\"m\" data-n=\"2\">an analysis of the steel industry (5 forces)</span> <span class=\"m\" data-n=\"3\">to demonstrate that it is ripe for restructuring / reinvention as currently very unattractive</span>. <span class=\"u\">The answer could have been even more specific to Kloeckner (some of these reasons are rather generic)</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q2 — Resources & capabilities",
        "example": "Example 2 – Merit",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You identify the shift in resources and capabilities well</span>: <span class=\"u\">from physical assets and inventory-led operations towards digital infrastructure, data, talent and platforms</span>. The main thing to tighten is <span class=\"m\" data-n=\"2\">the distinction between a resource and a capability</span>. <span class=\"u\">Some of the points you list are activities rather than capabilities, so it would help to be clearer about what Klöckner has, and what it can do with it</span>. <span class=\"u\">A more explicit before-and-after contrast would make this section more analytical</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Q2 <span class=\"m\" data-n=\"2\">needs to go further in demonstrating what is meant by a resource or a capability</span> and could be much more specific to Kloeckner (<span class=\"u\">e.g. are robots likely to be a significant part of their production process?</span>).</p>\n      <p><span class=\"m\" data-n=\"1\">Some reasonable answers</span> — but <span class=\"u\">could this be more structured (e.g. value chain or VRIO)</span> and <span class=\"u\">more specific to Kloeckner (e.g. where does XOM fit in this picture)</span>?</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q3 — Strengths & challenges for Rühl",
        "example": "Example 2 – Merit",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">This is a clear answer with a sensible focus on leadership, the digital hub and culture change</span>. <span class=\"u\">You also show well that Rühl's personal commitment matters in driving the transformation</span>. To strengthen it further, <span class=\"u\">I would add a couple of legacy strengths from the case, such as the brand and customer relationships, not just the digital assets</span>. <span class=\"u\">The bullet-point structure is easy to follow</span>, but <span class=\"u\">a short linking sentence between the points would help the narrative feel more cohesive</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">A good list of strengths and challenges</span> and <span class=\"u\">the conclusion is well written</span>. <span class=\"u\">Perhaps rather than including a conclusion in such a short piece you might have used the word count to develop the direct answers to the questions further</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q1 — Drivers of change",
        "example": "Example 3 – Good pass",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Good, clear answer</span>. <span class=\"u\">You identify the key industry pressures well, especially overcapacity, volatile prices and inefficient information flows</span>. To strengthen this further, <span class=\"m\" data-n=\"2\">make the 'why' a little more explicit: these conditions squeeze margins and make the old linear model less viable</span>. <span class=\"u\">I would also be more selective with theory here</span>. This question is mainly about <span class=\"m\" data-n=\"3\">the industry's unattractiveness, so Porter's 5 Forces would help you show the cause-and-effect more directly</span> <span class=\"u\">than RBV on its own</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"u\">This doesn't really establish why digital transformation (and not e.g. M&amp;A, IOT)</span>. <span class=\"m\" data-n=\"2\">It's a bit generic</span>. The key is that <span class=\"m\" data-n=\"3\">the industry is structurally unattractive and digital transformation can reshape it in K's favour</span>.</p>\n      <p><span class=\"m\" data-n=\"1\">This answer is broadly correct</span> — however <span class=\"m\" data-n=\"2\">it doesn't really address at all the specifics of the industry in which Kloeckner finds itself. It could apply to nearly any company embarking on digital transformation. Aim to be much more specific</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q2 — Resources & capabilities",
        "example": "Example 3 – Good pass",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">You cover the main shift in resources and capabilities well, particularly the move towards digital infrastructure, data use and online sales</span>. The answer would be stronger if you were <span class=\"c\">more precise about what is a resource and what is a capability</span>: <span class=\"u\">for example, kloeckner.i and the Berlin hub are resources, while platform management, analytics and orchestration are the capabilities they support</span>. <span class=\"m\" data-n=\"1\">A few added points, such as acquisitions and AI tools, are less clearly grounded in the case, so being more selective would sharpen the answer</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"c\">This does demonstrate the difference between resources and capabilities</span> — but <span class=\"m\" data-n=\"1\">is not specific enough to Kloeckner. It's a generic list related to digital transformation</span>.</p>\n      <p><span class=\"m\" data-n=\"1\">What does this tell me about Kloeckner, specifically?</span></p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q3 — Strengths & challenges for Rühl",
        "example": "Example 3 – Good pass",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">This is a good, well-organised answer</span> and <span class=\"u\">you identify several important strengths in Rühl's leadership, particularly his credibility, direct communication and willingness to learn</span>. <span class=\"u\">It would be good to bring in some strengths of Klöckner itself as well, such as its brand and customer relationships, because the question asks about strengths more broadly</span>. On the challenge side, <span class=\"u\">you explain resistance and fear of redundancy clearly</span>; you could go a little further on <span class=\"m\" data-n=\"2\">integrating kloeckner.i with the core business and persuading customers and partners to adopt the new platforms</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"2\">Also needs to be more specific to the details of the case</span>.</p>\n      <p><span class=\"m\" data-n=\"1\">Q3 is a little better</span>, however <span class=\"m\" data-n=\"2\">this essay could apply to almost any company undergoing digital transformation and therefore is not a strong analysis of the case</span>.</p>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "gpt54",
    "shortLabel": "GPT-5.4",
    "label": "GPT-5.4",
    "detail": "Reasoning high, verbosity medium",
    "file": "GPT-5-4 Reasoning High, Verbosity Medium – AI Vs Human Feedback - improved matching.html",
    "blocks": [
      {
        "key": "Example 1 – Distinction__Q1 — Drivers of change",
        "example": "Example 1 – Distinction",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">You identify the main case reasons well: overcapacity, price volatility and inefficiencies in the linear supply chain</span>. However, <span class=\"m\" data-n=\"1\">the answer is mostly descriptive</span>. To reach a stronger mark, <span class=\"m\" data-n=\"2\">make the industry logic more explicit by applying one framework, most obviously Porter's 5 Forces, to show why profitability in steel distribution was structurally under pressure</span> <span class=\"u\">5–10 years ago</span>. <span class=\"u\">Also be careful not to move too quickly into what Klöckner did next; the question first asks why change was necessary</span>. <span class=\"u\">A little more precise case evidence and referencing would also strengthen this answer</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"u\">Thoughtful answer</span>. Additionally you could have <span class=\"m\" data-n=\"2\">applied 5 forces to demonstrate why the industry faces structural problems with profitability (as well as inefficiencies)</span> — which would have made the approach more analytical <span class=\"m\" data-n=\"1\">(and less descriptive)</span>.</p>\n      <p><span class=\"u\">Very good narrative answer</span> — better if <span class=\"m\" data-n=\"2\">a strategy framework had been used (5 forces etc.)</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 1 – Distinction__Q2 — Resources & capabilities",
        "example": "Example 1 – Distinction",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">There are some relevant points here</span>, especially <span class=\"u\">investment in digital infrastructure, employee upskilling and better inventory/data systems</span>. The main issue is that <span class=\"m\" data-n=\"2\">the distinction between resources and capabilities is not always clear</span>. <span class=\"u\">A resource would be something like the Berlin hub, digital platforms or tech talent; a capability is what Klöckner can do with them, such as recruiting suppliers to XOM, using analytics for pricing, or diffusing digital skills across the organisation</span>. <span class=\"m\" data-n=\"3\">Try to contrast the old resource base with the future one more explicitly</span> <span class=\"u\">and anchor it more closely in the case</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Again — <span class=\"m\" data-n=\"1\">a good but rather descriptive answer</span> (<span class=\"u\">the question was future focused — whereas this describes what has already happened</span>). It's not bad — but <span class=\"m\" data-n=\"2\">it could do more to demonstrate what is meant by resources and capabilities</span>.</p>\n      <p>Good — but <span class=\"m\" data-n=\"3\">could have been clearer about which R&amp;C they will continue to need and which need to change</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 1 – Distinction__Q3 — Strengths & challenges for Rühl",
        "example": "Example 1 – Distinction",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You make a sensible start on Rühl's leadership strengths</span>: <span class=\"u\">clear vision, quick decision-making and support for experimentation all fit the case well</span>. However, the answer would be stronger if it also <span class=\"u\">considered the strengths of the firm he can build on, such as brand reputation, customer relationships, and early digital successes like the online shop and kloeckner.i</span>. <span class=\"u\">Some of the challenges you identify are a little generic. The most convincing challenges here are employee anxiety, culture change in a traditional firm, knowledge transfer, and persuading customers and other distributors to join the platform</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Good answer which directly addresses the question</span> (however again — <span class=\"u\">the question was future facing — not asking about what has already happened — watch out for this</span>).</p>\n      <p><span class=\"m\" data-n=\"1\">Good, insightful answer</span>, <span class=\"u\">using some of the theory relating to R&amp;C</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q1 — Drivers of change",
        "example": "Example 2 – Merit",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You identify several relevant reasons for change</span>, especially <span class=\"u\">industry pressure, inefficient information flows and customer dissatisfaction</span>. <span class=\"m\" data-n=\"1\">The answer is clear</span>, but <span class=\"m\" data-n=\"2\">it remains mainly descriptive</span>. To raise it, apply one theory more explicitly — <span class=\"m\" data-n=\"3\">Porter's 5 Forces would have helped show why overcapacity, intense rivalry, buyer power and low switching costs made the industry structurally unattractive</span> <span class=\"u\">5–10 years ago</span>. The case evidence you use is relevant, but it could be more selective and analytical: <span class=\"m\" data-n=\"4\">explain why these points made the traditional model unsustainable, rather than mainly listing benefits of digitalisation</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"2\">Q1 focuses on the opportunities afforded by DT — which is fine</span>. <span class=\"m\" data-n=\"4\">A better answer would have analysed why the industry is unprofitable</span> <span class=\"m\" data-n=\"3\">(5 forces)</span> and explained how DT can help Kloeckner to restructure the industry.</p>\n      <p><span class=\"m\" data-n=\"1\">Good, thoughtful reasons for Kloeckner to embrace DT</span>. An even better answer would have provided <span class=\"m\" data-n=\"3\">an analysis of the steel industry (5 forces) to demonstrate that it is ripe for restructuring / reinvention as currently very unattractive</span>. <span class=\"u\">The answer could have been even more specific to Kloeckner (some of these reasons are rather generic)</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q2 — Resources & capabilities",
        "example": "Example 2 – Merit",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You pick out some important areas</span>, particularly <span class=\"u\">technology infrastructure, cybersecurity and skills</span>. However, the answer needs <span class=\"m\" data-n=\"2\">a clearer distinction between resources and capabilities</span>, and <span class=\"u\">a stronger contrast between the pre-digital business and what Klöckner needs in future</span>. Some of your examples are quite generic, and <span class=\"m\" data-n=\"3\">'robots on the production lines' is not well grounded in this case</span>. The stronger answer here would have focused <span class=\"m\" data-n=\"4\">more specifically on kloeckner.i, XOM, platform development, new pricing/contracting, recruiting suppliers and customers, and the capability to diffuse digital skills across the firm</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Q2 <span class=\"m\" data-n=\"2\">needs to go further in demonstrating what is meant by a resource or a capability</span> and could be much more specific to Kloeckner (<span class=\"m\" data-n=\"3\">e.g. are robots likely to be a significant part of their production process?</span>).</p>\n      <p><span class=\"m\" data-n=\"1\">Some reasonable answers</span> — but <span class=\"u\">could this be more structured (e.g. value chain or VRIO)</span> and <span class=\"m\" data-n=\"4\">more specific to Kloeckner (e.g. where does XOM fit in this picture)</span>?</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q3 — Strengths & challenges for Rühl",
        "example": "Example 2 – Merit",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">There are some good points here: Rühl's leadership, the digital hub and industry knowledge are all relevant strengths. The challenge section also identifies the main themes</span>. To improve the answer, <span class=\"u\">be more specific with case evidence and apply theory more explicitly. For example, Kotter or a resources-and-capabilities lens could have helped you analyse culture change, rather than listing issues</span>. <span class=\"u\">Some important strengths are also missing, such as Klöckner's brand, customer relationships and early online-shop successes</span>. <span class=\"u\">If you cite sources beyond the module, make sure you include full references</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">A good list of strengths and challenges and the conclusion is well written</span>. <span class=\"u\">Perhaps rather than including a conclusion in such a short piece you might have used the word count to develop the direct answers to the questions further</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q1 — Drivers of change",
        "example": "Example 3 – Good pass",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">You identify the key case drivers well</span>: <span class=\"u\">overcapacity, price volatility, inefficiency in the traditional supply chain, and the opportunity in platform models</span>. <span class=\"u\">The main issue is theoretical fit. RBV helps explain sources of advantage, but it does not explain why external industry conditions made change necessary. As written, the second paragraph risks implying that it does</span>. <span class=\"m\" data-n=\"2\">A framework such as Porter's 5 Forces would have given you a stronger explanation of why the industry had become structurally unattractive and why digital transformation was necessary</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"u\">This doesn't really establish why digital transformation (and not e.g. M&amp;A, IOT)</span>. <span class=\"u\">It's a bit generic</span>. The key is that <span class=\"m\" data-n=\"2\">the industry is structurally unattractive and digital transformation can reshape it in K's favour</span>.</p>\n      <p><span class=\"m\" data-n=\"1\">This answer is broadly correct</span> — however <span class=\"u\">it doesn't really address at all the specifics of the industry in which Kloeckner finds itself. It could apply to nearly any company embarking on digital transformation. Aim to be much more specific</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q2 — Resources & capabilities",
        "example": "Example 3 – Good pass",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p>The resources part is very good: <span class=\"m\" data-n=\"1\">you clearly distinguish tangible, intangible and human resources</span>, and <span class=\"c\">you use relevant case evidence such as ERP integration, kloeckner.i and the Digital Academy</span>. For capabilities, <span class=\"u\">some of the points are more activities or initiatives than capabilities. A capability is how the firm repeatedly does something well, for example integrating digital and legacy knowledge, developing platforms quickly, or diffusing digital skills across the organisation</span>. <span class=\"u\">If you sharpen that distinction, the answer would become more analytical and better aligned with the question</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">This does demonstrate the difference between resources and capabilities</span> — but <span class=\"c\">is not specific enough to Kloeckner. It's a generic list related to digital transformation</span>.</p>\n      <p><span class=\"u\">What does this tell me about Kloeckner, specifically?</span></p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q3 — Strengths & challenges for Rühl",
        "example": "Example 3 – Good pass",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"c\">The challenges are well argued and grounded in the case, especially resistance, fear of redundancy and the risk that kloeckner.i becomes disconnected from the core business</span>. For the strengths, <span class=\"u\">you focus mainly on Rühl personally, whereas the question also invites strengths of Klöckner more broadly. Some key strengths are missing, such as the company's brand reputation, customer relationships, and early digital successes that Rühl could build on</span>. <span class=\"m\" data-n=\"1\">More explicit use of case evidence here would have made the answer stronger</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Also needs to be more specific to the details of the case</span>.</p>\n      <p><span class=\"u\">Q3 is a little better</span>, however <span class=\"c\">this essay could apply to almost any company undergoing digital transformation and therefore is not a strong analysis of the case</span>.</p>\n    </div>\n  </div>\n</div>"
      }
    ]
  },
  {
    "id": "claude-sonnet-46",
    "shortLabel": "Claude Sonnet 4.6",
    "label": "Claude Sonnet 4.6",
    "detail": "Adapting thinking, effort level high",
    "file": "Claude Sonnet 4-6, Adapting Thinking, Effort Level High – AI Vs Human Feedback - improved matching.html",
    "blocks": [
      {
        "key": "Example 1 – Distinction__Q1 — Drivers of change",
        "example": "Example 1 – Distinction",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">The key drivers of change are correctly identified — global overcapacity, price volatility, and supply chain inefficiency</span> — but <span class=\"m\" data-n=\"1\">the answer remains largely descriptive</span>. What is missing is <span class=\"m\" data-n=\"2\">a theoretical framework to make the argument analytical. Porter's Five Forces</span>, for example, would allow you to demonstrate <em>why</em> the industry has become structurally unattractive (<span class=\"u\">intense rivalry from oversupply, high buyer power through low switching costs on a commodity product</span>) rather than simply narrating the situation. Lead with the theory and use case evidence to support the argument. <span class=\"u\">The answer also lacks any references.</span></p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"u\">Thoughtful answer</span>. Additionally you could have <span class=\"m\" data-n=\"2\">applied 5 forces</span> to demonstrate why the industry faces structural problems with profitability (as well as inefficiencies) — which would have <span class=\"m\" data-n=\"1\">made the approach more analytical (and less descriptive)</span>.</p>\n      <p><span class=\"u\">Very good narrative answer</span> — better if <span class=\"m\" data-n=\"2\">a strategy framework had been used (5 forces etc.)</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 1 – Distinction__Q2 — Resources & capabilities",
        "example": "Example 1 – Distinction",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p>Distinguishing tangible from intangible resources is a sound instinct, but <span class=\"m\" data-n=\"1\">the answer conflates resources with activities</span> — <span class=\"u\">'investing in training' is an activity, not a resource in itself</span>. It would also strengthen the answer considerably to <span class=\"m\" data-n=\"2\">contrast what Klöckner had before transformation with what it needs going forward</span> (<span class=\"u\">inventory mark-up pricing, steel expertise, physical distribution, tech talent, digital platforms such as kloeckner.i, platform recruitment capabilities</span>). <span class=\"u\">Specific case evidence, such as the Digital Experience Programme or XOM Materials, is not drawn upon.</span></p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Again — <span class=\"u\">a good but rather descriptive answer</span> (<span class=\"u\">the question was future focused — whereas this describes what has already happened</span>). It's not bad — but <span class=\"m\" data-n=\"1\">it could do more to demonstrate what is meant by resources and capabilities</span>.</p>\n      <p>Good — but <span class=\"m\" data-n=\"2\">could have been clearer about which R&amp;C they will continue to need and which need to change</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 1 – Distinction__Q3 — Strengths & challenges for Rühl",
        "example": "Example 1 – Distinction",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Some relevant points about Rühl's leadership style are made</span>, but <span class=\"m\" data-n=\"2\">the question asks about strengths he can <em>build on</em></span>, <span class=\"u\">which should include the firm's assets and prior achievements, not just personal traits</span>. <span class=\"u\">Key organisational strengths — brand reputation, existing customer relationships, and early experience with the online shop — are absent</span>. On challenges, the more specific case evidence (<span class=\"u\">employee fear of redundancy, the difficulty of embedding a digital culture in a traditional firm, and persuading competitors to join the XOM platform</span>) is not explored.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Good answer which directly addresses the question</span> (however again — <span class=\"m\" data-n=\"2\">the question was future facing — not asking about what has already happened</span> — watch out for this).</p>\n      <p><span class=\"m\" data-n=\"1\">Good, insightful answer</span>, <span class=\"u\">using some of the theory relating to R&amp;C</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q1 — Drivers of change",
        "example": "Example 2 – Merit",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">The answer identifies the key contextual pressures</span> — <span class=\"u\">global overcapacity, supply chain inefficiency, and customer dissatisfaction</span> — and <span class=\"u\">the quote from Rühl is well chosen</span>. However, <span class=\"m\" data-n=\"1\">the answer is largely descriptive</span>. <span class=\"m\" data-n=\"2\">Applying a framework such as Porter's 5 Forces would have enabled you to demonstrate analytically why the industry structure made the traditional model unsustainable</span>, rather than simply describing the outcome. The argument would be stronger if it showed not just that change was needed, but why the competitive dynamics made it inevitable.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Q1 focuses on the opportunities afforded by DT — which is fine</span>. <span class=\"m\" data-n=\"2\">A better answer would have analysed why the industry is unprofitable</span> <span class=\"m\" data-n=\"2\">(5 forces)</span> and explained how DT can help Kloeckner to restructure the industry.</p>\n      <p><span class=\"u\">Good, thoughtful reasons for Kloeckner to embrace DT</span>. An even better answer would have provided <span class=\"m\" data-n=\"2\">an analysis of the steel industry (5 forces) to demonstrate that it is ripe for restructuring / reinvention as currently very unattractive</span>. <span class=\"u\">The answer could have been even more specific to Kloeckner (some of these reasons are rather generic)</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q2 — Resources & capabilities",
        "example": "Example 2 – Merit",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Some relevant areas are identified</span> — <span class=\"u\">technology infrastructure, talent, and supply chain</span> — but <span class=\"m\" data-n=\"2\">the answer lacks the precision that comes from applying a resources and capabilities framework. Distinguishing between resources (what a firm has) and capabilities (what a firm can do)</span>, and <span class=\"u\">contrasting the pre-digital position with what is needed going forward</span>, would sharpen the analysis. <span class=\"m\" data-n=\"3\">The reference to robots on production lines is not well grounded in the case, as Klöckner is a distributor rather than a manufacturer</span>. <span class=\"m\" data-n=\"4\">Specific case evidence, such as the kloeckner.i hub or the XOM platform</span>, would add considerable depth.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p>Q2 <span class=\"m\" data-n=\"2\">needs to go further in demonstrating what is meant by a resource or a capability</span> and could be much more specific to Kloeckner (<span class=\"m\" data-n=\"3\">e.g. are robots likely to be a significant part of their production process?</span>).</p>\n      <p><span class=\"m\" data-n=\"1\">Some reasonable answers</span> — but <span class=\"u\">could this be more structured (e.g. value chain or VRIO)</span> and <span class=\"m\" data-n=\"4\">more specific to Kloeckner (e.g. where does XOM fit in this picture)</span>?</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 2 – Merit__Q3 — Strengths & challenges for Rühl",
        "example": "Example 2 – Merit",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"m\" data-n=\"1\">The bullet-point structure is clear and both strengths and challenges are addressed</span>. However, <span class=\"u\">the strengths identified focus on the transformation journey rather than the legacy assets Rühl can draw upon — such as Klöckner's brand reputation, established customer relationships, and the company's track record of adapting through previous crises</span>. <span class=\"u\">The question also invites a more personal focus on Rühl himself</span>. <span class=\"u\">The Teece et al. (1997) citation is present but its relevance to the specific argument is not explained, and a reference list does not appear to be included</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">A good list of strengths and challenges and the conclusion is well written</span>. <span class=\"u\">Perhaps rather than including a conclusion in such a short piece you might have used the word count to develop the direct answers to the questions further</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q1 — Drivers of change",
        "example": "Example 3 – Good pass",
        "question": "Q1 — Drivers of change",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q1 — Drivers of change</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">The answer covers some relevant ground — particularly around supply chain inefficiency and Rühl's vision for platform-based models</span>. However, <span class=\"m\" data-n=\"1\">it is largely descriptive, summarising case quotes rather than analysing them</span>. <span class=\"m\" data-n=\"2\">Porter's 5 Forces would have provided a strong theoretical lens here: the steel distribution industry is structurally unattractive</span> <span class=\"u\">due to overcapacity, low switching costs, and intense rivalry that depresses margins</span>. Framing the answer around this would explain <em>why</em> transformation was necessary rather than simply describing what Rühl said about it. <span class=\"u\">No module theory is applied</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"u\">This doesn't really establish why digital transformation (and not e.g. M&amp;A, IOT)</span>. <span class=\"m\" data-n=\"1\">It's a bit generic</span>. The key is that <span class=\"m\" data-n=\"2\">the industry is structurally unattractive and digital transformation can reshape it in K's favour</span>.</p>\n      <p>This answer is broadly correct — however <span class=\"m\" data-n=\"1\">it doesn't really address at all the specifics of the industry in which Kloeckner finds itself</span>. <span class=\"u\">It could apply to nearly any company embarking on digital transformation. Aim to be much more specific</span>.</p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q2 — Resources & capabilities",
        "example": "Example 3 – Good pass",
        "question": "Q2 — Resources & capabilities",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q2 — Resources &amp; capabilities</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p><span class=\"u\">There are some relevant points — digital infrastructure, talent acquisition, e-commerce platforms</span> — but <span class=\"m\" data-n=\"1\">the answer lacks analytical structure and remains quite general</span>. <span class=\"u\">The brief asked for a contrast between pre- and post-transformation resources and capabilities, which is largely absent</span>. <span class=\"c\">There is also no clear distinction between what constitutes a <em>resource</em> and a <em>capability</em></span>. Grounding the answer in the resources and capabilities framework, and <span class=\"m\" data-n=\"2\">using specific case evidence (e.g., the shift from steel logistics expertise to platform management and tech development at kloeckner.i), would have considerably strengthened the response</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"c\">This does demonstrate the difference between resources and capabilities</span> — but <span class=\"m\" data-n=\"1\">is not specific enough to Kloeckner. It's a generic list related to digital transformation</span>.</p>\n      <p><span class=\"m\" data-n=\"2\">What does this tell me about Kloeckner, specifically?</span></p>\n    </div>\n  </div>\n</div>"
      },
      {
        "key": "Example 3 – Good pass__Q3 — Strengths & challenges for Rühl",
        "example": "Example 3 – Good pass",
        "question": "Q3 — Strengths & challenges for Rühl",
        "html": "<div class=\"qb\">\n  <div class=\"qh\">Q3 — Strengths &amp; challenges for Rühl</div>\n  <div class=\"row\">\n    <div class=\"cell ai\">\n      <span class=\"tag\">AI feedback</span>\n      <p>Some useful points are raised on both strengths and challenges, though <span class=\"m\" data-n=\"1\">the answer misses important case-specific evidence</span> — for instance, <span class=\"u\">the early successes with kloeckner.i, the online shop experience, and the prominent theme of employee fear of redundancy</span>. <span class=\"u\">Kotter's change model, for example, would have provided a structured way to analyse the challenges Rühl faces</span>. The challenges section in particular <span class=\"m\" data-n=\"2\">would benefit from more precise grounding in the case rather than relying on broadly applicable observations</span>.</p>\n    </div>\n    <div class=\"cell orig\">\n      <span class=\"tag\">Original feedback</span>\n      <p><span class=\"m\" data-n=\"1\">Also needs to be more specific to the details of the case</span>.</p>\n      <p><span class=\"u\">Q3 is a little better</span>, however <span class=\"m\" data-n=\"2\">this essay could apply to almost any company undergoing digital transformation and therefore is not a strong analysis of the case</span>.</p>\n    </div>\n  </div>\n</div>"
      }
    ]
  }
];

const pageStyles = "body { background: #faf9f5; }\n.comparison-page { min-height: 100vh; max-width: 1180px; margin: 0 auto; padding: 32px 20px 56px; color: #1c1c1c; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; }\n.page-header { margin-bottom: 20px; }\n.eyebrow { margin: 0 0 6px; color: #706c63; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }\n.page-header h1 { margin: 0; font-size: 32px; line-height: 1.15; font-weight: 650; letter-spacing: 0; }\n.top-controls { display: grid; grid-template-columns: minmax(160px, 220px) 1fr auto; gap: 12px; align-items: stretch; padding: 14px; background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; margin-bottom: 14px; }\n.control-copy { display: flex; flex-direction: column; justify-content: center; gap: 2px; color: #5f5b50; font-size: 13px; }\n.control-copy strong { color: #1c1c1c; font-size: 15px; }\n.model-switcher { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }\nbutton { font: inherit; }\n.model-button, .small-model-button, .reset-button, .clear-overrides { border: 1px solid rgba(0,0,0,0.14); background: #f8f6ef; color: #33302b; cursor: pointer; transition: background 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease; }\n.model-button:hover, .small-model-button:hover, .reset-button:hover, .clear-overrides:hover { background: #f1efe8; border-color: rgba(0,0,0,0.24); }\n.model-button { min-height: 58px; border-radius: 7px; padding: 9px 10px; text-align: left; display: flex; flex-direction: column; gap: 2px; }\n.model-button span { font-size: 14px; font-weight: 650; }\n.model-button small { color: #666158; font-size: 12px; line-height: 1.25; }\n.model-button.active, .small-model-button.active { background: #1f4f7a; border-color: #1f4f7a; color: #fff; box-shadow: 0 8px 18px rgba(31,79,122,0.18); }\n.model-button.active small { color: rgba(255,255,255,0.78); }\n.clear-overrides { border-radius: 7px; padding: 0 12px; font-size: 13px; font-weight: 650; white-space: nowrap; }\n.legend { display: flex; flex-wrap: wrap; gap: 18px; padding: 14px 16px; background: #f1efe8; border-radius: 8px; margin: 0 0 18px; font-size: 13px; color: #5f5e5a; }\n.legend-item { display: inline-flex; align-items: center; gap: 8px; }\n.swatch { display: inline-block; width: 36px; height: 16px; border-radius: 3px; }\n.swatch.s-m { background: #eaf3de; }\n.swatch.s-u { background: #faeeda; }\n.swatch.s-c { background: #fcebeb; }\n.legend strong { color: #1c1c1c; font-weight: 600; }\n.question-list { display: grid; gap: 18px; }\n.example-group { display: grid; gap: 14px; }\n.example-heading { margin: 12px 0 0; padding: 14px 16px; border-radius: 8px; background: #e9e4d6; border: 1px solid rgba(0,0,0,0.12); }\n.example-heading h2 { margin: 0; font-size: 20px; line-height: 1.25; font-weight: 700; letter-spacing: 0; }\n.question-section { background: #fffdf9; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; overflow: hidden; }\n.question-toolbar { display: grid; grid-template-columns: minmax(220px, 1fr) auto; gap: 14px; align-items: center; padding: 14px 16px; background: #f7f5ef; border-bottom: 1px solid rgba(0,0,0,0.1); }\n.example-label { margin-bottom: 4px; color: #706c63; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }\n.question-toolbar h2 { margin: 0; font-size: 18px; line-height: 1.25; font-weight: 650; letter-spacing: 0; }\n.question-model-controls { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }\n.small-model-button, .reset-button { min-height: 34px; border-radius: 7px; padding: 6px 9px; font-size: 12px; font-weight: 650; white-space: nowrap; }\n.reset-button { background: #fff; color: #5b554b; }\n.selected-model-note { padding: 9px 16px; color: #5f5b50; font-size: 13px; border-bottom: 1px solid rgba(0,0,0,0.08); background: #fff; }\n.html-card .qb { border: 0; border-radius: 0; overflow: hidden; margin: 0; background: #fff; }\n.html-card .qh { display: none; }\n.html-card .row { display: grid; grid-template-columns: 1fr 1fr; }\n.html-card .cell { padding: 16px; font-size: 14px; line-height: 1.85; }\n.html-card .cell + .cell { border-left: 1px solid rgba(0,0,0,0.12); }\n.html-card .tag { display: inline-block; font-size: 10px; font-weight: 650; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; padding: 2px 8px; border-radius: 6px; }\n.html-card .ai .tag { background: #e6f1fb; color: #0c447c; }\n.html-card .orig .tag { background: #f1efe8; color: #5f5e5a; }\n.html-card .cell p { margin: 0 0 8px; }\n.html-card .cell p:last-child { margin-bottom: 0; }\n.html-card .m, .html-card .u, .html-card .c { border-radius: 3px; padding: 1px 3px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }\n.html-card .m { background: #eaf3de; }\n.html-card .u { background: #faeeda; }\n.html-card .c { background: #fcebeb; font-weight: 600; }\n.html-card .m::before { content: attr(data-n); display: inline-block; min-width: 14px; height: 14px; font-size: 9px; font-weight: 600; text-align: center; line-height: 14px; background: #3b6d11; color: #fff; border-radius: 50%; margin-right: 4px; vertical-align: 1px; padding: 0 2px; box-sizing: border-box; }\n.html-card em { font-style: italic; }\n@media (max-width: 860px) { .top-controls, .question-toolbar { grid-template-columns: 1fr; } .model-switcher { grid-template-columns: 1fr; } .question-model-controls { justify-content: flex-start; } }\n@media (max-width: 700px) { .comparison-page { padding: 24px 12px 44px; } .page-header h1 { font-size: 26px; } .html-card .row { grid-template-columns: 1fr; } .html-card .cell + .cell { border-left: none; border-top: 1px solid rgba(0,0,0,0.12); } }";
const modelById = Object.fromEntries(feedbackSets.map((model) => [model.id, model]));
const questionKeys = feedbackSets[0].blocks.map((block) => ({ key: block.key, example: block.example, question: block.question }));
const exampleGroups = questionKeys.reduce((groups, question) => {
  const group = groups.find((item) => item.example === question.example);
  if (group) {
    group.questions.push(question);
  } else {
    groups.push({ example: question.example, questions: [question] });
  }
  return groups;
}, []);

function ModelButton({ model, active, onClick }) {
  return (
    <button type="button" className={active ? "model-button active" : "model-button"} onClick={onClick} aria-pressed={active}>
      <span>{model.label}</span>
      <small>{model.detail}</small>
    </button>
  );
}

function QuestionComparison({ questionMeta, activeModelId, localModelId, onLocalModelChange }) {
  const selectedModelId = localModelId || activeModelId;
  const selectedModel = modelById[selectedModelId];
  const block = selectedModel.blocks.find((item) => item.key === questionMeta.key);
  const headingId = questionMeta.key.replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <section className="question-section" aria-labelledby={headingId}>
      <div className="question-toolbar">
        <div>
          <div className="example-label">{questionMeta.example}</div>
          <h2 id={headingId}>{questionMeta.question}</h2>
        </div>
        <div className="question-model-controls" aria-label={"Choose model for " + questionMeta.example + " " + questionMeta.question}>
          {feedbackSets.map((model) => (
            <button key={model.id} type="button" className={selectedModelId === model.id ? "small-model-button active" : "small-model-button"} onClick={() => onLocalModelChange(questionMeta.key, model.id)} aria-pressed={selectedModelId === model.id}>
              {model.shortLabel}
            </button>
          ))}
          {localModelId ? (
            <button type="button" className="reset-button" onClick={() => onLocalModelChange(questionMeta.key, null)}>
              Follow top choice
            </button>
          ) : null}
        </div>
      </div>
      <div className="selected-model-note">Showing {selectedModel.label} · {selectedModel.detail}</div>
      <div className="html-card" dangerouslySetInnerHTML={{ __html: block.html }} />
    </section>
  );
}

export default function StrategyAiHumanComparisonPage() {
  const [activeModelId, setActiveModelId] = useState(feedbackSets[0].id);
  const [questionModels, setQuestionModels] = useState({});
  const activeModel = modelById[activeModelId];
  const overrides = useMemo(() => Object.values(questionModels).filter(Boolean).length, [questionModels]);

  const handleLocalModelChange = (questionKey, modelId) => {
    setQuestionModels((current) => {
      const next = { ...current };
      if (modelId) {
        next[questionKey] = modelId;
      } else {
        delete next[questionKey];
      }
      return next;
    });
  };

  const handleGlobalModelChange = (modelId) => {
    setActiveModelId(modelId);
    setQuestionModels({});
  };

  return (
    <main className="comparison-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Klöckner case feedback comparison</p>
          <h1>AI vs original tutor feedback</h1>
        </div>
      </header>

      <section className="top-controls" aria-label="Choose model response set">
        <div className="control-copy">
          <span>Show model response set</span>
          <strong>{activeModel.label}</strong>
        </div>
        <div className="model-switcher">
          {feedbackSets.map((model) => (
            <ModelButton key={model.id} model={model} active={activeModelId === model.id} onClick={() => handleGlobalModelChange(model.id)} />
          ))}
        </div>
        {overrides ? (
          <button type="button" className="clear-overrides" onClick={() => setQuestionModels({})}>
            Clear {overrides} question override{overrides === 1 ? "" : "s"}
          </button>
        ) : null}
      </section>

      <div className="legend">
        <span className="legend-item"><span className="swatch s-m"></span><span><strong>Matched insight</strong> — same number = paired across columns</span></span>
        <span className="legend-item"><span className="swatch s-u"></span><span><strong>Unique</strong> to this column</span></span>
        <span className="legend-item"><span className="swatch s-c"></span><span><strong>Direct contradiction</strong> between the two</span></span>
      </div>

      <div className="question-list">
        {exampleGroups.map((group) => (
          <section className="example-group" key={group.example} aria-labelledby={group.example.replace(/[^a-zA-Z0-9]/g, "-")}>
            <div className="example-heading">
              <h2 id={group.example.replace(/[^a-zA-Z0-9]/g, "-")}>{group.example}</h2>
            </div>
            {group.questions.map((questionMeta) => (
              <QuestionComparison key={questionMeta.key} questionMeta={questionMeta} activeModelId={activeModelId} localModelId={questionModels[questionMeta.key]} onLocalModelChange={handleLocalModelChange} />
            ))}
          </section>
        ))}
      </div>

      <style jsx global>{pageStyles}</style>
    </main>
  );
}
