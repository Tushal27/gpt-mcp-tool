/* Infosys SP Tracker — plan dataset.
 * Pure data, no DOM. Everything the UI renders comes from here, so editing the
 * plan never means touching render code.
 *
 * Problem ids are stable (p01, p02, ...). Never renumber an existing id: ids are
 * the keys your saved progress is stored under.
 */

export const EXAM = {
  date: '2026-11-12',
  label: 'Infosys SP proctored coding round',
  planStart: '2026-10-07'
};

/* ------------------------------------------------------------------ weeks */

export const WEEKS = [
  {
    id: 'w1',
    n: 1,
    sat: 'Sat 10 Oct',
    sun: 'Sun 11 Oct',
    range: 'Wed 7 Oct → Sun 11 Oct',
    title: 'DP Core I + calibration',
    objective: 'Stop fearing DP. Install the State → Transition → Base case → Iteration order → Answer ritual until it is automatic, and own the knapsack / subset-sum family cold.',
    topics: ['1D pick-or-skip DP', '0/1 knapsack', 'Subset sum / partition / counting subsets', 'Unbounded knapsack & coin change', 'memo → tabulation → space-optimised'],
    patterns: [
      'dp[i] = f(dp[i-1], dp[i-2]) with a <em>reason</em> for each term',
      'dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]]) — and the 1-D rolling version, <strong>including why 0/1 iterates weight descending and unbounded ascending</strong>. This one fact is worth more marks than any single problem',
      'Subset sum → boolean DP → reused for equal partition, min difference, count subsets, target sum. One table, four problems',
      'Coin Change (minimise) vs Coin Change II (count) vs Combination Sum IV (count ordered) — <strong>why loop order changes the answer</strong>',
      '“Look back at most k positions”: dp[i] = max over j in [1..k] of dp[i-j] + f(j) ← the <strong>Gift-Packing / K-segment skeleton</strong>'
    ],
    outcome: 'Take any “choose a subset to hit a target / maximise value” statement and write a correct recurrence in under 4 minutes on paper, with nothing to look up.',
    avoid: ['Memoising with HashMaps', 'Interval DP', 'Digit DP', 'Bitmask (that is Week 2)', 'Anything recursive you cannot also write as a loop']
  },
  {
    id: 'w2',
    n: 2,
    sat: 'Sat 17 Oct',
    sun: 'Sun 18 Oct',
    range: 'Mon 12 Oct → Sun 18 Oct',
    title: 'DP Core II + the Infosys number-theory module',
    objective: 'Cover the two hardest DP families Infosys actually asks — partition-into-K and DP over GCD/LCM/divisor states — plus the standard 2-D/string DP you would be embarrassed to miss.',
    topics: ['Grid DP', 'Two-sequence DP (LCS, Edit Distance)', 'LIS both complexities + custom-predicate LIS', 'Partition into exactly K', 'Bitmask subset DP', 'DP where the state is a GCD/LCM/divisor and lives in a HashMap'],
    patterns: [
      'dp[i][j] over two strings; the three-way match / insert / delete transition',
      'LIS O(n²) <em>and</em> patience O(n log n); then <strong>replace a[j] &lt; a[i] with an arbitrary predicate</strong> — divisibility (a[i] % a[j] == 0), bitwise subset ((a[j] &amp; a[i]) == a[j]). This single generalisation covers three separately-reported Infosys problems',
      'dp[i][k] = best way to split prefix i into k groups. Write it once; recognise it as “gift boxes”, “segments”, “subarrays”, “largest sum”',
      '<strong>Bitmask min-cover:</strong> dp[mask] = fewest items to reach mask. This <em>is</em> the twice-reported LCM problem — each number contributes which prime-power requirements it satisfies',
      '<strong>Arithmetic-state DP:</strong> keep map&lt;long,int&gt; from {gcd so far / lcm so far / product mod N} → best answer; derive a new map from the old one per element. Cap the LCM or key by prime exponents, <strong>or you overflow — this is where the reported TLEs came from</strong>',
      'Prime factorization in O(√n), SPF sieve, lcm(a,b) = a / gcd(a,b) * b (<strong>divide before multiplying</strong>)'
    ],
    outcome: 'Solve “find the minimum number of elements whose LCM equals the LCM of the whole array” from scratch, correctly, in under 35 minutes — for n ≤ 20 and for n ≤ 50 with pruning. This is the most valuable deliverable in the plan: it is the only problem reported twice by two independent candidates.',
    avoid: ['Chinese Remainder Theorem', 'Primitive roots', 'Euler totient tricks', 'Möbius', 'Matrix exponentiation', 'Modular inverse beyond Fermat']
  },
  {
    id: 'w3',
    n: 3,
    sat: 'Sat 24 Oct',
    sun: 'Sun 25 Oct',
    range: 'Mon 19 Oct → Sun 25 Oct',
    title: 'Greedy + Binary Search on Answer + Intervals',
    objective: 'Own the medium slot — where your marks actually come from — and install the reflex that converts “minimise the maximum” into a binary search.',
    topics: ['Sort-then-greedy with an exchange argument', 'Interval scheduling and merging', 'Reachability greedy', 'Binary search on answer + greedy feasibility', 'Greedy + heap', 'Monotonic stack'],
    patterns: [
      '<strong>Sort by END for “max number of non-overlapping”; sort by START for “merge”.</strong> Memorise which, and why',
      'Jump Game: track farthest. Jump Game II: expand [curEnd, farthest] level by level. Gas Station: a prefix that goes negative means every start inside it fails',
      '<strong>BS-on-answer template:</strong> lo/hi over the <em>answer space</em>, feasible(x) is a greedy O(n) scan, then while (lo &lt; hi) { mid = lo + (hi-lo)/2; feasible(mid) ? hi = mid : lo = mid+1; }',
      'Trigger phrases: “minimise the maximum”, “maximise the minimum”, “smallest capacity / speed / days such that…”',
      '<strong>Prove the greedy choice in one sentence before coding.</strong> If you cannot, it is a DP problem',
      'Monotonic stack for next-greater / previous-smaller'
    ],
    outcome: 'Classify a problem as greedy / binary-search-on-answer / DP within 90 seconds, and write a correct binary-search-on-answer from memory in 10 minutes.',
    avoid: ['Convex hull trick', 'Li Chao tree', 'Matroid theory', 'Exotic exchange-argument proofs', 'Interval DP']
  },
  {
    id: 'w4',
    n: 4,
    sat: 'Sat 31 Oct',
    sun: 'Sun 1 Nov',
    range: 'Mon 26 Oct → Sun 1 Nov',
    title: 'Graphs + Trees + toolkit closure',
    objective: 'Make BFS / DFS / topo-sort / Dijkstra pure muscle memory, get tree recursion right, and close the remaining toolkit gaps (backtracking, bit).',
    topics: ['Grid flood fill', 'Multi-source BFS', 'Topological sort (Kahn and DFS)', 'Dijkstra with a priority queue', 'Graph + extra state', 'DSU template', 'Tree recursion contract', 'Diameter / max path sum', 'Path sum with prefix map', 'LCA & BST', 'Backtracking', 'XOR tricks'],
    patterns: [
      '<strong>One adjacency-list builder + one BFS + one DFS, from memory in under 3 minutes.</strong> Grid and explicit-graph variants',
      '<strong>Kahn topological sort</strong>, plus the Alien Dictionary reduction: derive edges from adjacent word pairs, handle the prefix-invalid case. Reported by name — practise it specifically',
      'Dijkstra with PriorityQueue and the stale-entry skip: if (d &gt; dist[u]) continue;',
      'Graph + state: the node becomes (node, stopsUsed) or (node, mask)',
      '<strong>Tree contract:</strong> decide what the function returns to its parent before writing a line. Diameter / max-path-sum = “return the best downward path, update a global for the best path through this node”',
      'Path Sum III = prefix-sum HashMap carried down the recursion — <strong>and decremented on the way back up</strong>',
      'Backtracking skeleton: choose → recurse → un-choose, with a pruning condition',
      'XOR: x^x=0, prefix-XOR for subarray queries, Brian Kernighan, common-high-bit-prefix for AND-of-range'
    ],
    outcome: 'Write BFS, DFS, Kahn topo sort, Dijkstra and DSU from blank memory with zero compile errors, and solve an unseen medium tree problem by first stating the return contract out loud.',
    avoid: ['Tarjan / SCC', 'Bridges & articulation points', 'Bellman-Ford', 'Floyd-Warshall (know it exists, one line)', 'Max-flow', 'A*', 'Euler tour', 'LCA by binary lifting', 'Heavy-light decomposition', 'Centroid decomposition']
  },
  {
    id: 'w5',
    n: 5,
    sat: 'Sat 7 Nov',
    sun: 'Sun 8 Nov',
    range: 'Mon 2 Nov → Sun 8 Nov',
    title: 'Mocks only. No new topics.',
    objective: 'Convert knowledge into exam score. The failure mode now is not ignorance — it is time management, implementation bugs and panic. Week 5 attacks exactly those.',
    topics: ['Two full 3-hour / 4-problem mocks', 'Two 45-minute single-problem sprints', 'Structured post-mortems', 'Templates from blank memory', 'Complexity drills', 'Error-log review'],
    patterns: [
      'Weekdays: templates from blank memory, complexity drills, re-reading your error log. No new material',
      'Weekend: both mock formats under strict no-AI / no-Google conditions, each followed by a full post-mortem and a re-solve of every failure'
    ],
    outcome: 'A measured failure-category histogram that tells you exactly what the final three days should fix — and the muscle memory to open a paper by scanning all problems instead of typing.',
    avoid: ['Learning a new topic', 'Starting a new problem list', 'Reading another “Infosys 2026 pattern” blog post', 'Anything new entering your head after 1 Nov']
  }
];

