/**
 * Chart Initialization & Rendering
 * All Chart.js chart builders live here.
 */

Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

const PALETTE = {
  blue:       '#3b82f6',
  cyan:       '#06b6d4',
  green:      '#22c55e',
  yellow:     '#eab308',
  red:        '#ef4444',
  orange:     '#f97316',
  purple:     '#a855f7',
  pink:       '#ec4899',
  slate:      '#64748b',
  white:      '#f1f5f9',
  gridLine:   'rgba(148,163,184,0.08)',
  tooltip:    '#1e293b',
};

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: {
    legend: {
      labels: { color: '#94a3b8', boxWidth: 12, padding: 16, font: { size: 11 } }
    },
    tooltip: {
      backgroundColor: PALETTE.tooltip,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(148,163,184,0.2)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { color: PALETTE.gridLine },
      ticks: { color: '#64748b', maxTicksLimit: 12 }
    },
    y: {
      grid: { color: PALETTE.gridLine },
      ticks: { color: '#64748b' }
    }
  }
};

function deepMerge(target, source) {
  const out = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

/* ─── 1. S&P 500 Cumulative Growth (log scale) ───────────────────────────── */
function initGrowthChart() {
  const data  = HISTORICAL_DATA.cumulativeGrowthIndex;
  const years = Object.keys(data).map(Number).sort((a, b) => a - b);
  const vals  = years.map(y => data[y]);

  new Chart(document.getElementById('growthChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'S&P 500 Cumulative Growth (1950 = 100)',
        data: vals,
        borderColor: PALETTE.blue,
        backgroundColor: 'rgba(59,130,246,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.3
      }]
    },
    options: deepMerge(BASE_OPTS, {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` Index: ${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          type: 'logarithmic',
          ticks: {
            color: '#64748b',
            callback: v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v
          },
          grid: { color: PALETTE.gridLine }
        }
      }
    })
  });
}

/* ─── 2. Annual Returns Bar Chart ──────────────────────────────────────────── */
function initReturnsChart() {
  const ret   = HISTORICAL_DATA.sp500Returns;
  const years = Object.keys(ret).map(Number).filter(y => y >= 1950).sort((a,b)=>a-b);
  const vals  = years.map(y => ret[y]);
  const colors = vals.map(v => v >= 0 ? 'rgba(34,197,94,0.75)' : 'rgba(239,68,68,0.75)');

  new Chart(document.getElementById('returnsChart'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Annual Return %',
        data: vals,
        backgroundColor: colors,
        borderRadius: 2
      }]
    },
    options: deepMerge(BASE_OPTS, {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.raw > 0 ? '+' : ''}${ctx.raw}%` }
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#64748b',
            callback: v => `${v}%`
          },
          grid: { color: PALETTE.gridLine }
        }
      }
    })
  });
}

