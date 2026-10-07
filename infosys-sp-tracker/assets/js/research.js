/* Evidence base. Kept separate from the plan so the research is auditable on its
 * own terms — every format claim here carries its source and date, and where
 * sources conflict the conflict is shown rather than averaged away.
 */

export const SOURCE_TIERS = [
  { tier:'A', name:'First-person, dated', what:'GeeksforGeeks Interview Experiences (individual posts), takeuforward community, CodingKaro experience DB', trust:'Real candidates, verifiable dates', cls:'tier-a' },
  { tier:'B', name:'Aggregated candidate data', what:'GitHub prep repos, LeetCode Discuss (via search summaries only)', trust:'Real but un-dated, un-attributed', cls:'tier-b' },
  { tier:'C', name:'SEO / guide sites', what:'acciojob, mygreatlearning, papersadda, getyourfirstjob, prepinsta, mockstep, placementpapers.app', trust:'Partly recycled / AI-written. <strong>Do not trust their numbers over Tier A.</strong> Used only for corroboration and the official compensation table', cls:'tier-c' }
];

export const INACCESSIBLE = 'reddit.com returned 403 to the research crawler, medium.com was behind Cloudflare, and leetcode.com/discuss plus naukri.com/code360 article bodies returned 403. Reddit and LeetCode-Discuss content below therefore comes only via search summaries and is labelled as such — the Reddit evidence base you asked for is genuinely missing from this report.';