/* --------------------------------------------------------------- problems */

export const DIFF = { E: 'Easy', M: 'Medium', H: 'Hard' };
export const PRI = {
  must:   { label: 'MUST DO',  icon: '🔥', cls: 'pri-must' },
  should: { label: 'SHOULD DO', icon: '🟠', cls: 'pri-should' },
  iftime: { label: 'IF TIME',  icon: '🟡', cls: 'pri-iftime' }
};

export const PROBLEMS = [
  /* ---- Week 1 Saturday: 3 calibration + 5 DP ---- */
  { id:'p01', wk:'w1', day:'sat', n:1,  title:'Maximum Subarray', src:'LC 53', url:'https://leetcode.com/problems/maximum-subarray/', diff:'E', pat:'Kadane', pri:'must', group:'Calibration — time each one; this is your honest baseline' },
  { id:'p02', wk:'w1', day:'sat', n:2,  title:'Subarray Sum Equals K', src:'LC 560', url:'https://leetcode.com/problems/subarray-sum-equals-k/', diff:'M', pat:'Prefix sum + HashMap', pri:'must', group:'Calibration — time each one; this is your honest baseline' },
  { id:'p03', wk:'w1', day:'sat', n:3,  title:'Longest Substring Without Repeating Characters', src:'LC 3', url:'https://leetcode.com/problems/longest-substring-without-repeating-characters/', diff:'M', pat:'Sliding window', pri:'must', group:'Calibration — time each one; this is your honest baseline' },
  { id:'p04', wk:'w1', day:'sat', n:4,  title:'Climbing Stairs', src:'LC 70', url:'https://leetcode.com/problems/climbing-stairs/', diff:'E', pat:'1D DP base case', pri:'must', group:'DP Core I', note:'Asked verbatim in an Infosys interview, Sep 2025' },
  { id:'p05', wk:'w1', day:'sat', n:5,  title:'House Robber', src:'LC 198', url:'https://leetcode.com/problems/house-robber/', diff:'M', pat:'Pick / skip', pri:'must', group:'DP Core I' },
  { id:'p06', wk:'w1', day:'sat', n:6,  title:'House Robber II', src:'LC 213', url:'https://leetcode.com/problems/house-robber-ii/', diff:'M', pat:'Circular variant — run base twice', pri:'must', group:'DP Core I' },
  { id:'p07', wk:'w1', day:'sat', n:7,  title:'Coin Change', src:'LC 322', url:'https://leetcode.com/problems/coin-change/', diff:'M', pat:'Unbounded, minimise count', pri:'must', group:'DP Core I' },
  { id:'p08', wk:'w1', day:'sat', n:8,  title:'Coin Change II', src:'LC 518', url:'https://leetcode.com/problems/coin-change-ii/', diff:'M', pat:'Count combinations — loop order', pri:'must', group:'DP Core I', note:'Understand why the loop order changes the answer. This is the point of the problem' },

  /* ---- Week 1 Sunday ---- */
  { id:'p09', wk:'w1', day:'sun', n:9,  title:'0/1 Knapsack', src:'GFG', url:'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1', diff:'M', pat:'The canonical template', pri:'must' },
  { id:'p10', wk:'w1', day:'sun', n:10, title:'Partition Equal Subset Sum', src:'LC 416', url:'https://leetcode.com/problems/partition-equal-subset-sum/', diff:'M', pat:'Subset sum', pri:'must' },
  { id:'p11', wk:'w1', day:'sun', n:11, title:'Target Sum', src:'LC 494', url:'https://leetcode.com/problems/target-sum/', diff:'M', pat:'Sign → subset-sum transform', pri:'must' },
  { id:'p12', wk:'w1', day:'sun', n:12, title:'Last Stone Weight II', src:'LC 1049', url:'https://leetcode.com/problems/last-stone-weight-ii/', diff:'M', pat:'Min-difference partition', pri:'must' },
  { id:'p13', wk:'w1', day:'sun', n:13, title:'Partition Array for Maximum Sum', src:'LC 1043', url:'https://leetcode.com/problems/partition-array-for-maximum-sum/', diff:'M', pat:'Look-back-k — the K-segment skeleton', pri:'must', note:'This skeleton is the “Gift Packing / K boxes” family reported by two sources' },
  { id:'p14', wk:'w1', day:'sun', n:14, title:'Minimum Cost For Tickets', src:'LC 983', url:'https://leetcode.com/problems/minimum-cost-for-tickets/', diff:'M', pat:'State-transition DP', pri:'must' },
  { id:'p15', wk:'w1', day:'sun', n:15, title:'Decode Ways', src:'LC 91', url:'https://leetcode.com/problems/decode-ways/', diff:'M', pat:'1D DP with nasty edge cases (zeros)', pri:'must' },

  /* ---- Week 2 Saturday ---- */
  { id:'p16', wk:'w2', day:'sat', n:16, title:'Unique Paths II', src:'LC 63', url:'https://leetcode.com/problems/unique-paths-ii/', diff:'M', pat:'Grid DP + obstacles', pri:'must' },
  { id:'p17', wk:'w2', day:'sat', n:17, title:'Minimum Path Sum', src:'LC 64', url:'https://leetcode.com/problems/minimum-path-sum/', diff:'M', pat:'Grid DP', pri:'must' },
  { id:'p18', wk:'w2', day:'sat', n:18, title:'Longest Common Subsequence', src:'LC 1143', url:'https://leetcode.com/problems/longest-common-subsequence/', diff:'M', pat:'Two-sequence DP', pri:'must', note:'Named in the May 2026 candidate report' },
  { id:'p19', wk:'w2', day:'sat', n:19, title:'Edit Distance', src:'LC 72', url:'https://leetcode.com/problems/edit-distance/', diff:'M', pat:'Three-way transition', pri:'must' },
  { id:'p20', wk:'w2', day:'sat', n:20, title:'Longest Increasing Subsequence', src:'LC 300', url:'https://leetcode.com/problems/longest-increasing-subsequence/', diff:'M', pat:'LIS — do BOTH O(n²) and O(n log n)', pri:'must' },
  { id:'p21', wk:'w2', day:'sat', n:21, title:'Largest Divisible Subset', src:'LC 368', url:'https://leetcode.com/problems/largest-divisible-subset/', diff:'M', pat:'LIS with a divisibility predicate', pri:'must', note:'Closest proxy to the Infosys “Conditional LIS” / “LIS with Bitwise Condition” reported by three sources' },
  { id:'p22', wk:'w2', day:'sat', n:22, title:'Split Array Largest Sum', src:'LC 410', url:'https://leetcode.com/problems/split-array-largest-sum/', diff:'H', pat:'Partition-into-K DP ⊕ binary-search-on-answer', pri:'must', note:'Solve it TWICE — once as DP, once as BS-on-answer. Two patterns, one problem' },
  { id:'p23', wk:'w2', day:'sat', n:23, title:'Number of Longest Increasing Subsequence', src:'LC 673', url:'https://leetcode.com/problems/number-of-longest-increasing-subsequence/', diff:'M', pat:'LIS + counting', pri:'should' },

  /* ---- Week 2 Sunday: the Infosys signature day ---- */
  { id:'p24', wk:'w2', day:'sun', n:24, title:'Smallest Sufficient Team', src:'LC 1125', url:'https://leetcode.com/problems/smallest-sufficient-team/', diff:'H', pat:'Bitmask min-cover DP', pri:'must', note:'Structurally identical to the twice-reported Infosys LCM problem' },
  { id:'p25', wk:'w2', day:'sun', n:25, title:'Minimum elements whose LCM = array LCM', src:'write it yourself', url:'https://www.geeksforgeeks.org/lcm-of-given-array-elements/', diff:'H', pat:'Factorize → prime-power requirement set → dp[mask] min-cover', pri:'must', note:'THE actual reported Infosys problem — reported independently in Sep 2025 and Oct 2025. Implement from scratch for n ≤ 20, then with pruning for n ≤ 50. Highest-value single problem in this plan', star:true },
  { id:'p26', wk:'w2', day:'sun', n:26, title:'Partition to K Equal Sum Subsets', src:'LC 698', url:'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/', diff:'M', pat:'Bitmask DP / pruned backtracking', pri:'must' },
  { id:'p27', wk:'w2', day:'sun', n:27, title:'Maximize Score After N Operations', src:'LC 1799', url:'https://leetcode.com/problems/maximize-score-after-n-operations/', diff:'H', pat:'Bitmask DP + GCD', pri:'must', note:'Near-exact proxy for the “DP + GCD” problem reported Mar 2025' },
  { id:'p28', wk:'w2', day:'sun', n:28, title:'Word Break', src:'LC 139', url:'https://leetcode.com/problems/word-break/', diff:'M', pat:'DP + HashSet', pri:'must' },
  { id:'p29', wk:'w2', day:'sun', n:29, title:'Maximum Product Subarray', src:'LC 152', url:'https://leetcode.com/problems/maximum-product-subarray/', diff:'M', pat:'Two-state DP', pri:'should' },
  { id:'p30', wk:'w2', day:'sun', n:30, title:'Number of Different Subsequences GCDs', src:'LC 1819', url:'https://leetcode.com/problems/number-of-different-subsequences-gcds/', diff:'H', pat:'DP over divisor states', pri:'should', note:'The “DP + HashMap + prime factorization” family reported Mar 2025' },

  /* ---- Week 3 Saturday ---- */
  { id:'p31', wk:'w3', day:'sat', n:31, title:'Jump Game', src:'LC 55', url:'https://leetcode.com/problems/jump-game/', diff:'M', pat:'Reachability greedy', pri:'must' },
  { id:'p32', wk:'w3', day:'sat', n:32, title:'Jump Game II', src:'LC 45', url:'https://leetcode.com/problems/jump-game-ii/', diff:'M', pat:'Level-expansion greedy', pri:'must' },
  { id:'p33', wk:'w3', day:'sat', n:33, title:'Gas Station', src:'LC 134', url:'https://leetcode.com/problems/gas-station/', diff:'M', pat:'Reachability greedy', pri:'must', note:'Reported by name TWICE — Sep 2025 onsite round, and Dec 2024 L2 interview as “Circular Tour”', star:true },
  { id:'p34', wk:'w3', day:'sat', n:34, title:'Merge Intervals', src:'LC 56', url:'https://leetcode.com/problems/merge-intervals/', diff:'M', pat:'Sort by START', pri:'must', note:'Reported in a Sep 2026 live coding round' },
  { id:'p35', wk:'w3', day:'sat', n:35, title:'Insert Interval', src:'LC 57', url:'https://leetcode.com/problems/insert-interval/', diff:'M', pat:'Interval insertion', pri:'must', note:'Reported by name, Feb 2025 L2 interview' },
  { id:'p36', wk:'w3', day:'sat', n:36, title:'Non-overlapping Intervals', src:'LC 435', url:'https://leetcode.com/problems/non-overlapping-intervals/', diff:'M', pat:'Sort by END = activity selection', pri:'must' },
  { id:'p37', wk:'w3', day:'sat', n:37, title:'Minimum Arrows to Burst Balloons', src:'LC 452', url:'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/', diff:'M', pat:'Same pattern, different clothes', pri:'must' },
  { id:'p38', wk:'w3', day:'sat', n:38, title:'Assign Cookies', src:'LC 455', url:'https://leetcode.com/problems/assign-cookies/', diff:'E', pat:'Sort + two-pointer pairing', pri:'should' },

  /* ---- Week 3 Sunday ---- */
  { id:'p39', wk:'w3', day:'sun', n:39, title:'Koko Eating Bananas', src:'LC 875', url:'https://leetcode.com/problems/koko-eating-bananas/', diff:'M', pat:'BS on answer — the template', pri:'must' },
  { id:'p40', wk:'w3', day:'sun', n:40, title:'Capacity To Ship Packages Within D Days', src:'LC 1011', url:'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', diff:'M', pat:'BS on answer + greedy feasibility', pri:'must' },
  { id:'p41', wk:'w3', day:'sun', n:41, title:'Magnetic Force Between Two Balls', src:'LC 1552', url:'https://leetcode.com/problems/magnetic-force-between-two-balls/', diff:'M', pat:'Maximise the minimum (= Aggressive Cows)', pri:'must' },
  { id:'p42', wk:'w3', day:'sun', n:42, title:'Minimum Days to Make m Bouquets', src:'LC 1482', url:'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/', diff:'M', pat:'BS on answer, non-obvious search space', pri:'must' },
  { id:'p43', wk:'w3', day:'sun', n:43, title:'Job Sequencing Problem', src:'GFG', url:'https://www.geeksforgeeks.org/problems/job-sequencing-problem-1587115620/1', diff:'M', pat:'Greedy by profit + slot / DSU', pri:'must' },
  { id:'p44', wk:'w3', day:'sun', n:44, title:'Next Greater Element II', src:'LC 503', url:'https://leetcode.com/problems/next-greater-element-ii/', diff:'M', pat:'Monotonic stack', pri:'should' },
  { id:'p45', wk:'w3', day:'sun', n:45, title:'Task Scheduler', src:'LC 621', url:'https://leetcode.com/problems/task-scheduler/', diff:'M', pat:'Greedy + frequency reasoning', pri:'iftime' },
  { id:'p46', wk:'w3', day:'sun', n:46, title:'Minimum Platforms', src:'GFG', url:'https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1', diff:'M', pat:'Two sorted arrays / heap', pri:'iftime' },

  /* ---- Week 4 Saturday: graphs ---- */
  { id:'p47', wk:'w4', day:'sat', n:47, title:'Number of Islands', src:'LC 200', url:'https://leetcode.com/problems/number-of-islands/', diff:'M', pat:'Grid DFS', pri:'must', note:'Reported as the “warships grid” variant, Dec 2024 onsite' },
  { id:'p48', wk:'w4', day:'sat', n:48, title:'Rotting Oranges', src:'LC 994', url:'https://leetcode.com/problems/rotting-oranges/', diff:'M', pat:'Multi-source BFS', pri:'must' },
  { id:'p49', wk:'w4', day:'sat', n:49, title:'01 Matrix', src:'LC 542', url:'https://leetcode.com/problems/01-matrix/', diff:'M', pat:'Multi-source BFS, distance layering', pri:'should' },
  { id:'p50', wk:'w4', day:'sat', n:50, title:'Course Schedule II', src:'LC 210', url:'https://leetcode.com/problems/course-schedule-ii/', diff:'M', pat:'Kahn topo sort + cycle detection', pri:'must' },
  { id:'p51', wk:'w4', day:'sat', n:51, title:'Alien Dictionary', src:'GFG', url:'https://www.geeksforgeeks.org/problems/alien-dictionary/1', diff:'H', pat:'Topological sort from pairwise comparisons', pri:'must', note:'Reported by name in the Sep 2025 onsite round', star:true },
  { id:'p52', wk:'w4', day:'sat', n:52, title:'Network Delay Time', src:'LC 743', url:'https://leetcode.com/problems/network-delay-time/', diff:'M', pat:'Dijkstra', pri:'must', note:'Shortest path named in the May 2026 report; Dijkstra pseudocode also asked in interviews' },
  { id:'p53', wk:'w4', day:'sat', n:53, title:'Cheapest Flights Within K Stops', src:'LC 787', url:'https://leetcode.com/problems/cheapest-flights-within-k-stops/', diff:'M', pat:'Graph + state', pri:'must' },
  { id:'p54', wk:'w4', day:'sat', n:54, title:'Number of Provinces', src:'LC 547', url:'https://leetcode.com/problems/number-of-provinces/', diff:'M', pat:'Components + DSU template', pri:'should' },

  /* ---- Week 4 Sunday: trees + closure ---- */
  { id:'p55', wk:'w4', day:'sun', n:55, title:'Maximum Depth of Binary Tree', src:'LC 104', url:'https://leetcode.com/problems/maximum-depth-of-binary-tree/', diff:'E', pat:'The return-contract warm-up', pri:'must' },
  { id:'p56', wk:'w4', day:'sun', n:56, title:'Diameter of Binary Tree', src:'LC 543', url:'https://leetcode.com/problems/diameter-of-binary-tree/', diff:'M', pat:'Return height, update global — the core tree-DP trick', pri:'must' },
  { id:'p57', wk:'w4', day:'sun', n:57, title:'Binary Tree Maximum Path Sum', src:'LC 124', url:'https://leetcode.com/problems/binary-tree-maximum-path-sum/', diff:'H', pat:'Same trick, with negative-value traps', pri:'must' },
  { id:'p58', wk:'w4', day:'sun', n:58, title:'Lowest Common Ancestor of a Binary Tree', src:'LC 236', url:'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', diff:'M', pat:'Combine left / right results', pri:'must' },
  { id:'p59', wk:'w4', day:'sun', n:59, title:'Path Sum III', src:'LC 437', url:'https://leetcode.com/problems/path-sum-iii/', diff:'M', pat:'Prefix-sum HashMap on a tree', pri:'must', note:'Tree + HashMap — very Infosys. Remember to decrement the map on unwind' },
  { id:'p60', wk:'w4', day:'sun', n:60, title:'Validate BST + Kth Smallest in BST', src:'LC 98 + LC 230', url:'https://leetcode.com/problems/validate-binary-search-tree/', diff:'M', pat:'BST bounds / inorder is sorted', pri:'must', note:'One slot, two quick solves' },
  { id:'p61', wk:'w4', day:'sun', n:61, title:'Generate Parentheses', src:'LC 22', url:'https://leetcode.com/problems/generate-parentheses/', diff:'M', pat:'Backtracking', pri:'must', note:'Reported by name in the Sep 2025 onsite round' },
  { id:'p62', wk:'w4', day:'sun', n:62, title:'Bitwise AND of Numbers Range', src:'LC 201', url:'https://leetcode.com/problems/bitwise-and-of-numbers-range/', diff:'M', pat:'Common high-bit prefix', pri:'should', note:'“Bitwise AND of Range” appears in two separate question lists' },
  { id:'p63', wk:'w4', day:'sun', n:63, title:'House Robber III', src:'LC 337', url:'https://leetcode.com/problems/house-robber-iii/', diff:'M', pat:'Tree DP pick / skip', pri:'should' },
  { id:'p64', wk:'w4', day:'sun', n:64, title:'Single Number + Counting Bits', src:'LC 136 + LC 338', url:'https://leetcode.com/problems/single-number/', diff:'E', pat:'XOR cancellation; bit DP recurrence', pri:'should', note:'One slot, two quick solves' },

  /* ---- Overflow pool ---- */
  { id:'p65', wk:'pool', day:'pool', n:65, title:'Count inversions via merge sort', src:'GFG', url:'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', diff:'M', pat:'Merge sort counting', pri:'iftime', note:'Do this one if you do any from the pool — the Dec 2025 Q2 was an inversion-counting problem' },
  { id:'p66', wk:'pool', day:'pool', n:66, title:'Minimum Window Substring', src:'LC 76', url:'https://leetcode.com/problems/minimum-window-substring/', diff:'H', pat:'Variable sliding window', pri:'iftime', note:'Asked in a takeuforward-reported L2 interview, O(n) demanded' },
  { id:'p67', wk:'pool', day:'pool', n:67, title:'Maximum XOR of Two Numbers in an Array', src:'LC 421', url:'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/', diff:'M', pat:'Bit-greedy prefix (skip the Trie class)', pri:'iftime' },
  { id:'p68', wk:'pool', day:'pool', n:68, title:'Perfect Squares', src:'LC 279', url:'https://leetcode.com/problems/perfect-squares/', diff:'M', pat:'Unbounded knapsack variant', pri:'iftime' },
  { id:'p69', wk:'pool', day:'pool', n:69, title:'Combination Sum IV', src:'LC 377', url:'https://leetcode.com/problems/combination-sum-iv/', diff:'M', pat:'Count ordered — loop order contrast', pri:'iftime' },
  { id:'p70', wk:'pool', day:'pool', n:70, title:'Number of Dice Rolls With Target Sum', src:'LC 1155', url:'https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/', diff:'M', pat:'Counting DP with bounded choices', pri:'iftime' },
  { id:'p71', wk:'pool', day:'pool', n:71, title:'Longest Consecutive Sequence', src:'LC 128', url:'https://leetcode.com/problems/longest-consecutive-sequence/', diff:'M', pat:'HashSet, start only when predecessor absent', pri:'iftime' },
  { id:'p72', wk:'pool', day:'pool', n:72, title:'All Nodes Distance K in Binary Tree', src:'LC 863', url:'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/', diff:'M', pat:'Tree → graph, BFS from target', pri:'iftime' },
  { id:'p73', wk:'pool', day:'pool', n:73, title:'Burst Balloons', src:'LC 312', url:'https://leetcode.com/problems/burst-balloons/', diff:'H', pat:'Interval DP', pri:'iftime' },
  { id:'p74', wk:'pool', day:'pool', n:74, title:'Min Cost to Connect All Points', src:'LC 1584', url:'https://leetcode.com/problems/min-cost-to-connect-all-points/', diff:'M', pat:'MST with your DSU template', pri:'iftime' }
];

