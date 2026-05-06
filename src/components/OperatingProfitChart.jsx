import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import { formatNumber } from '../utils/dataProcessor'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="rchart-tip">
      <p className="rchart-tip-label">{label}</p>
      <p className={`rchart-tip-value${val < 0 ? ' is-neg' : ''}`}>
        {formatNumber(val)}
      </p>
    </div>
  )
}

export default function OperatingProfitChart({ data }) {
  const { charts, cols } = data
  const chartData  = charts.corporate
  const hasNeg     = chartData.some((d) => d.value < 0)
  const valueLabel = cols.profit || cols.sales

  return (
    <div className="chart-card">
      <div className="chart-title-row">
        <div>
          <p className="chart-overline">법인별 영업이익</p>
          <p className="chart-title">
            {cols.corp || '법인'} × {valueLabel || '영업이익'}
            {!cols.profit && cols.sales && (
              <span style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 400, marginLeft: 8 }}>
                (영업이익 컬럼 미감지 — 매출 대체)
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasNeg && (
            <div className="chart-legend">
              <span>
                <span className="legend-dot" style={{ background: '#00d992' }} />흑자
              </span>
              <span>
                <span className="legend-dot" style={{ background: '#fb565b' }} />적자
              </span>
            </div>
          )}
          <div className="chart-cols-meta">
            {cols.corp  && <span className="col-chip">{cols.corp}</span>}
            {valueLabel && <span className="col-chip">{valueLabel}</span>}
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="chart-no-data">
          <p>법인/사업부 또는 영업이익 컬럼을 감지할 수 없습니다</p>
          <small>컬럼명에 "법인", "영업이익" 등 키워드를 포함해 주세요</small>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} stroke="rgba(61,58,57,0.5)" />
            <XAxis
              type="number"
              tick={{ fill: '#8b949e', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#3d3a39' }}
              tickFormatter={(v) => formatNumber(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#b8b3b0', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,217,146,0.05)' }} />
            {hasNeg && <ReferenceLine x={0} stroke="#3d3a39" strokeWidth={1} />}
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={22}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 0 ? '#00d992' : '#fb565b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
