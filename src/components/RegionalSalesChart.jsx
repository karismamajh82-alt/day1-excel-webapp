import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { formatNumber } from '../utils/dataProcessor'

const GREEN_PALETTE = [
  '#00d992', '#10b981', '#059669', '#047857',
  '#065f46', '#2fd6a1', '#34d399', '#6ee7b7',
  '#a7f3d0', '#d1fae5',
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rchart-tip">
      <p className="rchart-tip-label">{label}</p>
      <p className="rchart-tip-value">{formatNumber(payload[0].value)}</p>
    </div>
  )
}

export default function RegionalSalesChart({ data }) {
  const { charts, cols } = data
  const chartData = charts.regional

  return (
    <div className="chart-card">
      <div className="chart-title-row">
        <div>
          <p className="chart-overline">지역별 매출</p>
          <p className="chart-title">
            {cols.region || '지역'} × {cols.sales || '매출'}
          </p>
        </div>
        <div className="chart-cols-meta">
          {cols.region && <span className="col-chip">{cols.region}</span>}
          {cols.sales  && <span className="col-chip">{cols.sales}</span>}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="chart-no-data">
          <p>지역 또는 매출 컬럼을 감지할 수 없습니다</p>
          <small>컬럼명에 "지역", "매출" 등 키워드를 포함해 주세요</small>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 60 }}>
            <CartesianGrid vertical={false} stroke="rgba(61,58,57,0.5)" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8b949e', fontSize: 11 }}
              angle={-40}
              textAnchor="end"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: '#3d3a39' }}
            />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatNumber(v)}
              width={60}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,217,146,0.05)' }} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={44}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={GREEN_PALETTE[i % GREEN_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