export const FORMAT_X = {
  name: 'Format X — "surprise / pre-interview" coding round',
  shape: '1–2 problems, 30–45 minutes, bar = solve ONE completely',
  reports: [
    { date:'Oct 26, 2025', src:'GFG — Infosys SP Role 2025 (off-campus)', url:'https://www.geeksforgeeks.org/interview-experiences/company-name-interview-experience-for-job-title-31/', body:'Onsite. ID verification, candidates split into groups of 3–5. Surprise coding round on the same portal: <strong>2 problems (DP + Graph), ~30–40 min, each candidate got a unique problem.</strong> "Solving at least one question completely was essential for continuing in the SP selection process." Their problem: min number of elements whose LCM = LCM of the whole array → bitmask DP, <strong>passed 7/10, 3 TLE</strong>. Also the source of the "1–1.5 → DSE, 2+ → SP" threshold.', weight:'Most important single source' },
    { date:'Sep 29, 2025', src:'GFG — SP Role (HackWithInfy)', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-for-specialist-programmer-sp-role/', body:'Two candidates called at a time. <strong>2 coding questions, solve at least one in 45 min.</strong> Interviewers observed continuously, <strong>took photos every 20 min, checked rough sheets.</strong> Problems: (a) Alien-Dictionary-like, (b) min subsequence length with LCM = array LCM, N ≤ 50. Passed <strong>6/9 tests, 3 TLE → still SELECTED</strong>.' },
    { date:'Sep 29, 2025', src:'GFG — HackWithInfy SP (on-campus)', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-hackwithinfy-specialit-programmer-role/', body:'~15 candidates in one hall. <strong>90-min slot, but each candidate must solve 1 of 2 assigned questions within 45 min.</strong> Problems: <strong>Gas Station (Greedy)</strong> and <strong>Generate Valid Parentheses (Backtracking)</strong>. Interviewers <em>deliberately interrupted</em> to test composure. Solution passed partial test cases.' },
    { date:'Sep 12, 2025', src:'GFG — HackWithInfy SP, 2026 passouts', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-hackwithinfy-interview-experience-specialist-programmer-sp-2026-passouts/', body:'<strong>Live coding test: ONE problem in 40 min</strong>, medium-hard. Solved completely in ~20 min → <strong>SELECTED for SP</strong>.' },
    { date:'~Sep 2026', src:'Search snippet only (codingkaro / Glassdoor)', url:'https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Infosys', body:'"Live coding round with 2 DSA questions within 45 minutes"; another candidate got <strong>Merge Intervals + a follow-up built on it</strong>.', weak:true }
  ]
};

export const FORMAT_Y = {
  name: 'Format Y — full proctored assessment at a physical centre',
  shape: '3–4 problems, ~3 hours',
  reports: [
    { date:'Dec 18, 2025', src:'GFG — Infosys OA Experience for SP', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-oa-experience-for-specialist-programmer/', body:'Held <strong>in person at IIT Patna / NIT Patna / IIIT Bhagalpur</strong>. 15–20 invigilators, no phones / calculators / smartwatches, <strong>Infosys Wingspan desktop app</strong> scanning for other apps and sites. <strong>4 questions: easy, medium, hard, complex.</strong> "All were tough and the constraints were very high." Bar: <strong>"pass 50–60% of test cases on any 2–3 questions → expect an interview call."</strong> Constraints: Q1 n ≤ 1e5, Q2 n ≤ 1e5, <strong>Q3 n ≤ 1000, Q4 n ≤ 20</strong>.', weight:'Source of the constraint ladder' },
    { date:'2026 batch, official notification', src:'KN Academy summary of the official drive', url:'https://knoffcampusjobs.com/infosys-sp-dse-exam-2026/', body:'2026-batch drive: <strong>all assessments conducted in person.</strong> 3-hour programming evaluation, medium→hard, <strong>no aptitude / English sections</strong>. "The better you perform in the 3-hour coding exam → the higher the level you can get placed in." Also the source of the official compensation table.', tier:'C' },
    { date:'undated (2026)', src:'takeuforward community — Infosys SP', url:'https://takeuforward.org/community/interview-experiences/infosys-specialist-programmer-sp-interview-experience', body:'Round 1 online = 3 questions; <strong>Round 2 offline = 4 coding questions, easy→complex</strong>, topics "DP, Graphs, Trees, Arrays". Round 3 = L2 technical (~1h10m) with <em>Count subarrays with product ≥ K</em> and <strong>Minimum Window Substring</strong>, both O(n) demanded.' }
  ]
};

export const CONFLICT = {
  title: 'The disagreement, stated plainly',
  body: [
    '<strong>takeuforward + the official 2026 in-person framing + the Dec 2025 centre report</strong> → your round is <strong>Format Y: ~3 hours, 3–4 problems (easy / medium / hard / complex)</strong>. This matches what you were told.',
    '<strong>Four separate 2025–26 first-person reports</strong> → the thing that happens at the venue before the interview is <strong>Format X: 1–2 problems, 30–45 min, bar = solve ONE completely</strong>.',
    '<strong>This cannot be resolved from public evidence, and anyone who says it can is guessing.</strong> You were told 3–4 problems, so the plan targets Format Y — but Format X has the stronger first-person evidence base for the post-OA stage, and it is survivable with a <em>different</em> skill: one problem, fast, complete, under observation. The plan trains both, because the overlap is ~85% and the extra cost is one hour per weekend.'
  ]
};

export const ROUND1_REPORTS = [
  { date:'Mar 22, 2025', src:'CodingKaro — SP, Noida', body:'3h, 3 problems: <strong>① Queue + Greedy (M) ② DP + GCD (M-H) ③ DP + HashMap + Prime Factorization (H)</strong>' },
  { date:'Jul 13, 2025', src:'CodingKaro — SP/DSE OA', body:'3 problems on "math, greedy, combinatorics and graph": <em>Magical Vine: Repeating Berry Patterns</em>, <em>Array Partitioning with Factor Count Constraint</em>, <em>Eldoria: Subsets of Cities and Prime Realms</em>' },
  { date:'Jul 12, 2025', src:'GFG — HackWithInfy', body:'3h, 3 questions (E/M/H), medium-hard overall. Solved 2 fully + 1 partial → <strong>SP</strong>' },
  { date:'Dec 15, 2024', src:'GFG — SP L2 off-campus', body:'3 questions / 180 min, <strong>2 medium + 1 hard</strong>. Solved all 3 in 1.5h → <strong>shortlisted for L2</strong> (₹13L at the time). Interview DSA: <strong>Insert Interval</strong>, <strong>Circular Tour (Gas Station)</strong>' },
  { date:'Oct 26, 2025', src:'GFG — SP Role 2025', body:'Wingspan, 3 problems / 3h. Topics: <strong>DP, Segment Trees, Graphs, Sliding Window</strong>' },
  { date:'May 5, 2026', src:'GFG — SP/DSE 2026', body:'3h, 3 questions: two-pointer array → LCS / knapsack DP → Dijkstra / BFS shortest path. Solved 2/3' },
  { date:'Dec 17, 2024', src:'GFG — SP on-campus, 2025 batch', body:'Onsite coding: <strong>bit-manipulation bulb/toggle pattern</strong>, and <strong>Number of Islands variant (warships grid, DFS)</strong>' }
];

export const LEVELS = {
  official: [
    { role:'SP L3', pay:'₹21,00,000' },
    { role:'SP L2', pay:'₹16,00,000' },
    { role:'SP L1', pay:'₹10,00,000 + ₹1,00,000 joining bonus' },
    { role:'DSE',   pay:'₹6,25,000 + ₹75,000 joining bonus' }
  ],
  officialNote: 'From the 2026-batch notification as summarised publicly (knoffcampusjobs.com). Infosys publishes <strong>no</strong> score cutoff.',
  claims: [
    { claim:'"Solving 1–1.5 questions → DSE. Solving 2 or more → SP"', src:'GFG, Oct 26 2025 — first-person, selected', label:'Anecdotal, Tier A — strongest single data point', cls:'tier-a' },
    { claim:'"Pass 50–60% of test cases on any 2–3 questions → expect interview call"', src:'GFG, Dec 18 2025 — first-person', label:'Anecdotal, Tier A', cls:'tier-a' },
    { claim:'"Solve 2 fully + 1 partial → SP"', src:'GFG, Jul 2025 — first-person, selected', label:'Anecdotal, Tier A', cls:'tier-a' },
    { claim:'"Solve all 3 in 1.5h → L2"', src:'GFG, Dec 2024 — first-person, selected L2', label:'Anecdotal, Tier A', cls:'tier-a' },
    { claim:'"L1 = 2+ solved; L2 = 2.5–3 with optimal complexity; L3 = extremely rare, top OA performers only"', src:'acciojob handbook', label:'Tier C, unverified — plausible, treat as folklore', cls:'tier-c' }
  ],
  synthesis: 'Inference, clearly labelled as such: ~2 complete <em>and</em> optimal-complexity solutions ≈ SP territory. 3 complete with optimal complexity ≈ what the one L2 data point looks like. L3 appears to be an outlier band. <strong>Partial credit is real and counted</strong> — three independent sources say so.'
};

export const CLEARED_SAID = [
  { who:'Sep 2025, selected (CodingKaro)', what:'"Greedy, Knapsack, Dynamic Programming, Trees, Graphs, Segment Trees, Fenwick Trees"' },
  { who:'Dec 2025, off-campus (search snippet)', what:'4 months on "Dynamic Programming, Binary Search on Answers, Graphs, Trees, Heaps"' },
  { who:'Sep 2025, selected (GFG)', what:'"Revise Greedy, DP, Backtracking — these are popular. <strong>Practise coding in timed + distracting environments.</strong>"' },
  { who:'Oct 2025, selected (GFG)', what:'"Strong focus on DP, Graphs, Trees and Segment Trees helps a lot. Manage time well — accuracy <em>and</em> efficiency both matter."' },
  { who:'May 2026 (GFG)', what:'"LeetCode Medium/Hard + GFG SDE sheets. The difficulty jump from DSE to SP is significant."' },
  { who:'Sep 2025, selected (GFG)', what:'Had solved <strong>600+ GFG problems</strong> — and was asked in the interview whether they followed a <em>pattern strategy</em> or solved randomly.' }
];

export const SIGNATURE = [
  { rank:1, name:'DP fused with number theory (GCD / LCM / prime factorization / divisor counting)', pri:'must',
    evidence:[
      '<em>min elements whose LCM = array LCM</em> — <strong>reported TWICE independently</strong> (Sep 2025 HackWithInfy, Oct 2025 off-campus). Both solvers used bitmask DP; both TLE’d on 3 tests',
      '"DP + GCD (M-H)" and "DP + HashMap + Prime Factorization (H)" — Mar 2025',
      '"Array Partitioning with Factor Count Constraint", "Subsets of Cities and Prime Realms" — Jul 2025',
      '"Largest Set with Product 1 mod N", "Same Digit Base Conversion", "Sum of LCM" — GitHub repos / lets-code',
      'The Jul 2025 candidate’s own topic summary was "math, greedy, combinatorics and graph"'
    ],
    verdict:'<strong>No generic DSA roadmap prepares you for this. It is the single highest-ROI thing in the plan.</strong>' },
  { rank:2, name:'Binary search on the answer + greedy feasibility check', pri:'must',
    evidence:['"Terrain Transformation — Binary Search + Greedy — Hard" (lets-code); "Road Terrain Transformation" (campusmonk Q49)','"Array Minimization Problem — Greedy", "Mountain Array Transformation"','One selected candidate’s 4-month plan literally named "Binary Search on Answers"','Constraint tell: n ≤ 1e5 with a "minimize the maximum" phrasing'] },
  { rank:3, name:'Partition an array into exactly K groups (DP)', pri:'must',
    evidence:['"Gift Box Packing Problem — DP — Medium-Hard" (lets-code) = "Gift Packing K Boxes" (campusmonk Q46) — two sources, same problem','"Array Partition K Segments" (campusmonk Q39)','LeetCode proxies: Split Array Largest Sum (410), Partition Array for Maximum Sum (1043)'] },
  { rank:4, name:'Bitmask / subset DP at small n', pri:'must',
    evidence:['The Dec 2025 report’s <strong>Q4 had n ≤ 20</strong> — an explicit bitmask invitation','"Max XOR of Half-Sized Subset", "Max XOR Subset (N/2 Elems)" — two sources','Both LCM problems were solved with bitmask DP'] },
  { rank:5, name:'LIS with a non-standard comparator', pri:'must',
    evidence:['"Conditional LIS — DP — Hard" (lets-code), "LIS with Bitwise Condition" (campusmonk Q38), "Longest Bitwise-Compatible LIS" (GitHub repo)','Three sources naming the <em>same unusual twist</em>: LIS where "increasing" is replaced by a predicate — divisibility, bitwise subset, AND/OR compatibility'] }
];

export const RECURRING = [
  { g:'DP types (ordered)', items:[
    ['Partition into K groups (dp[i][k])','must'],['Subset-sum family','must'],['DP over arithmetic states in a HashMap — GCD/LCM/product/divisor as the key','must'],
    ['Bitmask subset DP (n ≤ 20), including min-cover','must'],['Two-sequence DP: LCS, Edit Distance','must'],['Unbounded knapsack / Coin Change','must'],
    ['1D pick-or-skip (House Robber family)','must'],['LIS, both complexities + custom-predicate variants','must'],['Grid DP','should'],['DP + prefix/XOR state','should'],
    ['Interval DP (Burst Balloons style)','iftime'],['Digit DP / probability-convolution DP','iftime']
  ]},
  { g:'Tree / Tree-DP types', note:'<strong>Honest correction:</strong> trees are reported less often in the hard slot than you assume. Across every first-person report readable, trees appeared as Zigzag traversal (easy tier), <em>Modified Path Sum</em>, Number of Islands grid DFS, and LCA/BST in <em>interviews</em>. <strong>No first-person report describes a hard Tree-DP problem as the hard/complex slot.</strong>', items:[
    ['"What does my recursion return to its parent?" — the one mental model','must'],['Diameter / max path sum through a node','must'],
    ['Root-to-leaf and path-sum-with-prefix-map (Tree + HashMap — fits the Infosys HashMap habit)','must'],['LCA — asked in interviews repeatedly','must'],
    ['BST properties: validate, k-th smallest via inorder','must'],['Tree-as-graph BFS (adjacency list + parent map)','should'],['Tree DP pick/skip (House Robber III)','should'],
    ['DSU-on-tree / small-to-large merging — one Tier-C claim only. Do not touch','skip']
  ]},
  { g:'Greedy types', items:[
    ['Reachability greedy — Jump Game, Jump Game II, Gas Station (<strong>Gas Station reported twice by name</strong>)','must'],
    ['Interval scheduling — sort by end, count compatible','must'],['Merge / Insert Interval — reported by name twice','must'],
    ['Sort + two-pointer pairing','must'],['Greedy feasibility <em>inside</em> a binary search','must'],['Greedy + heap — Task Scheduler, Job Sequencing, Minimum Platforms','should'],
    ['Digit/string greedy — "smallest number greater than N using the same digits" (Sep 2024 onsite), "Remove Digit for Max Number"','should']
  ]},
  { g:'Graph types', items:[
    ['Grid BFS/DFS flood fill — Number of Islands reported by name','must'],['Topological sort — Alien Dictionary reported by name','must'],
    ['Dijkstra / shortest path — May 2026 report; also asked conceptually with pseudocode','must'],['Multi-source BFS','should'],
    ['Graph + extra state (K stops, bitmask-over-nodes)','should'],['Connected components / cycle detection, DSU','should'],['MST','iftime'],
    ['SCC / Tarjan / max-flow / Bellman-Ford','skip']
  ]}
];

export const ADVANCED_DS = [
  { ds:'Monotonic stack', evidence:'"Next Greater Element" sits in the <em>easy tier</em> of a candidate-compiled repo', verdict:'SHOULD DO — 1 problem, 30 min. Cheap', pri:'should' },
  { ds:'DSU', evidence:'Cycle detection, Job Sequencing, MST, components', verdict:'SHOULD DO — 45 min, template only. Cheap and reusable', pri:'should' },
  { ds:'Trie', evidence:'"Implement Trie" in one top-50 list; Max-XOR problems', verdict:'IF TIME — and only the <strong>bit-greedy</strong> solution to Max XOR, not the Trie class. Skip the DS', pri:'iftime' },
  { ds:'Segment Tree', evidence:'Named in topic lists by 2 candidates, but <strong>no first-person report describes a problem that required one</strong>', verdict:'SKIP for coding. Watch ONE 15-min video so you can say what it does if an interviewer asks. A segment tree you half-know is worth zero marks', pri:'skip' },
  { ds:'Fenwick / BIT', evidence:'Named once in one candidate’s prep list. Inversion-counting problems exist (Dec 2025 Q2) but merge sort counts inversions too', verdict:'SKIP the BIT. Learn <strong>inversion counting via merge sort</strong> instead — same power, you already know merge sort', pri:'skip' }
];

export const ADVANCED_REASONING = 'You have 5 weekends. A segment tree takes ~6 hours to reach reliable implementation under pressure, and the expected marks it unlocks are near zero compared with 6 hours on DP-with-GCD/LCM, which is twice-confirmed by name.';

export const CYCLES = [
  { yr:'2022–2024', what:'Mostly online, 3 questions / 3 hours, 1 easy + 1 medium + 1 hard' },
  { yr:'2025', what:'Same OA, <strong>plus a new onsite "surprise" coding round</strong> before the interview (first appears in Sep 2025 reports; absent from 2024 reports). Photo-every-20-min and rough-sheet checks appear here' },
  { yr:'Dec 2025', what:'<strong>Pattern change to 4 questions — easy / medium / hard / "complex"</strong>, each with ~12 test cases, at physical centres on the Wingspan desktop app' },
  { yr:'2026 batch', what:'Official framing is <strong>all assessments in person</strong>, 3 hours, technical-only (no aptitude / English)' },
  { yr:'Shift variance', what:'Jul 12 2025 ran in two slots; Dec 18 2025 ran simultaneously at three centres. <strong>Each candidate in the onsite round gets a unique problem</strong> (Oct 2025) — so leaked questions from an earlier shift are worth little' },
  { yr:'Constant every year', what:'DP is the hard slot; partial scoring exists; Arrays/Strings is the easy slot; no aptitude section for SP' }
];

export const SKIP_LIST = [
  { g:'Data structures', items:['Segment tree','Fenwick / BIT','Persistent structures','Sparse table','Sqrt decomposition / Mo’s algorithm','Balanced BST implementation','Trie as a class (learn bit-greedy Max-XOR instead)','Suffix array / suffix automaton'] },
  { g:'Graph algorithms', items:['Tarjan / SCC / Kosaraju','Bridges & articulation points','Bellman-Ford','Max-flow / min-cut / bipartite matching','A*','Euler tour','LCA by binary lifting','Heavy-light decomposition','Centroid decomposition','DSU-on-tree / small-to-large merging'] },
  { g:'DP', items:['Digit DP','Convex hull trick / Li Chao','Divide-and-conquer DP optimisation','SOS DP','Broken-profile DP','Probability-convolution DP'] },
  { g:'Math', items:['Chinese Remainder Theorem','Primitive roots','Euler totient tricks','Möbius inversion','Matrix exponentiation','NTT / FFT','Burnside'], note:'One GitHub repo lists CRT and primitive-root problems. No first-person report mentions them. The repo is aspirational, not evidence.' },
  { g:'Strings', items:['KMP','Z-function','Rabin-Karp','Aho-Corasick','Manacher'] },
  { g:'Other', items:['Game theory / Grundy numbers','Computational geometry','Advanced bit tricks beyond the basics','Codeforces rated contest practice','System design','Aptitude / verbal — SP has no aptitude section per the official 2026 framing'] }
];

export const SKIP_BEHAVIOURS = [
  { t:'Solving 200–300 problems', d:'The Sep 2025 selected candidate with 600+ GFG problems was asked whether they followed a <em>pattern strategy</em> or solved randomly — because pattern strategy is what is actually being evaluated. 70 well-understood problems beat 300 skimmed ones' },
  { t:'Reading more "Infosys 2026 pattern" blogs', d:'You now have better evidence than any of them. Further reading only produces anxiety and contradictory numbers' },
  { t:'Hunting leaked questions', d:'The Oct 2025 report says each candidate in the onsite round gets a <strong>unique</strong> problem. Patterns transfer; specific questions do not' },
  { t:'Switching languages', d:'Pick one in Week 1 and stay' },
  { t:'Revising React / TypeScript / Spring Boot for this round', d:'Irrelevant to the coding assessment. It becomes a <strong>major</strong> asset in the technical interview — the Oct 2025 report had Spring Boot, microservices, Kafka and RabbitMQ questions. Park it until after 12 Nov' },
  { t:'Watching tutorials on the weekend', d:'Weekends are for coding only. Weekday videos are the input; weekend code is the output. Do not invert it' }
];

export const BORDERLINE = 'Trie as a DS · interval DP (Burst Balloons) · MST (Kruskal with your DSU template) · Minimum Window Substring · matrix/spiral simulation · a single 15-min "what a segment tree does" video purely so you can answer an interview question about it — never to code one.';

export const LANGUAGE_NOTE = 'Use C++ if you can; otherwise <strong>Java with fast I/O</strong>. Rationale: four separate reports mention TLE on 3 test cases with a <em>correct</em> approach. That is a constant-factor loss, not an algorithm loss. In Java: pre-memorise BufferedReader + StringTokenizer, use int[] / long[] not HashMap&lt;Integer,…&gt; for DP tables, and never String += in a loop. <strong>Do not use Python</strong> — the n ≤ 1e5 and 2²⁰ problems will TLE even with a correct solution. Given your Spring Boot background, Java is the pragmatic pick.';

export const THREE_THINGS = [
  '<strong>The format is contested.</strong> You were told 3–4 problems; the strongest first-person evidence for the post-OA stage says 1–2 problems in 30–45 minutes with the bar at "solve one completely". This plan trains both, but it deliberately builds the ability to take <em>one</em> medium-hard problem from blank page to complete, tested solution in 35 minutes — because that skill passes either format, and breadth alone passes neither.',
  '<strong>DP fused with GCD / LCM / prime-factorization is the Infosys-specific edge.</strong> The same LCM-subsequence problem was reported by two independent candidates in two different months, and "DP + GCD" and "DP + HashMap + Prime Factorization" appear in a third report. Week 2 Sunday is the highest-value day in this plan. No generic roadmap has it.',
  '<strong>Reading constraints is worth more than any extra topic.</strong> n ≤ 20 means bitmask. n ≤ 1000 means O(n²) DP. n ≤ 1e5 means O(n log n). The Dec 2025 candidate handed us the actual constraint ladder, and it maps one-to-one onto technique. Drill it until it is reflex — and <strong>submit a brute force for everything</strong>, because partial credit is documented and two selected candidates got in with 3 TLEs each.'
];

export const SOURCES = [
  { tier:'A', title:'GFG — Infosys SP Role Interview Experience 2025 (Off-Campus)', date:'26 Oct 2025', url:'https://www.geeksforgeeks.org/interview-experiences/company-name-interview-experience-for-job-title-31/', note:'Onsite surprise round: 2 problems, 30–40 min, unique per candidate, must solve 1 completely. LCM bitmask DP, 7/10 tests. "1–1.5 → DSE, 2+ → SP." Most important single source' },
  { tier:'A', title:'GFG — [Infosys] OA Experience for Specialist Programmer', date:'18 Dec 2025', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-oa-experience-for-specialist-programmer/', note:'In person at IIT/NIT Patna, IIIT Bhagalpur. Wingspan app. 4 questions easy/medium/hard/complex. Constraints n≤1e5, 1e5, 1000, 20. "50–60% of test cases on 2–3 questions → interview call"' },
  { tier:'A', title:'GFG — Infosys Interview Experience for SP Role', date:'29 Sep 2025', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-for-specialist-programmer-sp-role/', note:'2 candidates at a time, 2 questions, solve 1 in 45 min, photos every 20 min, rough sheets checked. Alien Dictionary-like + LCM subsequence (N≤50). 6/9 tests → SELECTED' },
  { tier:'A', title:'GFG — Infosys (HackWithInfy) Experience for SP Role', date:'29 Sep 2025', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-hackwithinfy-specialit-programmer-role/', note:'~15 in a hall, 1 of 2 questions in 45 min. Gas Station + Generate Valid Parentheses. Deliberate interruptions' },
  { tier:'A', title:'GFG — Infosys HackWithInfy Interview Experience SP (2026 passouts)', date:'30 Sep 2025', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-hackwithinfy-interview-experience-specialist-programmer-sp-2026-passouts/', note:'OA 12 Jul 2025: 3h/3 questions, solved 2+1 partial. Interview day 12 Sep 2025: 1 problem in 40 min → SELECTED SP' },
  { tier:'A', title:'GFG — Infosys SP L2 Interview Experience (Off Campus)', date:'21 Mar 2025', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-specialist-programmer-l2-interview-experience-off-campus/', note:'OA 15 Dec 2024: 3 questions/180 min, 2 medium + 1 hard, all 3 in 1.5h → L2. Interview: Insert Interval, Circular Tour. L1 ₹9.5L / L2 ₹13L / DSE ₹6.5L at that time' },
  { tier:'A', title:'GFG — Infosys SP, Full Time, On Campus, 2025 Batch', date:'17 Dec 2024', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-specialist-programmer-full-time-on-campus-2025-batch/', note:'Onsite coding: bit-manipulation toggle pattern; Number of Islands variant (warships grid, DFS). SELECTED' },
  { tier:'A', title:'GFG — Infosys SP/DSE Interview Experience 2026', date:'5 May 2026', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-specialist-programmer-sp-digital-specialist-engineer-dse-2026/', note:'3h/3 questions: two-pointer → LCS/knapsack → Dijkstra/BFS. Solved 2/3' },
  { tier:'A', title:'GFG — Infosys SP Interview Experience (9 LPA, Off Campus)', date:'4 Jan 2026', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-specialist-programmer-interview-experience-9-lpa-off-campus/', note:'3 questions, 100 marks each, medium-hard' },
  { tier:'A', title:'GFG — Infosys Interview Experience for SP Role', date:'30 Sep 2024', url:'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-for-specialist-programmer-role/', note:'Offline office round: "smallest number greater than N using only its own digits"' },
  { tier:'A', title:'takeuforward — Infosys SP Interview Experience', date:'undated (2026)', url:'https://takeuforward.org/community/interview-experiences/infosys-specialist-programmer-sp-interview-experience', note:'Round 1 online = 3 questions; Round 2 offline = 4 questions easy→complex; Round 3 L2 technical: count subarrays with product ≥ K, Minimum Window Substring, both O(n)' },
  { tier:'A', title:'CodingKaro — Infosys interview experiences DB', date:'2025–2026', url:'https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Infosys', note:'22 Mar 2025 SP Noida: Queue+Greedy / DP+GCD / DP+HashMap+Prime Factorization. 13 Jul 2025 OA: Magical Vine, Array Partitioning with Factor Count Constraint, Subsets of Cities and Prime Realms. 29 Sep 2025 prep list incl. Segment/Fenwick Trees' },
  { tier:'B', title:'github.com/apoorv-jn24/Infosys-SP-DSE-Questions', date:'undated', url:'https://github.com/apoorv-jn24/Infosys-SP-DSE-Questions', note:'3 questions / 100 marks (20/30/50); 20 tiered problems incl. Longest Bitwise-Compatible LIS, Max XOR of Half-Sized Subset, Longest Increasing Path in Matrix' },
  { tier:'B', title:'github.com/bhasidhshaik/Infosys-SP-DSE-resources', date:'undated', url:'https://github.com/bhasidhshaik/Infosys-SP-DSE-resources', note:'Frequency ranking: Arrays+HashMap 5/5, DP 5/5, Sliding Window 4/5, Greedy 4/5, Bit Manipulation 4/5. "Partial scoring exists on hidden test cases — never leave a question blank"' },
  { tier:'B', title:'github.com/karthikreddy-7/Infosys-SP-Coding-Questions', date:'undated', url:'https://github.com/karthikreddy-7/Infosys-SP-Coding-Questions', note:'Minimum Coins, Subset Sum, Largest Number, Wine Bottle Transport, Minimum Platforms' },
  { tier:'B', title:'campusmonk.in — Top 50 Infosys Coding Questions 2021–2026', date:'2021–2026', url:'https://campusmonk.in/top-50-infosys-coding-questions-2021-2026-se-dse-sp-roles-pyq-easy-medium-hard/', note:'Hard tier: LIS with Bitwise Condition, Array Partition K Segments, Max XOR Subset (N/2), Gift Packing K Boxes, Road Terrain Transformation, Mountain Array Transformation, Minimum Inversions via XOR' },
  { tier:'B', title:'lets-code.co.in — Infosys SP & DSE Previous Year Coding Questions', date:'undated', url:'https://www.lets-code.co.in/previousyearcodingquestion/infosys-sp-and-dse-previous-year-coding-questions/', note:'Gift Box Packing (DP), Terrain Transformation (BS+Greedy), Conditional LIS (DP). Claims 60–90 min / 2 problems, which conflicts with every Tier-A report' },
  { tier:'B', title:'LeetCode Discuss — SP/DSE OA experiences & L1 compensation', date:'2025–2026', url:'https://leetcode.com/discuss/post/7449933/infosys-off-campus-spdse-2025-2026-onlin-cam1/', note:'Page bodies returned 403 to the fetcher; content reached this report only via search summaries. Treat as weaker evidence' },
  { tier:'C', title:'knoffcampusjobs.com — Infosys SP/DSE Exam 2026', date:'2026 batch', url:'https://knoffcampusjobs.com/infosys-sp-dse-exam-2026/', note:'Official 2026-batch compensation (SP L3 ₹21L / L2 ₹16L / L1 ₹10L+₹1L / DSE ₹6.25L+₹75k); all assessments in person; 3h programming, no aptitude' },
  { tier:'C', title:'getyourfirstjob.in — Infosys Round 2 patterns + Top 80 questions', date:'Aug 2026', url:'https://getyourfirstjob.in/2026/08/29/infosys-round-2-top-80-coding-questions-sp-dse-practice/', note:'Pattern-organised list used to cross-check this curation' },
  { tier:'C', title:'papersadda.com — SP/DSE 2026 topic frequency', date:'2026', url:'https://papersadda.com/article/infosys-sp-dse-coding-questions-2026/', note:'Topic frequency 2022–2025. Disagrees with Tier A on question count and duration' },
  { tier:'C', title:'acciojob — Infosys SP L1/L2/L3 Interview Handbook', date:'undated', url:'https://placement.acciojob.com/interview-kit/infosys-specialist-programmer/', note:'Source of the unverified L1/L2/L3 score folklore' },
  { tier:'C', title:'mygreatlearning — Infosys SP/DSE 2026 guide', date:'2026', url:'https://www.mygreatlearning.com/blog/infosys-sp-dse-interview-guide-2026/', note:'Corroboration only' },
  { tier:'C', title:'prepinsta — Infosys SP coding questions', date:'undated', url:'https://prepinsta.com/infosys-sp-and-dse/specialist-programmer/coding-questions/', note:'Corroboration only' }
];