/* ─── 3. CAPE Ratio History ────────────────────────────────────────────────── */
function initCapeChart() {
  const cape  = HISTORICAL_DATA.capeRatio;
  const years = Object.keys(cape).map(Number).sort((a,b)=>a-b);
  const vals  = years.map(y => cape[y]);
  const median = 15.9;

  new Chart(document.getElementById('capeChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Shiller CAPE Ratio',
          data: vals,
          borderColor: PALETTE.yellow,
          backgroundColor: 'rgba(234,179,8,0.06)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: PALETTE.yellow,
          fill: true,
          tension: 0.3
        },
        {
          label: `Historical Median (${median}×)`,
          data: years.map(() => median),
          borderColor: 'rgba(148,163,184,0.5)',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Overvalued Threshold (25×)',
          data: years.map(() => 25),
          borderColor: 'rgba(239,68,68,0.35)',
          borderDash: [4, 4],
          borderWidth: 1,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: deepMerge(BASE_OPTS, {
      plugins: {
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}×` }
        }
      }
    })
  });
}

/* ─── 4. GDP vs Market Returns Correlation ─────────────────────────────────── */
function initGDPCorrelationChart() {
  const gdp  = HISTORICAL_DATA.gdpGrowth;
  const ret  = HISTORICAL_DATA.sp500Returns;
  const years = Object.keys(gdp).map(Number).filter(y => ret[y] !== undefined)
                .sort((a,b)=>a-b);

  new Chart(document.getElementById('gdpCorrelChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'S&P 500 Return %',
          data: years.map(y => ret[y]),
          borderColor: PALETTE.blue,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          yAxisID: 'yLeft'
        },
        {
          label: 'GDP Growth %',
          data: years.map(y => gdp[y]),
          borderColor: PALETTE.green,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          yAxisID: 'yRight'
        }
      ]
    },
    options: deepMerge(BASE_OPTS, {
      scales: {
        yLeft: {
          type: 'linear',
          position: 'left',
          ticks: { color: PALETTE.blue, callback: v => `${v}%` },
          grid: { color: PALETTE.gridLine },
          title: { display: true, text: 'S&P Return %', color: PALETTE.blue, font: { size: 10 } }
        },
        yRight: {
          type: 'linear',
          position: 'right',
          ticks: { color: PALETTE.green, callback: v => `${v}%` },
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'GDP %', color: PALETTE.green, font: { size: 10 } }
        },
        x: { grid: { color: PALETTE.gridLine }, ticks: { color: '#64748b', maxTicksLimit: 12 } }
      }
    })
  });
}

/* ─── 5. Macro Overlay: Inflation + Fed Funds + 10yr Yield ─────────────────── */
function initMacroChart() {
  const infl  = HISTORICAL_DATA.inflation;
  const fed   = HISTORICAL_DATA.fedFundsRate;
  const tyr   = HISTORICAL_DATA.tenYearYield;
  const years = Object.keys(infl).map(Number).filter(y => y >= 1970).sort((a,b)=>a-b);

  new Chart(document.getElementById('macroChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'CPI Inflation %',
          data: years.map(y => infl[y] ?? null),
          borderColor: PALETTE.red,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: 'Fed Funds Rate %',
          data: years.map(y => fed[y] ?? null),
          borderColor: PALETTE.orange,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: '10yr Treasury Yield %',
          data: years.map(y => tyr[y] ?? null),
          borderColor: PALETTE.purple,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
        }
      ]
    },
    options: deepMerge(BASE_OPTS, {
      scales: {
        y: {
          ticks: { color: '#64748b', callback: v => `${v}%` },
          grid: { color: PALETTE.gridLine }
        }
      }
    })
  });
}

/* ─── 6. 30-Year Projection Chart ──────────────────────────────────────────── */
function initProjectionChart() {
  const proj = runAllProjections();
  const mc   = proj.monteCarlo;
  const hm   = proj.historicalMean;
  const ca   = proj.capeAdjusted;
  const gd   = proj.gdpLinked;

  // Historical tail (last 10 years) for context
  const histData   = HISTORICAL_DATA.sp500Level;
  const histYears  = Object.keys(histData).map(Number).filter(y => y >= 2016).sort((a,b)=>a-b);
  const allYears   = [...histYears, ...mc.years.slice(1)];

  new Chart(document.getElementById('projectionChart'), {
    type: 'line',
    data: {
      labels: allYears,
      datasets: [
        // MC confidence bands
        {
          label: 'MC 90th Pct',
          data: [...histYears.map(()=>null), ...mc.p90.slice(1)],
          borderColor: 'transparent',
          backgroundColor: 'rgba(59,130,246,0.07)',
          fill: '+1',
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: 'MC 10th Pct',
          data: [...histYears.map(()=>null), ...mc.p10.slice(1)],
          borderColor: 'rgba(59,130,246,0.2)',
          backgroundColor: 'rgba(59,130,246,0.07)',
          borderDash: [3, 3],
          fill: false,
          pointRadius: 0,
          tension: 0.3
        },
        // Historical price
        {
          label: 'Historical S&P 500',
          data: [...histYears.map(y => histData[y]), ...mc.years.slice(1).map(()=>null)],
          borderColor: PALETTE.white,
          backgroundColor: 'rgba(241,245,249,0.06)',
          borderWidth: 2.5,
          pointRadius: 0,
          fill: false,
          tension: 0.3
        },
        // 4 models
        {
          label: hm.label,
          data: [...histYears.map(()=>null), ...hm.values.slice(1)],
          borderColor: PALETTE.blue,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3
        },
        {
          label: ca.label,
          data: [...histYears.map(()=>null), ...ca.values.slice(1)],
          borderColor: PALETTE.yellow,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
          borderDash: [6, 3]
        },
        {
          label: gd.label,
          data: [...histYears.map(()=>null), ...gd.values.slice(1)],
          borderColor: PALETTE.green,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
          borderDash: [4, 4]
        },
        {
          label: 'MC Median (50th Pct)',
          data: [...histYears.map(()=>null), ...mc.p50.slice(1)],
          borderColor: PALETTE.cyan,
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: deepMerge(BASE_OPTS, {
      scales: {
        y: {
          type: 'logarithmic',
          ticks: {
            color: '#64748b',
            callback: v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v
          },
          grid: { color: PALETTE.gridLine }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', boxWidth: 12, padding: 12, font: { size: 10 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              if (v === null || v === undefined) return null;
              return ` ${ctx.dataset.label}: ${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`;
            }
          }
        }
      }
    })
  });
}

/* ─── 7. Sector Weights Doughnut ───────────────────────────────────────────── */
function initSectorChart() {
  const sw     = HISTORICAL_DATA.sectorWeights;
  const labels = Object.keys(sw);
  const vals   = labels.map(k => sw[k]);
  const colors = [
    '#3b82f6','#06b6d4','#22c55e','#eab308','#f97316',
    '#a855f7','#ec4899','#64748b','#14b8a6','#f43f5e',
    '#84cc16','#94a3b8'
  ];

  new Chart(document.getElementById('sectorChart'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: vals,
        backgroundColor: colors,
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            boxWidth: 10,
            padding: 8,
            font: { size: 10 }
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` }
        }
      }
    }
  });
}

