import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '../utils/dataProcessor'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rchart-tip">
      <p className="rchart-tip-label">{label}</p>
      <p className="rchart-tip-value">{formatNumber(payload[0].value)}</p>
    </div>
  )
}

export default function QuarterlySalesChart({ data }) {
  const { charts, cols } = data
  const chartData = charts.quarterly

  return (
    <div className="chart-card">
      <div className="chart-title-row">
        <div>
          <p className="chart-overline">분기별 매출 추이</p>
          <p className="chart-title">
            {cols.quarter || '기간'} × {cols.sales || '매출'}
          </p>
        </div>
        <div className="chart-cols-meta">
          {cols.quarter && <span className="col-chip">{cols.quarter}</span>}
          {cols.sales   && <span className="col-chip">{cols.sales}</span>}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="chart-no-data">
          <p>분기/기간 또는 매출 컬럼을 감지할 수 없습니다</p>
          <small>컬럼명에 "분기", "기간", "매출" 등 키워드를 포함해 주세요</small>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 60 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#00d992" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#00d992" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0,217,146,0.3)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00d992"
              strokeWidth={2}
              fill="url(#greenGrad)"
              dot={{ r: 3, fill: '#00d992', stroke: '#050507', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#00d992', stroke: '#050507', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
