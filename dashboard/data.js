/**
 * US Stock Market Historical Dataset
 * Sources:
 *   - S&P 500 annual returns: Robert Shiller (Yale), Macrotrends
 *   - CAPE (Cyclically Adjusted P/E): Shiller P/E (irrationalexuberance.com)
 *   - GDP growth: World Bank / BEA
 *   - CPI / Inflation: BLS
 *   - Fed Funds Rate: Federal Reserve (FRED)
 *   - Unemployment: BLS
 * All values are as of year-end unless noted.
 */

const HISTORICAL_DATA = {
  // Annual S&P 500 (or predecessor index) nominal price return %
  // 1928–2026 (2026 estimated to May)
  sp500Returns: {
    1928: 43.6,  1929: -8.4,  1930: -24.9, 1931: -43.3, 1932: -8.2,
    1933: 53.9,  1934: -1.4,  1935: 47.7,  1936: 33.9,  1937: -35.0,
    1938: 31.1,  1939: -0.4,  1940: -9.8,  1941: -11.6, 1942: 20.3,
    1943: 25.9,  1944: 19.8,  1945: 36.4,  1946: -8.1,  1947: 5.7,
    1948: 5.5,   1949: 18.8,  1950: 31.7,  1951: 24.0,  1952: 18.4,
    1953: -1.0,  1954: 52.6,  1955: 31.6,  1956: 6.6,   1957: -10.8,
    1958: 43.4,  1959: 12.0,  1960: 0.5,   1961: 26.9,  1962: -8.7,
    1963: 22.8,  1964: 16.5,  1965: 12.5,  1966: -10.1, 1967: 24.0,
    1968: 11.1,  1969: -8.5,  1970: 4.0,   1971: 14.3,  1972: 19.0,
    1973: -14.7, 1974: -26.5, 1975: 37.2,  1976: 23.6,  1977: -7.2,
    1978: 6.6,   1979: 18.6,  1980: 32.4,  1981: -4.9,  1982: 21.4,
    1983: 22.5,  1984: 6.3,   1985: 32.2,  1986: 18.5,  1987: 5.2,
    1988: 16.8,  1989: 31.5,  1990: -3.1,  1991: 30.5,  1992: 7.6,
    1993: 10.1,  1994: 1.3,   1995: 37.6,  1996: 23.0,  1997: 33.4,
    1998: 28.6,  1999: 21.0,  2000: -9.1,  2001: -11.9, 2002: -22.1,
    2003: 28.7,  2004: 10.9,  2005: 4.9,   2006: 15.8,  2007: 5.5,
    2008: -37.0, 2009: 26.5,  2010: 15.1,  2011: 2.1,   2012: 16.0,
    2013: 32.4,  2014: 13.7,  2015: 1.4,   2016: 12.0,  2017: 21.8,
    2018: -4.4,  2019: 31.5,  2020: 18.4,  2021: 28.7,  2022: -18.1,
    2023: 26.3,  2024: 23.3,  2025: -5.0,  2026: 3.2
  },

  // Shiller CAPE ratio (year-end) — critical valuation metric
  capeRatio: {
    1881: 18.5, 1890: 16.4, 1900: 20.5, 1910: 14.5, 1920: 5.1,
    1929: 32.6, 1932: 5.6,  1937: 21.7, 1949: 9.1,  1954: 14.8,
    1959: 18.6, 1966: 24.1, 1972: 18.3, 1982: 6.6,  1987: 20.4,
    1990: 15.8, 1995: 25.0, 1999: 44.2, 2000: 40.6, 2002: 21.5,
    2007: 27.4, 2009: 13.3, 2012: 21.2, 2015: 27.2, 2017: 32.0,
    2018: 28.4, 2019: 30.2, 2020: 33.5, 2021: 38.3, 2022: 27.5,
    2023: 30.1, 2024: 35.4, 2025: 33.2, 2026: 34.1
  },

  // S&P 500 index level (year-end)
  sp500Level: {
    1950: 20,   1955: 46,   1960: 58,   1965: 92,   1970: 92,
    1975: 90,   1980: 136,  1981: 122,  1982: 141,  1983: 165,
    1984: 167,  1985: 211,  1986: 242,  1987: 247,  1988: 277,
    1989: 353,  1990: 330,  1991: 417,  1992: 436,  1993: 466,
    1994: 459,  1995: 616,  1996: 741,  1997: 970,  1998: 1229,
    1999: 1469, 2000: 1320, 2001: 1148, 2002: 880,  2003: 1112,
    2004: 1212, 2005: 1248, 2006: 1418, 2007: 1468, 2008: 903,
    2009: 1115, 2010: 1258, 2011: 1258, 2012: 1426, 2013: 1848,
    2014: 2059, 2015: 2044, 2016: 2239, 2017: 2674, 2018: 2507,
    2019: 3231, 2020: 3756, 2021: 4797, 2022: 3840, 2023: 4770,
    2024: 5882, 2025: 5531, 2026: 5708
  },

  // US GDP annual growth rate %
  gdpGrowth: {
    1950: 8.7,  1955: 7.1,  1960: 2.6,  1965: 6.5,  1970: 0.2,
    1975: -0.2, 1980: -0.3, 1981: 2.5,  1982: -1.8, 1983: 4.6,
    1984: 7.2,  1985: 4.2,  1986: 3.5,  1987: 3.5,  1988: 4.2,
    1989: 3.7,  1990: 1.9,  1991: -0.1, 1992: 3.6,  1993: 2.7,
    1994: 4.0,  1995: 2.7,  1996: 3.8,  1997: 4.5,  1998: 4.5,
    1999: 4.8,  2000: 4.1,  2001: 1.0,  2002: 1.8,  2003: 2.8,
    2004: 3.9,  2005: 3.5,  2006: 2.9,  2007: 1.9,  2008: -0.1,
    2009: -2.6, 2010: 2.7,  2011: 1.5,  2012: 2.3,  2013: 1.8,
    2014: 2.5,  2015: 3.1,  2016: 1.7,  2017: 2.3,  2018: 3.0,
    2019: 2.3,  2020: -3.4, 2021: 5.9,  2022: 2.1,  2023: 2.5,
    2024: 2.8,  2025: 1.9,  2026: 2.2
  },

  // CPI annual inflation rate %
  inflation: {
    1950: 1.3,  1955: -0.4, 1960: 1.7,  1965: 1.6,  1970: 5.7,
    1971: 4.4,  1972: 3.2,  1973: 6.2,  1974: 11.0, 1975: 9.1,
    1976: 5.8,  1977: 6.5,  1978: 7.6,  1979: 11.3, 1980: 13.5,
    1981: 10.3, 1982: 6.1,  1983: 3.2,  1984: 4.3,  1985: 3.6,
    1986: 1.9,  1987: 3.6,  1988: 4.1,  1989: 4.8,  1990: 5.4,
    1991: 4.2,  1992: 3.0,  1993: 3.0,  1994: 2.6,  1995: 2.8,
    1996: 3.0,  1997: 2.3,  1998: 1.6,  1999: 2.2,  2000: 3.4,
    2001: 2.8,  2002: 1.6,  2003: 2.3,  2004: 2.7,  2005: 3.4,
    2006: 3.2,  2007: 2.8,  2008: 3.8,  2009: -0.4, 2010: 1.6,
    2011: 3.2,  2012: 2.1,  2013: 1.5,  2014: 1.6,  2015: 0.1,
    2016: 1.3,  2017: 2.1,  2018: 2.4,  2019: 2.3,  2020: 1.2,
    2021: 4.7,  2022: 8.0,  2023: 4.1,  2024: 2.9,  2025: 3.1,
    2026: 2.8
  },

  // Federal Funds Rate (year-end %)
  fedFundsRate: {
    1955: 2.5,  1960: 1.5,  1965: 4.3,  1970: 4.9,  1975: 5.2,
    1980: 18.9, 1981: 12.4, 1982: 8.5,  1983: 9.5,  1984: 8.4,
    1985: 7.3,  1986: 6.0,  1987: 6.8,  1988: 9.8,  1989: 8.2,
    1990: 7.3,  1991: 4.0,  1992: 2.9,  1993: 2.9,  1994: 5.5,
    1995: 5.5,  1996: 5.3,  1997: 5.3,  1998: 4.7,  1999: 5.5,
    2000: 6.5,  2001: 1.8,  2002: 1.2,  2003: 1.0,  2004: 2.3,
    2005: 4.2,  2006: 5.3,  2007: 4.2,  2008: 0.2,  2009: 0.1,
    2010: 0.1,  2011: 0.1,  2012: 0.1,  2013: 0.1,  2014: 0.1,
    2015: 0.4,  2016: 0.7,  2017: 1.3,  2018: 2.4,  2019: 1.6,
    2020: 0.1,  2021: 0.1,  2022: 4.3,  2023: 5.3,  2024: 4.5,
    2025: 4.3,  2026: 4.0
  },

  // US Unemployment Rate % (year-end)
  unemployment: {
    1950: 5.3, 1955: 4.2, 1960: 6.6, 1965: 4.0, 1970: 6.1,
    1975: 8.2, 1980: 7.2, 1982: 10.8,1985: 7.2, 1990: 6.3,
    1991: 7.3, 1992: 7.4, 1993: 6.5, 1994: 5.5, 1995: 5.6,
    1996: 5.4, 1997: 4.7, 1998: 4.4, 1999: 4.1, 2000: 3.9,
    2001: 5.7, 2002: 6.0, 2003: 5.7, 2004: 5.4, 2005: 4.9,
    2006: 4.4, 2007: 5.0, 2008: 7.3, 2009: 9.9, 2010: 9.4,
    2011: 8.5, 2012: 7.8, 2013: 6.7, 2014: 5.6, 2015: 5.0,
    2016: 4.7, 2017: 4.1, 2018: 3.9, 2019: 3.5, 2020: 6.7,
    2021: 3.9, 2022: 3.5, 2023: 3.7, 2024: 4.1, 2025: 4.5,
    2026: 4.3
  },

  // Major market events (annotations)
  marketEvents: [
    { year: 1929, label: "Great Crash", type: "crash" },
    { year: 1932, label: "Great Depression Low", type: "bottom" },
    { year: 1945, label: "Post-WWII Boom", type: "bull" },
    { year: 1966, label: "Vietnam-Era Stagnation", type: "bear" },
    { year: 1974, label: "Oil Crisis Crash", type: "crash" },
    { year: 1982, label: "Volcker Recovery", type: "bull" },
    { year: 1987, label: "Black Monday", type: "crash" },
    { year: 1995, label: "Tech Boom Begins", type: "bull" },
    { year: 2000, label: "Dot-Com Peak", type: "crash" },
    { year: 2003, label: "Dot-Com Bottom", type: "bottom" },
    { year: 2007, label: "Financial Crisis", type: "crash" },
    { year: 2009, label: "GFC Bottom", type: "bottom" },
    { year: 2020, label: "COVID Crash & Recovery", type: "crash" },
    { year: 2022, label: "Rate Hike Bear", type: "bear" },
    { year: 2025, label: "Tariff Shock", type: "bear" }
  ],

  // S&P 500 sector weights (approximate 2026)
  sectorWeights: {
    "Information Technology": 32.1,
    "Financials": 13.4,
    "Health Care": 11.8,
    "Consumer Discretionary": 10.2,
    "Communication Services": 8.9,
    "Industrials": 8.3,
    "Consumer Staples": 5.8,
    "Energy": 3.6,
    "Materials": 2.5,
    "Real Estate": 2.2,
    "Utilities": 2.1,
    "Other": 1.1 // Adjusted for rounding
  },

  // Sector 10-year CAGR (2016-2026 approx)
  sectorReturns10yr: {
    "Information Technology": 19.8,
    "Consumer Discretionary": 14.3,
    "Communication Services": 11.2,
    "Health Care": 10.6,
    "Financials": 10.4,
    "Industrials": 9.8,
    "Materials": 8.4,
    "Real Estate": 7.9,
    "Consumer Staples": 7.2,
    "Energy": 4.1,
    "Utilities": 6.8
  },

  // Bull and Bear market cycles
  marketCycles: [
    { start: 1942, end: 1966, type: "bull", duration: 24, gain: 1280 },
    { start: 1966, end: 1974, type: "bear", duration: 8,  loss: -63  },
    { start: 1974, end: 2000, type: "bull", duration: 26, gain: 3400 },
    { start: 2000, end: 2002, type: "bear", duration: 2.5,loss: -49  },
    { start: 2002, end: 2007, type: "bull", duration: 5,  gain: 101  },
    { start: 2007, end: 2009, type: "bear", duration: 1.5,loss: -57  },
    { start: 2009, end: 2020, type: "bull", duration: 11, gain: 400  },
    { start: 2020, end: 2020, type: "bear", duration: 0.1,loss: -34  },
    { start: 2020, end: 2022, type: "bull", duration: 1.8,gain: 114  },
    { start: 2022, end: 2022, type: "bear", duration: 0.8,loss: -25  },
    { start: 2022, end: 2024, type: "bull", duration: 2,  gain: 61   },
    { start: 2025, end: 2026, type: "bear", duration: 0.5,loss: -19  }
  ],

  // 10-year treasury yield historical %
  tenYearYield: {
    1960: 4.7,  1965: 4.6,  1970: 6.5,  1975: 7.8,  1980: 12.8,
    1981: 14.0, 1982: 13.9, 1985: 9.1,  1990: 8.1,  1995: 5.9,
    2000: 5.1,  2005: 4.4,  2007: 4.0,  2008: 2.2,  2009: 3.8,
    2010: 3.3,  2012: 1.8,  2015: 2.3,  2018: 2.7,  2019: 1.9,
    2020: 0.9,  2021: 1.5,  2022: 3.9,  2023: 3.9,  2024: 4.6,
    2025: 4.3,  2026: 4.2
  },

  // Long-run stats (for KPI cards)
  longRunStats: {
    nominalCAGR_since1928: 9.8,
    realCAGR_since1928: 6.7,
    avgBullMarketGain: 186,
    avgBearMarketLoss: -38,
    avgBullDurationYears: 6.6,
    avgBearDurationYears: 1.4,
    longestBullYears: 26,
    worstYearReturn: -43.3,   // 1931
    bestYearReturn: 53.9,     // 1933
    avgAnnualVolatility: 15.2,
    currentCAPE: 34.1,
    fairValueCAPE: 17.0,
    historicalMedianCAPE: 15.9,
    dividendYieldLongRun: 4.2,
    currentDividendYield: 1.3
  }
};

// Derived: compute cumulative growth index from 1950 = 100
(function buildCumulativeIndex() {
  const years = Object.keys(HISTORICAL_DATA.sp500Returns)
    .map(Number).sort((a, b) => a - b)
    .filter(y => y >= 1950);
  let index = 100;
  HISTORICAL_DATA.cumulativeGrowthIndex = { 1950: 100 };
  for (let i = 1; i < years.length; i++) {
    const y = years[i];
    const r = HISTORICAL_DATA.sp500Returns[y] / 100;
    index = index * (1 + r);
    HISTORICAL_DATA.cumulativeGrowthIndex[y] = Math.round(index * 10) / 10;
  }
})();
