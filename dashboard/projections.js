/**
 * 30-Year Projection Engine (2026–2056)
 *
 * Four independent methodologies are used to project the S&P 500 forward.
 * Each model has different assumptions and should be read as a scenario,
 * not a guarantee. The spread between models represents genuine uncertainty.
 *
 * Models:
 *   1. Historical Mean Reversion   — long-run 9.8% nominal CAGR applied forward
 *   2. CAPE-Adjusted Regression    — Shiller's regression: return ≈ 1/CAPE + EPS growth
 *   3. GDP-Linked Earnings Growth  — earnings track nominal GDP; uses P/E compression
 *   4. Monte Carlo Simulation      — 10,000 paths with historical volatility
 */

const PROJECTION_CONFIG = {
  startYear: 2026,
  startLevel: 5708,       // S&P 500 as of mid-2026 (approx)
  horizonYears: 30,
  currentCAPE: 34.1,
  historicalMedianCAPE: 15.9,
  currentDividendYield: 0.013,  // 1.3%
  longRunDividendYield: 0.042,  // 4.2% historical
  historicalNominalCAGR: 0.098,
  historicalRealCAGR: 0.067,
  expectedInflation: 0.03,
  historicalVolatility: 0.152,  // annual std dev
  gdpGrowthBase: 0.023,         // 2.3% real GDP growth (CBO long-run estimate)
  corpProfitShareOfGDP: 0.103,  // ~10.3% currently, vs 6% historical avg
  riskFreeRate: 0.042,          // current 10yr yield
};

/**
 * Model 1: Historical Mean Reversion
 * Assumes the market reverts to its long-run nominal return of 9.8%.
 * Advisory: Overstates returns in high-valuation environments.
 */
function modelHistoricalMean(cfg) {
  const years = [];
  const values = [];
  const upper = [];  // +1 std dev path (~68th pct)
  const lower = [];  // -1 std dev path (~32nd pct)

  let val = cfg.startLevel;
  let hi  = cfg.startLevel;
  let lo  = cfg.startLevel;

  for (let i = 0; i <= cfg.horizonYears; i++) {
    years.push(cfg.startYear + i);
    values.push(Math.round(val));
    upper.push(Math.round(hi));
    lower.push(Math.round(lo));
    // Compound each year
    val *= (1 + cfg.historicalNominalCAGR);
    hi  *= (1 + cfg.historicalNominalCAGR + cfg.historicalVolatility * 0.5);
    lo  *= (1 + cfg.historicalNominalCAGR - cfg.historicalVolatility * 0.5);
  }
  return { years, values, upper, lower, label: "Historical Mean (9.8% CAGR)" };
}

/**
 * Model 2: CAPE-Adjusted (Shiller Regression)
 * Expected 10yr return ≈ earnings yield + growth − current premium/CAPE
 * Earnings yield = 1/CAPE. CAPE mean-reverts to historical median (~16) over 15 years.
 * Advisory: Most academically rigorous for valuation-conscious projections.
 *           Historically low-CAPE entries outperform; high-CAPE entries underperform.
 */
function modelCAPEAdjusted(cfg) {
  const years = [];
  const values = [];
  const upper = [];
  const lower = [];

  let val = cfg.startLevel;
  let cape = cfg.currentCAPE;
  const targetCAPE = cfg.historicalMedianCAPE;
  // CAPE compression: assume half-reversion in 15 years, full by year 20
  const capeCompressionYears = 20;
  const epsGrowth = cfg.gdpGrowthBase + cfg.expectedInflation; // nominal earnings growth

  for (let i = 0; i <= cfg.horizonYears; i++) {
    years.push(cfg.startYear + i);
    values.push(Math.round(val));
    upper.push(Math.round(val * 1.15));
    lower.push(Math.round(val * 0.85));

    const earningsYield = 1 / cape;
    // Annual return = earnings yield + eps growth − valuation drag
    const valuationDrag = (i < capeCompressionYears)
      ? (Math.log(cape / targetCAPE) / capeCompressionYears) * 0.5
      : 0;
    const annualReturn = earningsYield + epsGrowth - valuationDrag;

    val *= (1 + Math.max(annualReturn, -0.15)); // floor at -15%/yr
    // Gradually compress CAPE toward target
    if (i < capeCompressionYears) {
      cape = cape - (cape - targetCAPE) / (capeCompressionYears - i + 1);
    }
  }
  return { years, values, upper, lower, label: "CAPE-Adjusted Regression" };
}

/**
 * Model 3: GDP-Linked Earnings Growth
 * Corporate earnings long-run track nominal GDP growth.
 * Current profit margins (10.3%) are above historical average (6%); mean reversion
 * creates headwind. P/E assumed to compress from ~28x to ~20x over 15 years.
 * Advisory: Most conservative model — appropriate for pension/long-term planning.
 */