export const SIMS = [
  { id:'s1', wk:'w1', when:'Sun 11 Oct, evening', brief:'Re-solve LC 1043 (Partition Array for Maximum Sum) from blank memory. Phone in another room, no notes.', target:'Correct in 25 minutes' },
  { id:'s2', wk:'w2', when:'Sun 18 Oct, evening', brief:'Re-solve the LCM min-subsequence problem (p25) from blank memory.', target:'If you cannot, it becomes your #1 weekday priority for Week 3' },
  { id:'s3', wk:'w3', when:'Sun 25 Oct, evening', brief:'1 of 2 — pick one and finish it completely: LC 918 Maximum Sum Circular Subarray, or LC 2344 Minimum Deletions to Make Array Divisible.', target:'One fully correct in 45 minutes' },
  { id:'s4', wk:'w4', when:'Sun 1 Nov, evening', brief:'1 of 2 — LC 1584 Min Cost to Connect All Points, or LC 174 Dungeon Game.', target:'One fully correct in 45 minutes' }
];

/* --------------------------------------------------------- weekday theory */
/* Weekday evenings are videos + paper only. No mandatory problem solving. */

export const WEEKDAY_RITUAL = [
  { mins: '35–45 min', what: 'Watch, with a notebook open.' },
  { mins: '20 min', what: 'Close the video. On paper, write the recurrence / template / return-contract <strong>from memory</strong>.' },
  { mins: '15 min', what: 'Dry-run it by hand on a 5-element input, writing out the DP table cell by cell.' },
  { mins: '5 min', what: 'Add one line to your Error Log.' }
];

