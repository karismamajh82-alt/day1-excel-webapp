// Strip formatting chars and return a number
export function parseNumericValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[,₩$\s원억만조천]/g, '');
  return parseFloat(cleaned);
}

function isNumericCol(values) {
  const nonEmpty = values.filter((v) => v !== '' && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return false;
  const numCount = nonEmpty.filter((v) => !isNaN(parseNumericValue(v))).length;
  return numCount / nonEmpty.length > 0.65;
}

export function analyzeColumns(headers, records) {
  const columnTypes = {};
  headers.forEach((h) => {
    const vals = records.map((r) => r[h]);
    columnTypes[h] = isNumericCol(vals) ? 'numeric' : 'text';
  });

  const findCol = (patterns, mustBeNumeric = false) => {
    const pool = mustBeNumeric
      ? headers.filter((h) => columnTypes[h] === 'numeric')
      : headers;
    return pool.find((h) =>
      patterns.some((p) => h.toLowerCase().includes(p))
    ) || null;
  };

  const regionCol = findCol(['지역', 'region', 'area', '국가', 'country', '대륙', 'continent', '시장']);
  const corpCol = findCol(['법인', '법인명', 'company', 'corp', '회사', '기업', '자회사', 'subsidiary', '계열사']);
  const quarterCol = findCol(['분기', 'quarter', '기간', '년도', '연도', 'year', '월', 'month', '시기', 'period', 'date', '날짜', '일자', '기준']);
  const salesCol = findCol(['매출', 'sales', 'revenue', '수입', '매출액', '판매', '거래액'], true)
    || findCol(['매출', 'sales', 'revenue', '수입', '매출액']);
  const profitCol = findCol(['영업이익', 'profit', '이익', 'operating', '손익', 'margin'], true)
    || findCol(['영업이익', 'profit', '이익', 'operating', '손익']);

  return {
    columnTypes,
    detectedCols: { region: regionCol, corp: corpCol, quarter: quarterCol, sales: salesCol, profit: profitCol },
  };
}

export function calculateMetrics(records, detectedCols) {
  const { sales, profit, region, corp } = detectedCols;

  const numSum = (col) => {
    if (!col) return null;
    return records.reduce((s, r) => {
      const v = parseNumericValue(r[col]);
      return s + (isNaN(v) ? 0 : v);
    }, 0);
  };

  const totalSales = numSum(sales);
  const totalProfit = numSum(profit);
  const profitMargin =
    totalSales !== null && totalProfit !== null && totalSales !== 0
      ? (totalProfit / totalSales) * 100
      : null;

  const uniqueRegions = region
    ? new Set(records.map((r) => r[region]).filter(Boolean)).size
    : 0;
  const uniqueCorps = corp
    ? new Set(records.map((r) => r[corp]).filter(Boolean)).size
    : 0;

  return { totalRows: records.length, totalSales, totalProfit, profitMargin, uniqueRegions, uniqueCorps };
}

function groupAndSum(records, dimCol, valCol) {
  if (!dimCol || !valCol) return [];
  const groups = {};
  records.forEach((r) => {
    const key = String(r[dimCol] || '기타').trim();
    if (!key) return;
    const val = parseNumericValue(r[valCol]);
    groups[key] = (groups[key] || 0) + (isNaN(val) ? 0 : val);
  });
  return Object.entries(groups)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .filter((item) => item.name);
}

export function groupByRegion(records, regionCol, salesCol) {
  return groupAndSum(records, regionCol, salesCol).sort((a, b) => b.value - a.value);
}

export function groupByQuarter(records, quarterCol, salesCol) {
  const data = groupAndSum(records, quarterCol, salesCol);
  return data.sort((a, b) => {
    // Try numeric/chronological sort
    const aNum = parseFloat(String(a.name).replace(/[^0-9]/g, ''));
    const bNum = parseFloat(String(b.name).replace(/[^0-9]/g, ''));
    if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) return aNum - bNum;
    return String(a.name).localeCompare(String(b.name), 'ko');
  });
}

export function groupByCorp(records, corpCol, profitCol) {
  return groupAndSum(records, corpCol, profitCol).sort((a, b) => b.value - a.value);
}

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const n = Number(value);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + '조';
  if (abs >= 100_000_000) return (n / 100_000_000).toFixed(1) + '억';
  if (abs >= 10_000) return (n / 10_000).toFixed(0) + '만';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
}

export function formatChartNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '';
  const n = Number(value);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + '조';
  if (abs >= 100_000_000) return (n / 100_000_000).toFixed(0) + '억';
  if (abs >= 10_000) return (n / 10_000).toFixed(0) + '만';
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
}