/* ─── 8. Bull vs Bear Cycle Duration/Gain Waterfall ─────────────────────────── */
function initCycleChart() {
  const cycles = HISTORICAL_DATA.marketCycles;
  const labels = cycles.map(c => `${c.start}–${c.end}`);
  const gains  = cycles.map(c => c.gain ?? c.loss);
  const colors = cycles.map(c => c.type === 'bull'
    ? 'rgba(34,197,94,0.75)'
    : 'rgba(239,68,68,0.75)');

  new Chart(document.getElementById('cycleChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Gain/Loss %',
        data: gains,
        backgroundColor: colors,
        borderRadius: 3
      }]
    },
    options: deepMerge(BASE_OPTS, {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw > 0 ? '+' : ''}${ctx.raw}%`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', callback: v => `${v}%` },
          grid: { color: PALETTE.gridLine }
        },
        y: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { color: PALETTE.gridLine }
        }
      }
    })
  });
}

/* ─── 9. Sector 10yr CAGR Horizontal Bar ────────────────────────────────────── */
function initSectorReturnsChart() {
  const sr     = HISTORICAL_DATA.sectorReturns10yr;
  const labels = Object.keys(sr).sort((a, b) => sr[b] - sr[a]);
  const vals   = labels.map(k => sr[k]);
  const colors = vals.map(v =>
    v > 15 ? PALETTE.green :
    v > 10 ? PALETTE.cyan  :
    v > 7  ? PALETTE.blue  :
             PALETTE.slate
  );

  new Chart(document.getElementById('sectorReturnsChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '10-yr CAGR %',
        data: vals,
        backgroundColor: colors,
        borderRadius: 3
      }]
    },
    options: deepMerge(BASE_OPTS, {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.raw}% CAGR (2016–2026)` }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', callback: v => `${v}%` },
          grid: { color: PALETTE.gridLine }
        },
        y: {
          ticks: { color: '#94a3b8', font: { size: 10 } },
          grid: { color: PALETTE.gridLine }
        }
      }
    })
  });
}

/* ─── 10. Unemployment vs Recession Indicator ────────────────────────────────── */
function initUnemploymentChart() {
  const unemp = HISTORICAL_DATA.unemployment;
  const years = Object.keys(unemp).map(Number).sort((a,b)=>a-b);
  const vals  = years.map(y => unemp[y]);

  new Chart(document.getElementById('unemploymentChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Unemployment Rate %',
        data: vals,
        borderColor: PALETTE.orange,
        backgroundColor: 'rgba(249,115,22,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: PALETTE.orange,
        fill: true,
        tension: 0.3
      }]
    },
    options: deepMerge(BASE_OPTS, {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` Unemployment: ${ctx.raw}%` }
        }
      },
      scales: {
        y: {
          ticks: { color: '#64748b', callback: v => `${v}%` },
          grid: { color: PALETTE.gridLine }
        }
      }
    })
  });
}

/* ─── Init All ──────────────────────────────────────────────────────────────── */
function initAllCharts() {
  initGrowthChart();
  initReturnsChart();
  initCapeChart();
  initGDPCorrelationChart();
  initMacroChart();
  initProjectionChart();
  initSectorChart();
  initCycleChart();
  initSectorReturnsChart();
  initUnemploymentChart();
}