export const WEEKDAYS = [
  { id:'d01', wk:'w1', date:'Wed 7 Oct',  watch:'Striver DP playlist, DP-1 → DP-4 (intro, memo→tab→space-opt, Frog Jump)', paper:'The 5-step ritual, written out as a checklist you will reuse all month' },
  { id:'d02', wk:'w1', date:'Thu 8 Oct',  watch:'Striver DP-7 → DP-11 (House Robber, grids)', paper:'dp[i] pick/skip recurrence + the circular-array fix' },
  { id:'d03', wk:'w1', date:'Fri 9 Oct',  watch:'Striver DP-14 → DP-19 (subset sum, equal partition, min-difference, count-subsets)', paper:'One boolean subset-sum table, hand-filled for {2,3,5}, target 5' },
  { id:'d04', wk:'w1', date:'Mon 12 Oct', watch:'Striver DP-20 → DP-23 (0/1 knapsack, coin change, unbounded)', paper:'Both 1-D loops side by side, with the reason each direction is required' },
  { id:'d05', wk:'w1', date:'Tue 13 Oct', watch:'DP on grids + Unique Paths / Min Path Sum', paper:'A 3×3 grid DP filled by hand' },
  { id:'d06', wk:'w2', date:'Wed 14 Oct', watch:'LCS block (Striver DP-25 → DP-28)', paper:'LCS table for "abcde" / "ace", hand-filled' },
  { id:'d07', wk:'w2', date:'Thu 15 Oct', watch:'Edit Distance + Distinct Subsequences', paper:'The three-way transition, annotated with what each branch means' },
  { id:'d08', wk:'w2', date:'Fri 16 Oct', watch:'LIS block (Striver DP-41 → DP-43), O(n²) and O(n log n)', paper:'Both versions from memory; then rewrite the comparator as a generic canFollow(a,b) predicate' },
  { id:'d09', wk:'w2', date:'Mon 19 Oct', watch:'Bitmask DP — Errichto’s bitmask DP video is the best single source', paper:'dp[mask] template + the iterate-over-items transition', key:true },
  { id:'d10', wk:'w2', date:'Tue 20 Oct', watch:'GCD, LCM, Euclidean algorithm, prime factorization in O(√n), SPF sieve', paper:'lcm(a,b) = a/gcd(a,b)*b with the overflow note; O(√n) factorize written out', key:true },
  { id:'d11', wk:'w2', date:'Wed 21 Oct', watch:'Search the exact phrase "minimum elements with LCM equal to array LCM"; work through any solution, then close it', paper:'Full approach on paper: prime-power requirement set → bitmask cover → dp[mask]', key:true },
  { id:'d12', wk:'w2', date:'Thu 22 Oct', watch:'DP over GCD states — walk the LC 1819 and LC 1799 editorials', paper:'The "map of states, derive new map from old" pattern, generalised', key:true },
  { id:'d13', wk:'w2', date:'Fri 23 Oct', watch:'Partition-into-K DP — Split Array Largest Sum editorial, DP version AND BS version', paper:'dp[i][k] recurrence + the equivalent feasible(maxSum) greedy', key:true },
  { id:'d14', wk:'w3', date:'Mon 26 Oct', watch:'Greedy fundamentals + exchange argument; activity selection', paper:'"Sort by END / sort by START" decision rule, one line each' },
  { id:'d15', wk:'w3', date:'Tue 27 Oct', watch:'Jump Game I & II, Gas Station solution explanations', paper:'Why a failing prefix lets you skip all its start points' },
  { id:'d16', wk:'w3', date:'Wed 28 Oct', watch:'Binary search on answer — Striver BS playlist, "BS on answers" section', paper:'The exact template + a list of 8 trigger phrases' },
  { id:'d17', wk:'w3', date:'Thu 29 Oct', watch:'Koko / Ship Packages / Aggressive Cows / Bouquets explanations back to back', paper:'One feasible(x) function per problem — see that they are the same shape' },
  { id:'d18', wk:'w3', date:'Fri 30 Oct', watch:'Graph representation, BFS, DFS (Striver Graph 1 → 8)', paper:'Adjacency-list builder + BFS + DFS from memory' },
  { id:'d19', wk:'w4', date:'Mon 2 Nov',  watch:'Topological sort — Kahn + DFS; Alien Dictionary', paper:'Kahn template; the Alien Dictionary edge-derivation' },
  { id:'d20', wk:'w4', date:'Tue 3 Nov',  watch:'Dijkstra (Striver Graph 32 → 34)', paper:'Dijkstra with the stale-entry skip, from memory' },
  { id:'d21', wk:'w4', date:'Wed 4 Nov',  watch:'DSU (Striver Graph 44 → 45) + Kruskal', paper:'find with path compression + union by size — memorised' },
  { id:'d22', wk:'w4', date:'Thu 5 Nov',  watch:'Nothing new. Templates 1–10 from blank memory on paper', paper:'Mark every template you fumbled. Re-read the Error Log end to end', taper:true },
  { id:'d23', wk:'w4', date:'Fri 6 Nov',  watch:'Nothing new. Templates 11–20 from blank memory', paper:'Complexity drill: 15 constraint bounds → implied technique, under 10 s each. Then read the trigger table aloud', taper:true },
  { id:'d24', wk:'w5', date:'Mon 9 Nov',  watch:'No videos. Re-solve, from blank, the 3 problems you failed worst across both mocks', paper:'Nothing else. 90 minutes maximum', taper:true },
  { id:'d25', wk:'w5', date:'Tue 10 Nov', watch:'No videos. Templates from blank, final pass — only the ones you fumbled on 5–6 Nov', paper:'Then read your one-page sheet twice. 60 minutes. Stop early', taper:true },
  { id:'d26', wk:'w5', date:'Wed 11 Nov', watch:'30 minutes maximum. Read the one-page sheet once', paper:'Write the Dijkstra and dp[mask] templates once. Then stop. Logistics + early sleep', taper:true }
];