function modelGDPLinked(cfg) {
  const years = [];
  const values = [];
  const upper = [];
  const lower = [];

  let val = cfg.startLevel;
  const nominalGDP = cfg.gdpGrowthBase + cfg.expectedInflation;
  // Profit margin mean reversion creates a drag: current 10.3% → 7% over 15 yrs
  const marginDragPerYear = (0.103 - 0.070) / 15;  // spread across 15 years
  // P/E compression: ~28x now → ~20x over 15 years (annualized drag)
  const currentPE = cfg.currentCAPE / 3; // rough trailing PE approximation
  const targetPE  = 20;
  const peDragYears = 15;

  for (let i = 0; i <= cfg.horizonYears; i++) {
    years.push(cfg.startYear + i);
    values.push(Math.round(val));
    upper.push(Math.round(val * 1.20));
    lower.push(Math.round(val * 0.80));

    const marginDrag = i < 15 ? marginDragPerYear : 0;
    const peDrag = (i < peDragYears)
      ? Math.log(currentPE / targetPE) / peDragYears * 0.4
      : 0;
    const annualReturn = nominalGDP - marginDrag - peDrag + cfg.currentDividendYield;
    val *= (1 + Math.max(annualReturn, -0.20));
  }
  return { years, values, upper, lower, label: "GDP-Linked Earnings" };
}

/**
 * Model 4: Monte Carlo Simulation
 * Runs 2,000 paths using historical return distribution (normal approximation).
 * Reports: median, 10th pct, 25th pct, 75th pct, 90th pct.
 * Advisory: Captures fat tails but uses normal distribution — real tail risk is larger.
 */
function modelMonteCarlo(cfg, nPaths = 2000) {
  const n = cfg.horizonYears;
  const mu = cfg.historicalNominalCAGR;   // 9.8% annualized
  const sigma = cfg.historicalVolatility; // 15.2% annualized

  // Box-Muller normal random number generator (seeded for reproducibility)
  let seed = 42;
  function nextRand() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0x100000000;
  }
  function randn() {
    const u1 = Math.max(nextRand(), 1e-10);
    const u2 = nextRand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  // Build matrix: paths × (n+1) years
  const matrix = [];
  for (let p = 0; p < nPaths; p++) {
    const path = [cfg.startLevel];
    for (let t = 0; t < n; t++) {
      const r = mu + sigma * randn();
      path.push(path[path.length - 1] * (1 + r));
    }
    matrix.push(path);
  }

  // Compute percentiles at each year
  const years = [];
  const p10 = [], p25 = [], p50 = [], p75 = [], p90 = [];

  for (let t = 0; t <= n; t++) {
    years.push(cfg.startYear + t);
    const col = matrix.map(path => path[t]).sort((a, b) => a - b);
    const idx = pct => Math.floor(pct * (nPaths - 1));
    p10.push(Math.round(col[idx(0.10)]));
    p25.push(Math.round(col[idx(0.25)]));
    p50.push(Math.round(col[idx(0.50)]));
    p75.push(Math.round(col[idx(0.75)]));
    p90.push(Math.round(col[idx(0.90)]));
  }

  return { years, p10, p25, p50, p75, p90, label: "Monte Carlo (2,000 paths)" };
}

/**
 * Run all four models and return consolidated projection data
 */
function runAllProjections() {
  const cfg = PROJECTION_CONFIG;
  return {
    historicalMean: modelHistoricalMean(cfg),
    capeAdjusted:   modelCAPEAdjusted(cfg),
    gdpLinked:      modelGDPLinked(cfg),
    monteCarlo:     modelMonteCarlo(cfg),
    config:         cfg
  };
}

/**
 * Compute implied annualized return from current CAPE using Shiller regression
 * formula: expected 10yr real return ≈ 1/CAPE × 1.075 − 0.026
 * Source: Shiller, "Irrational Exuberance" (3rd ed.)
 */
function capeImplied10yrReturn(cape) {
  return (1 / cape) * 1.075 - 0.026;
}

/**
 * Inflation-adjust a nominal future value to today's dollars
 */
function realValue(nominalValue, yearsForward, annualInflation = 0.03) {
  return nominalValue / Math.pow(1 + annualInflation, yearsForward);
}

/**
 * Generate scenario comparison table
 */
function generateScenarioTable() {
  const proj = runAllProjections();
  const checkpoints = [5, 10, 15, 20, 25, 30];

  return checkpoints.map(yr => {
    const idx = yr; // index == year offset
    const inf = realValue(1, yr, PROJECTION_CONFIG.expectedInflation);
    return {
      year: PROJECTION_CONFIG.startYear + yr,
      yearsOut: yr,
      historicalMean: {
        nominal: proj.historicalMean.values[idx],
        real: Math.round(proj.historicalMean.values[idx] * inf)
      },
      capeAdjusted: {
        nominal: proj.capeAdjusted.values[idx],
        real: Math.round(proj.capeAdjusted.values[idx] * inf)
      },
      gdpLinked: {
        nominal: proj.gdpLinked.values[idx],
        real: Math.round(proj.gdpLinked.values[idx] * inf)
      },
      monteCarlo: {
        p50nominal: proj.monteCarlo.p50[idx],
        p10nominal: proj.monteCarlo.p10[idx],
        p90nominal: proj.monteCarlo.p90[idx]
      }
    };
  });
}
