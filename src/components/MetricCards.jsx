import React from 'react'
import { formatCompact } from '../utils/dataProcessor'

function Card({ label, value, sub, accent, icon }) {
  return (
    <div className={`metric-card${accent ? ' is-accent' : ''}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}

export default function MetricCards({ data }) {
  const { metrics, cols, headers } = data

  const cards = [
    {
      icon: '📋',
      label: '총 데이터 건수',
      value: metrics.totalRows.toLocaleString('ko-KR'),
      sub: `컬럼 ${headers.length}개`,
    },
    cols.sales && {
      icon: '💰',
      label: cols.sales,
      value: formatCompact(metrics.totalSales),
      sub: '매출 합계',
      accent: true,
    },
    cols.profit && {
      icon: '📈',
      label: cols.profit,
      value: formatCompact(metrics.totalProfit),
      sub: '이익 합계',
    },
    metrics.profitMargin != null && {
      icon: '🎯',
      label: '영업이익률',
      value: metrics.profitMargin.toFixed(1) + '%',
      sub: `${cols.profit} ÷ ${cols.sales}`,
    },
    metrics.uniqueRegions > 0 && {
      icon: '🌏',
      label: '지역 수',
      value: metrics.uniqueRegions + '개',
      sub: cols.region,
    },
    metrics.uniqueCorps > 0 && cols.corp !== cols.region && {
      icon: '🏢',
      label: '법인 수',
      value: metrics.uniqueCorps + '개',
      sub: cols.corp,
    },
  ].filter(Boolean).slice(0, 5)

  return (
    <div className="metrics-row">
      {cards.map((card, i) => (
        <Card key={i} {...card} />
      ))}
    </div>
  )
}