export const CHANNELS = [
  { rank:1, name:'take U forward (Striver)', why:'DP, Graph and Binary Search playlists. Best structure-to-time ratio in existence. <strong>This is your spine.</strong>' },
  { rank:2, name:'Errichto', why:'Bitmask DP, and "how to think about constraints" — which directly addresses this exam’s biggest tell.' },
  { rank:3, name:'Aditya Verma', why:'DP playlist, <em>only if</em> Striver’s framing does not click. His recursion→memo narration suits people who fear DP.' },
  { rank:4, name:'NeetCode', why:'Single-problem explanations when you are stuck on one thing. Not for learning a topic.' },
  { rank:0, name:'Avoid', why:'Long "Infosys 2026 pattern" YouTube videos, CP contest streams, 10-hour DSA marathons.' }
];

/* ------------------------------------------------------------------ mocks */

export const MOCK_CONDITIONS = [
  'Phone in another room. One screen.',
  '<strong>No AI, no Google, no editorials.</strong> Disable Copilot / Cursor AI completely.',
  'Language reference docs only — you would have those in the real test.',
  'Paper and pen on the desk. A visible countdown timer.',
  'If someone is home, ask them to interrupt you twice. The Sep 2025 report says interviewers interrupt <em>on purpose</em>.'
];

export const MOCKS = [
  {
    id:'mockA', kind:'full', when:'Sat 7 Nov, 09:00–12:00', title:'MOCK A — 3 hours, 4 problems',
    problems:[
      { id:'mA1', title:'XOR Queries of a Subarray', src:'LC 1310', url:'https://leetcode.com/problems/xor-queries-of-a-subarray/', diff:'E', pat:'Prefix XOR' },
      { id:'mA2', title:'Minimum Limit of Balls in a Bag', src:'LC 1760', url:'https://leetcode.com/problems/minimum-limit-of-balls-in-a-bag/', diff:'M', pat:'BS on answer' },
      { id:'mA3', title:'Maximum Profit in Job Scheduling', src:'LC 1235', url:'https://leetcode.com/problems/maximum-profit-in-job-scheduling/', diff:'H', pat:'Sort + DP + binary search' },
      { id:'mA4', title:'Shortest Path Visiting All Nodes', src:'LC 847', url:'https://leetcode.com/problems/shortest-path-visiting-all-nodes/', diff:'H', pat:'Bitmask + BFS · n ≤ 12 ("complex" slot)' }
    ]
  },
  {
    id:'sprint1', kind:'sprint', when:'Sat 7 Nov, 17:30–18:15', title:'SPRINT SIM 1 — 45 min, choose 1 of 2',
    problems:[
      { id:'s1a', title:'Perfect Squares', src:'LC 279', url:'https://leetcode.com/problems/perfect-squares/', diff:'M', pat:'Unbounded knapsack variant' },
      { id:'s1b', title:'Combination Sum IV', src:'LC 377', url:'https://leetcode.com/problems/combination-sum-iv/', diff:'M', pat:'Counting DP, loop order' }
    ]
  },
  {
    id:'mockB', kind:'full', when:'Sun 8 Nov, 09:00–12:00', title:'MOCK B — 3 hours, 4 problems',
    problems:[
      { id:'mB1', title:'Max Consecutive Ones III', src:'LC 1004', url:'https://leetcode.com/problems/max-consecutive-ones-iii/', diff:'M', pat:'Sliding window' },
      { id:'mB2', title:'Minimum Falling Path Sum', src:'LC 931', url:'https://leetcode.com/problems/minimum-falling-path-sum/', diff:'M', pat:'Grid DP' },
      { id:'mB3', title:'Distinct Subsequences', src:'LC 115', url:'https://leetcode.com/problems/distinct-subsequences/', diff:'H', pat:'Two-sequence counting DP' },
      { id:'mB4', title:'Unique Paths III', src:'LC 980', url:'https://leetcode.com/problems/unique-paths-iii/', diff:'H', pat:'Backtracking with pruning ("complex" slot)' }
    ]
  },
  {
    id:'sprint2', kind:'sprint', when:'Sun 8 Nov, 17:30–18:15', title:'SPRINT SIM 2 — 45 min, choose 1 of 2',
    problems:[
      { id:'s2a', title:'Beautiful Arrangement', src:'LC 526', url:'https://leetcode.com/problems/beautiful-arrangement/', diff:'M', pat:'Bitmask DP' },
      { id:'s2b', title:'Number of Dice Rolls With Target Sum', src:'LC 1155', url:'https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/', diff:'M', pat:'Counting DP' }
    ]
  }
];

