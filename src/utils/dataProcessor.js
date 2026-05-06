const COLUMN_PATTERNS = {
  region:  ['지역', '지역명', '국가', '권역', 'region', 'area', 'country'],
  quarter: ['분기', '기간', '연도', '연월', '기준월', '날짜', 'quarter', 'period', 'year', 'month', 'date'],
  sales:   ['매출', '매출액', '매출합계', '수익', '금액', 'sales', 'revenue'],
  profit:  ['영업이익', '이익', '순이익', '세전이익', 'profit', 'operating'],
  corp:    ['법인', '법인명', '회사', '기업', '사업부', '부서', 'corporation', 'company'],
}

function findColumn(headers, patterns) {
  return headers.find(h =>
    patterns.some(p => String(h).toLowerCase().includes(p.toLowerCase()))
  ) || null
}

function parseNum(val) {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(/[,\s₩$%원]/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

function groupSum(rows, groupCol, valueCol) {
  const map = {}
  rows.forEach(row => {
    const key = String(row[groupCol] ?? '기타').trim()
    if (!key) return
    map[key] = (map[key] || 0) + parseNum(row[valueCol])
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export function processData(rawData) {
  if (!rawData?.length) return null

  const headers = Object.keys(rawData[0])

  // Classify each column as numeric or text
  const colTypes = {}
  headers.forEach(h => {
    const sample = rawData.slice(0, 20).map(r => r[h]).filter(v => v !== '' && v != null)
    const numCount = sample.filter(v => !isNaN(parseFloat(String(v).replace(/[,\s₩$%원]/g, '')))).length
    colTypes[h] = numCount > sample.length * 0.6 ? 'numeric' : 'text'
  })

  const numericCols = headers.filter(h => colTypes[h] === 'numeric')
  const textCols    = headers.filter(h => colTypes[h] === 'text')

  // Detect semantic columns
  const cols = {
    region:  findColumn(headers, COLUMN_PATTERNS.region)  || textCols[0]    || null,
    quarter: findColumn(headers, COLUMN_PATTERNS.quarter) || textCols[1]    || null,
    sales:   findColumn(headers, COLUMN_PATTERNS.sales)   || numericCols[0] || null,
    profit:  findColumn(headers, COLUMN_PATTERNS.profit)  || numericCols[1] || null,
    corp:    findColumn(headers, COLUMN_PATTERNS.corp)    || textCols[0]    || null,
  }

  // Aggregate metrics
  const totalSales   = cols.sales  ? rawData.reduce((s, r) => s + parseNum(r[cols.sales]),  0) : 0
  const totalProfit  = cols.profit ? rawData.reduce((s, r) => s + parseNum(r[cols.profit]), 0) : 0
  const uniqueRegions = cols.region ? new Set(rawData.map(r => r[cols.region]).filter(Boolean)).size : 0
  const uniqueCorps   = cols.corp   ? new Set(rawData.map(r => r[cols.corp  ]).filter(Boolean)).size : 0

  // Chart data
  let regionalData  = []
  let quarterlyData = []
  let corporateData = []

  if (cols.region && cols.sales) {
    regionalData = groupSum(rawData, cols.region, cols.sales)
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }

  if (cols.quarter && cols.sales) {
    quarterlyData = groupSum(rawData, cols.quarter, cols.sales)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'ko'))
  }

  if (cols.corp && (cols.profit || cols.sales)) {
    const valueCol = cols.profit || cols.sales
    corporateData = groupSum(rawData, cols.corp, valueCol)
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }

  return {
    headers,
    rows: rawData,
    cols,
    colTypes,
    numericCols,
    textCols,
    metrics: {
      totalRows: rawData.length,
      totalSales,
      totalProfit,
      uniqueRegions,
      uniqueCorps,
      profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : null,
    },
    charts: { regional: regionalData, quarterly: quarterlyData, corporate: corporateData },
  }
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return '-'
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(1) + '조'
  if (abs >= 1e8)  return sign + (abs / 1e8 ).toFixed(1) + '억'
  if (abs >= 1e4)  return sign + (abs / 1e4 ).toFixed(1) + '만'
  return num.toLocaleString('ko-KR')
}

export function formatCompact(num) {
  if (num == null || isNaN(num)) return '-'
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + '조'
  if (abs >= 1e8)  return sign + (abs / 1e8 ).toFixed(2) + '억'
  if (abs >= 1e4)  return sign + (abs / 1e4 ).toFixed(2) + '만'
  return num.toLocaleString('ko-KR')
}
