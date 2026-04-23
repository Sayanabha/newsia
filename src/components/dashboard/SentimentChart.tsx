'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { format } from 'date-fns'

type Snapshot = {
  captured_at: string
  avg_score:   number
  positive:    number
  negative:    number
  neutral:     number
  total:       number
}

type Props = { snapshots: Snapshot[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as Snapshot
  return (
    <div className="bg-bloomberg-surface border border-bloomberg-border rounded p-3 font-mono text-xs space-y-1">
      <p className="text-bloomberg-dim">{label}</p>
      <p className={`font-semibold ${d.avg_score >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
        Score: {d.avg_score >= 0 ? '+' : ''}{d.avg_score.toFixed(3)}
      </p>
      <p className="text-bloomberg-green">▲ {d.positive} positive</p>
      <p className="text-bloomberg-yellow">● {d.neutral} neutral</p>
      <p className="text-bloomberg-red">▼ {d.negative} negative</p>
    </div>
  )
}

export function SentimentChart({ snapshots }: Props) {
  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-bloomberg-dim font-mono text-xs">
        No history yet · Run pipeline to start collecting data
      </div>
    )
  }

  const data = snapshots.map(s => ({
    ...s,
    time:  format(new Date(s.captured_at), 'HH:mm'),
    date:  format(new Date(s.captured_at), 'dd MMM'),
    score: s.avg_score,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00cc44" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00cc44" stopOpacity={0}   />
          </linearGradient>
          <linearGradient id="scoreGradNeg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ff3333" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ff3333" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
        <XAxis
          dataKey="time"
          tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
          axisLine={{ stroke: '#1e1e1e' }}
          tickLine={false}
        />
        <YAxis
          domain={[-1, 1]}
          tick={{ fill: '#888', fontSize: 10, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#2a2a2a" strokeWidth={1} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#00cc44"
          strokeWidth={1.5}
          fill="url(#scoreGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#00cc44', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}