export const POSTMORTEM = [
  '<strong>What was the pattern?</strong> Name it from the trigger table.',
  '<strong>What was the constraint tell, and did I read it?</strong> Write the n-bound and what it implied.',
  '<strong>Time spent vs time it should have taken.</strong> Where did the minutes actually go?',
  '<strong>Failure category</strong> — exactly one: pattern not recognised / recognised but could not derive / derived but implementation bug / wrong complexity / edge case / ran out of time.',
  '<strong>For bugs: what was the specific bug?</strong> Overflow? Off-by-one? Wrong init? Mod? Write the line.',
  '<strong>Only now read the editorial.</strong> Then close it and re-implement from blank.'
];

/* --------------------------------------------------------------- strategy */

export const CONSTRAINTS = [
  { bound:'n ≤ 20 (or ≤ 22)', budget:'2ⁿ · n ≈ 2e7', means:'<strong>Bitmask DP / subset enumeration.</strong> Nothing else. Stop looking for a polynomial trick' },
  { bound:'n ≤ 100', budget:'O(n³) / O(n⁴)', means:'Interval DP, Floyd-Warshall, 3-nested DP' },
  { bound:'n ≤ 1000–2000', budget:'O(n²) = 1e6', means:'<strong>2-D DP:</strong> LCS, edit distance, LIS O(n²), partition-into-K' },
  { bound:'n ≤ 1e5', budget:'O(n log n)', means:'Sort+greedy, BS on answer, prefix sum, sliding window, heap, DP with O(1) transition. <strong>O(n²) is dead</strong>' },
  { bound:'n ≤ 1e6', budget:'O(n), small constant', means:'Linear scans only. Watch memory' },
  { bound:'values ≤ 1e9, n small', budget:'—', means:'Binary search on answer, <strong>number theory / GCD / factorization</strong>, bit tricks' },
  { bound:'n ≤ 50 with big values', budget:'—', means:'Infosys’s favourite: <strong>factorize, then DP over prime-power states</strong> — this was the LCM problem’s shape' }
];

export const TRIGGERS = [
  { says:'"minimise the maximum" / "maximise the minimum" / "smallest X such that"', think:'Binary search on answer + greedy feasible(x)' },
  { says:'"count the number of ways"', think:'DP. Never greedy' },
  { says:'"minimum number of elements such that [property of the whole set]"', think:'Bitmask min-cover DP ← the twice-reported Infosys shape', star:true },
  { says:'n ≤ 20 anywhere', think:'Bitmask over subsets', star:true },
  { says:'LCM / GCD / "divisible by" / "factors" / "prime"', think:'Factorize first, then DP over prime-power or divisor states in a HashMap', star:true },
  { says:'"split into exactly K groups / boxes / segments"', think:'dp[i][k] partition DP — and check whether BS-on-answer also works' },
  { says:'"longest subsequence such that consecutive elements satisfy P"', think:'LIS with a custom predicate' },
  { says:'Two strings, "common" / "transform" / "match"', think:'2-D two-sequence DP' },
  { says:'"subarray sum equals / divisible by / XOR equals K"', think:'Prefix (sum or XOR) + HashMap' },
  { says:'"longest / shortest window satisfying P", P monotone', think:'Sliding window' },
  { says:'Sorted array, or the answer is an index / value threshold', think:'Binary search' },
  { says:'"maximum non-overlapping intervals"', think:'Sort by END, greedy' },
  { says:'"merge / insert intervals"', think:'Sort by START' },
  { says:'"can I reach the end" / "minimum jumps" / circular fuel', think:'Reachability greedy' },
  { says:'"top K" / "K-th largest" / repeated min extraction', think:'Heap' },
  { says:'Grid, "connected regions / islands / spread"', think:'Grid BFS/DFS; "spread over time" → multi-source BFS' },
  { says:'"order such that dependencies come first" / ordering from comparisons', think:'Topological sort (Alien Dictionary)' },
  { says:'Weighted shortest path', think:'Dijkstra; with a hop limit → (node, stops) state' },
  { says:'"are these in the same group" / dynamic merging', think:'DSU' },
  { says:'"next greater / previous smaller / span"', think:'Monotonic stack' },
  { says:'"generate all / print all valid"', think:'Backtracking' },
  { says:'"appears once / twice / XOR"', think:'Bit tricks' },
  { says:'"number of inversions"', think:'Merge sort counting — not a BIT' },
  { says:'Tree, "path through any node"', think:'Return best downward, update a global' },
  { says:'Tree, "root-to-node sums"', think:'Prefix-sum HashMap, decremented on unwind' },
  { says:'"distance K in a tree" / needs parents', think:'Treat the tree as a graph, BFS' }
];

export const PATTERN_LIST = [
  { g:'Dynamic Programming', items:['1D pick / skip','0/1 knapsack','Subset sum & partition','Unbounded knapsack / coin change (min & count)','Two-sequence (LCS / edit distance)','Grid DP','LIS — both complexities + custom predicate','Partition into exactly K','Bitmask subset DP (incl. min-cover)','DP over GCD/LCM/divisor states in a HashMap','State-transition DP (cooldowns, modes)'] },
  { g:'Greedy & search', items:['Sort + exchange-argument greedy','Interval scheduling (sort by end)','Interval merging (sort by start)','Reachability greedy','Binary search on answer + greedy feasibility','Greedy + heap'] },
  { g:'Arrays & strings', items:['Prefix sum / prefix XOR + HashMap','Sliding window (fixed & variable)','Two pointers on sorted data','Monotonic stack'] },
  { g:'Graphs', items:['Grid & explicit BFS/DFS, multi-source BFS','Topological sort','Dijkstra','Graph + extra state (stops / mask); DSU for components'] },
  { g:'Trees', items:['Return-contract recursion: return downward value, update global — covers height, diameter, max path sum, balanced, LCA, subtree aggregates'] }
];

export const TEMPLATES = [
  { id:'t01', name:'Fast I/O for your language', detail:'Java: BufferedReader + StringTokenizer. C++: ios::sync_with_stdio(false); cin.tie(nullptr);' },
  { id:'t02', name:'Binary search on answer', detail:'while (lo < hi) { mid = lo + (hi-lo)/2; feasible(mid) ? hi = mid : lo = mid+1; }' },
  { id:'t03', name:'Lower bound / upper bound on a sorted array', detail:'Both, from memory, with the half-open invariant written down' },
  { id:'t04', name:'0/1 knapsack 1-D and unbounded 1-D', detail:'Side by side — weight DESCENDING for 0/1, ASCENDING for unbounded' },
  { id:'t05', name:'Subset sum boolean DP', detail:'Reused for partition / min-diff / counting' },
  { id:'t06', name:'LCS / edit distance 2-D skeleton', detail:'Including the base row and column' },
  { id:'t07', name:'LIS O(n log n) with lowerBound, plus O(n²) with a swappable predicate', detail:'The predicate version is the Infosys variant' },
  { id:'t08', name:'dp[i][k] partition-into-K skeleton', detail:'The "gift boxes / K segments" family' },
  { id:'t09', name:'dp[mask] bitmask DP', detail:'Iterate masks, iterate items, dp[mask | bit] = min(...)' },
  { id:'t10', name:'GCD / LCM + O(√n) factorize + SPF sieve', detail:'lcm(a,b) = a/gcd(a,b)*b — divide before multiplying' },
  { id:'t11', name:'Adjacency list + BFS + DFS', detail:'Grid and graph variants, with a 4-direction array' },
  { id:'t12', name:'Kahn topological sort', detail:'Indegree queue + cycle check' },
  { id:'t13', name:'Dijkstra with PriorityQueue', detail:'Including the stale-entry skip: if (d > dist[u]) continue;' },
  { id:'t14', name:'DSU', detail:'find with path compression, union by size' },
  { id:'t15', name:'Tree recursion skeleton', detail:'With an explicit "returns: …" comment and a global answer' },
  { id:'t16', name:'Backtracking', detail:'choose / recurse / un-choose, with pruning' },
  { id:'t17', name:'Prefix sum + HashMap', detail:'For subarray sum / XOR counting' },
  { id:'t18', name:'Variable sliding window', detail:'Expand, then shrink while invalid' },
  { id:'t19', name:'Merge sort with inversion count', detail:'Your BIT replacement' },
  { id:'t20', name:'Modular arithmetic helpers', detail:'add, mul, and ((x % M) + M) % M' }
];

export const STRATEGY_QA = [
  { q:'How do I scan them?', a:'First <strong>10–12 minutes, no coding at all.</strong> For each problem, on paper, write four things: (a) a one-sentence restatement in your own words, (b) the constraint and implied complexity, (c) your best-guess pattern tag, (d) a confidence score 1–5 and a time estimate. Then rank. <strong>Do not read problem 1 and start coding it</strong> — that is how people finish with one solve.' },
  { q:'How long should I spend understanding each?', a:'~2.5–3 min per problem on the first pass. Then 5–8 min of deep reading on the one you chose to attempt first, <em>including working the provided example by hand</em>. If a problem still does not parse after 3 min, mark it "unknown" and move on — you will come back with a fresher head.' },
  { q:'How do I identify the easiest problem?', a:'Easiest ≠ the one labelled Easy. Easiest = <strong>highest (confidence × pattern familiarity) ÷ implementation length</strong>. Prefer a problem whose pattern you can <em>name</em> over one you can only describe; a short implementation over a short insight; n ≤ 1e5 with a sort / two-pointer / prefix smell over anything with a 2-D table. Red flags that it is slower than it looks: multiple interacting constraints, custom output format, "minimise the number of operations" with no obvious monotonicity, heavy geometry, query-heavy.' },
  { q:'When should I abandon a problem?', a:'Three hard rules. <strong>No approach after 15 min</strong> of focused thought → leave it, next problem, return later. <strong>Approach but no working code after 30 min of coding</strong> → submit your brute force and move on. <strong>Same test failing after 3 debug attempts (~12 min)</strong> → submit what passes, move on. Write your abandon-time on the rough sheet when you start. Decide in advance, not in the moment — in the moment you will always think you are nearly there.' },
  { q:'How much time should I reserve for testing?', a:'Per problem: <strong>~25% of its time budget.</strong> Globally in a 3-hour paper: reserve the <strong>last 20 minutes</strong> for (a) submitting something for every problem, (b) re-running edge cases, (c) checking you left no debug prints. In the 45-min sprint: reserve the last <strong>10 minutes</strong>.' },
  { q:'What if I can only derive a brute force?', a:'<strong>Submit it.</strong> This is not a consolation prize — it is a documented scoring strategy. Three independent sources confirm partial credit, and both reported LCM solvers were <em>selected</em> despite 3 TLEs each (7/10 and 6/9 tests). Sequence: write the brute force → <strong>submit it</strong> → <em>then</em> try to optimise in a separate copy. Never delete working brute force to try an optimisation.' },
  { q:'DP problem and I do not see the recurrence?', a:'Run this ladder, on paper, in order: <strong>1.</strong> Write the brute-force recursion first — "at index i, what choices do I have?" <strong>2.</strong> Ask what makes two sub-problems identical; those variables <em>are</em> your state. <strong>3.</strong> Count the state space; if it exceeds ~1e7 your state is wrong. <strong>4.</strong> Check the constraint tell — n ≤ 20 means the state is a <em>mask</em>; values ≤ 1e9 with small n means the state is a <em>gcd/lcm/divisor</em> in a HashMap. <strong>5.</strong> Define the function in English before any code: "f(i, m) = the minimum number of items from the first i that cover requirement set m." If you cannot say that sentence, you do not have a recurrence. <strong>6.</strong> Write the base case AND where the answer lives — half of all DP bugs are here, not in the transition. <strong>7.</strong> Memoise the recursion; do not attempt bottom-up first under exam pressure.' },
  { q:'Unfamiliar Tree problem?', a:'One question, out loud: <strong>"What does my function return to its parent?"</strong> Then: write the return type and its meaning as a comment before the body; decide whether the answer is the <em>returned value</em> or a <em>global updated during traversal</em> (diameter, max path sum and most "path through a node" problems are the second kind — return the best <strong>downward</strong> path, update a <strong>global</strong> for the best path <strong>through</strong> the node); if it needs parents or "distance K", <strong>convert the tree to an adjacency list and BFS</strong>; if it involves root-to-node sums, carry a prefix-sum HashMap down and <strong>decrement on the way back up</strong>; if it is a BST, the answer almost always uses inorder-is-sorted or bounds propagation.' },
  { q:'Greedy vs DP — how do I tell?', a:'Ask: <strong>"Can I state, in one sentence, why the locally best choice can never be beaten later?"</strong> Yes and the sentence convinces you → greedy. No, or you need "it probably works" → <strong>DP</strong>. Unproved greedy is the most expensive mistake available: it compiles, passes the samples, and fails the hidden tests. Decisive heuristic: <strong>"count the number of ways" is always DP, never greedy</strong>; and if both seem plausible with n ≤ 2000, <strong>write the DP</strong> — slower to code, strictly safer.' },
  { q:'How do I maximise score if I cannot solve everything?', a:'<strong>1.</strong> Submit something for <em>every</em> problem; blank = 0, brute force = 50–60% on a documented basis. <strong>2.</strong> Complete solutions beat partials — every reported threshold is phrased in <em>complete</em> questions ("2 or more → SP"), so finish one properly before starting a third. <strong>3.</strong> Bank the easy problem first and fully; "saving it for later" means never. <strong>4.</strong> If marks are weighted (one source reports 20/30/50), a secured Easy+Medium equals one Hard — <strong>secured beats speculative</strong>. <strong>5.</strong> Spend the last 20 min improving partials, not starting a new problem; adding memoisation to a working recursion often flips several hidden tests. <strong>6.</strong> Never leave a compile error — comment out the broken optimisation and submit the version that builds.' }
];

export const TIMEBOXES = [
  { fmt:'Format Y — 3 hours, 4 problems', rows:[
    ['0:00–0:12','Scan all 4. Write restatement + constraint + pattern tag + confidence. Rank'],
    ['0:12–0:45','Easiest. <strong>Finish and test completely.</strong> Submit'],
    ['0:45–1:35','Second-easiest. Submit whatever works by 1:35'],
    ['1:35–2:30','Hardest you have a shot at. <strong>Brute force first, submit it, then optimise</strong>'],
    ['2:30–2:40','Fourth problem: get <em>anything</em> submitted'],
    ['2:40–3:00','Reserve: edge cases, overflow check, remove debug output, final resubmits']
  ]},
  { fmt:'Format X — 45 minutes, 1 of 2', rows:[
    ['0:00–0:04','Read both. Pick on <em>confidence</em>, not apparent difficulty'],
    ['0:04–0:12','<strong>Derive on paper.</strong> State, transition, base case, complexity. Work the sample by hand — they check your rough sheets, so make them legible'],
    ['0:12–0:32','Code it. Do not optimise while writing'],
    ['0:32–0:42','Test: sample, n=1, empty, all-equal, max value, negatives'],
    ['0:42–0:45','Submit. If TLE, say your optimisation out loud rather than silently flailing']
  ]}
];

export const MISTAKES = [
  { t:'Integer overflow', d:'int sums at n=1e5 with values 1e9 overflow instantly. <strong>Default to long / long long for any sum, product or prefix array.</strong> This is the #1 silent killer' },
  { t:'Forgetting % 1e9+7', d:'Or applying it only at the end. Mod after every add <em>and</em> multiply' },
  { t:'Negative modulo', d:'(a - b) % M can be negative in Java/C++. Always ((a - b) % M + M) % M' },
  { t:'1-based vs 0-based indexing', d:'The Dec 2025 problem statement explicitly specified 1-based. Re-read the convention before coding, and again before submitting' },
  { t:'Input format', d:'Multiple test cases? Reading n then n numbers, or a whole line? Echo the input back once on your first local run' },
  { t:'Memo sentinel collision', d:'Initialising memo to 0 when 0 is a legal answer. Use -1, or a separate visited array' },
  { t:'Recursion depth', d:'n = 1e5 with linear recursion → stack overflow. Convert to iterative, or raise the stack' },
  { t:'Missing fast I/O', d:'Scanner / unsynced cin at n = 1e6 is a TLE on a correct algorithm' },
  { t:'Debug prints left in', d:'Extra stdout output = wrong answer on every test' },
  { t:'Not compiling at submit time', d:'Never leave a half-written optimisation in the submitted file. Comment it out' },
  { t:'HashMap&lt;Integer,Integer&gt; for a dense DP table in Java', d:'10–50× slower than int[]. Exactly what turns 10/10 into 7/10' },
  { t:'String += inside a loop', d:'O(n²). Use StringBuilder' },
  { t:'Untested edge cases', d:'n = 1, empty input, all elements equal, all negative, target 0, single-node tree, disconnected graph, k &gt; n, duplicate values' },
  { t:'Inconsistent comparator', d:'Not a strict weak ordering → runtime exception in Java sorting' },
  { t:'Floating point in binary search', d:'Binary search on <strong>integers</strong> wherever possible; if forced to doubles, fix the iteration count (~100) instead of an epsilon' },
  { t:'Reusing a dirty global between test cases', d:'Clear your arrays and maps' },
  { t:'visited marked on pop instead of push in BFS', d:'Exponential blowup' },
  { t:'Unproved greedy', d:'Passes samples, dies on hidden tests' }
];

export const TRAPS = [
  { t:'O(n²) at n = 1e5', d:'1e10 ops. Hopeless. <strong>Recognise this in the scan phase, not after coding</strong>' },
  { t:'"1e8 simple operations ≈ 1 second"', d:'True-ish for C++. <strong>Java ~2–3× slower; Python ~50× slower.</strong> Budget accordingly' },
  { t:'2ⁿ at n = 25', d:'3.3e7 × per-mask work. Usually too slow. n ≤ 20 is the safe bitmask zone' },
  { t:'2-D DP table at n = 1e5', d:'1e10 cells — <strong>memory limit</strong>, not just time. If the table does not fit, your state is wrong' },
  { t:'LIS O(n²) at n = 1e5', d:'TLE. You need the O(n log n) patience version' },
  { t:'n ≤ 1000', d:'n² = 1e6 ✅ · n³ = 1e9 ❌' },
  { t:'GCD inside a nested loop', d:'Adds a log factor; n²·log at n = 5000 is ~3e8 — borderline' },
  { t:'Sum-over-test-cases constraints', d:'"Sum of n over all test cases ≤ 1e5" is a different budget from "n ≤ 1e5 per case". Read it' },
  { t:'HashMap-memoised recursion', d:'Correct but often 10–30× slower than an array. Fine at n = 1000, fatal at 1e5' },
  { t:'Sorting inside a loop', d:'O(n² log n). Sort once, outside' },
  { t:'substring / slicing in a loop', d:'Allocates O(n) each time → hidden O(n²)' },
  { t:'Dijkstra with a plain array scan', d:'O(V²). Use a heap for O(E log V)' }
];

/* ------------------------------------------------------------- checklists */

export const CHECKLISTS = [
  { id:'cl-night', title:'Night before — Wed 11 Nov', items:[
    'Admit card / call letter printed <strong>and</strong> on your phone',
    'Photo ID — the Dec 2025 report confirms ID verification; Oct 2025 had a separate verification step',
    'Venue address confirmed; route checked; departure time set so you arrive 45 min early',
    'Any Infosys-required software installed and tested <strong>tonight</strong> — the Dec 2025 report says candidates had to download the Infosys Wingspan desktop app at the centre. If a pre-install link was emailed, do it now, and close background apps',
    'Laptop charged + charger packed if you bring your own; know whether the centre provides machines',
    '<strong>Pens and a notebook / rough sheets</strong> — non-optional, interviewers inspect them',
    'Leave at home: smartwatch, earbuds, calculator, extra phone — Dec 2025: none allowed',
    'Water bottle, light snack, 2-slide self-intro PPT if one was requested (Sep 2025 had this)',
    'One-page sheet read <strong>once</strong>. No new problems. No "quick last DP video"',
    'Phone on charge, alarm + backup alarm set',
    '<strong>In bed by 22:30</strong> — sleep outperforms every extra hour of revision now, and this round is partly a composure test'
  ]},
  { id:'cl-morning', title:'Exam morning — Thu 12 Nov', items:[
    'Normal breakfast. Nothing new or heavy',
    '<strong>Do not solve a problem this morning.</strong> A failure now will rent space in your head for three hours',
    'Read your one-page sheet <strong>once</strong> in transit. That is it',
    'Arrive 45 min early. Expect ID verification and grouping (3–5 or ~15 candidates reported)',
    'At the desk, before the timer, write on your rough sheet: ① the constraint→technique table ② "SCAN ALL FIRST, 12 MIN" ③ "SUBMIT BRUTE FORCE" ④ "long, not int" ⑤ "mod every step"',
    'First 12 minutes: scan all problems, write restatement + constraint + pattern + confidence, rank. <strong>Do not type</strong>',
    'Set your abandon-times on paper before starting problem one',
    'At T-20 min: stop all new work. Make sure <strong>every</strong> problem has something submitted',
    'If interviewers interrupt or photograph your screen — <strong>expected behaviour.</strong> Answer in one sentence, point at your paper, keep going'
  ]},
  { id:'cl-onepage', title:'Your one-page sheet — build it Sun 8 Nov evening', items:[
    'Side A: the constraint→technique table',
    'Side A: the pattern-trigger table',
    'Side A: your personal top-8 recurring bugs, taken from the Error Log',
    'Side B: the 6 templates you fumble most, written out in full',
    '<strong>This is the only document you read on 10–11 Nov.</strong>'
  ]}
];

export const FINAL7 = [
  { date:'Thu 5 Nov', kind:'weekday', plan:'Watch nothing new. Write templates 1–10 from blank memory on paper. Mark every one you fumbled. Re-read your Error Log end to end' },
  { date:'Fri 6 Nov', kind:'weekday', plan:'Write templates 11–20 from blank. Then the complexity drill: 15 constraint bounds → implied technique, under 10 s each. Then read the trigger table out loud' },
  { date:'Sat 7 Nov', kind:'weekend', plan:'MOCK A (09:00–12:00) → post-mortem → re-solve failures → SPRINT SIM 1' },
  { date:'Sun 8 Nov', kind:'weekend', plan:'MOCK B (09:00–12:00) → post-mortem → re-solve failures → SPRINT SIM 2 → build your final one-page sheet' },
  { date:'Mon 9 Nov', kind:'weekday', plan:'Re-solve, from blank, the 3 problems you failed worst across both mocks. Nothing else. 90 min max' },
  { date:'Tue 10 Nov', kind:'weekday', plan:'Templates from blank, final pass — only the ones you fumbled on 5–6 Nov. Then read the one-page sheet twice. 60 min. Stop early' },
  { date:'Wed 11 Nov', kind:'weekday', plan:'<strong>30 minutes maximum.</strong> Read the one-page sheet once. Write the Dijkstra and dp[mask] templates once. Then stop. Logistics + early sleep' }
];

export const ERROR_CATEGORIES = [
  { id:'pattern',  label:'Pattern not recognised', fix:'Drill the trigger table' },
  { id:'derive',   label:'Recognised but could not derive', fix:'Re-watch that pattern, re-derive on paper' },
  { id:'bug',      label:'Implementation bug', fix:'Drill templates from blank' },
  { id:'cxty',     label:'Wrong complexity', fix:'Drill the constraint→technique table' },
  { id:'edge',     label:'Edge case', fix:'Run the standard edge-case list before every submit' },
  { id:'time',     label:'Ran out of time', fix:'Tighten abandon-times; scan phase discipline' }
];
