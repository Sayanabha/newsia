'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'

const INTERVAL_MS = 60 * 60 * 1000  // 1 hour

export function AutoRefresh() {
  const [isRunning,   setIsRunning]   = useState(false)
  const [lastRan,     setLastRan]     = useState<Date | null>(null)
  const [nextRun,     setNextRun]     = useState<Date | null>(null)
  const [status,      setStatus]      = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [countdown,   setCountdown]   = useState('')
  const [autoEnabled, setAutoEnabled] = useState(false)

  const runPipeline = useCallback(async () => {
    setStatus('running')
    try {
      const res  = await fetch('/api/cron/pipeline')
      const data = await res.json()
      setLastRan(new Date())
      setNextRun(new Date(Date.now() + INTERVAL_MS))
      setStatus(data.success ? 'success' : 'error')
      console.log('[AutoRefresh] Pipeline result:', data)
    } catch {
      setStatus('error')
    }
  }, [])

  // Countdown display
  useEffect(() => {
    if (!nextRun) return
    const timer = setInterval(() => {
      const diff = nextRun.getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('now')
        return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${m}m ${s.toString().padStart(2, '0')}s`)
    }, 1000)
    return () => clearInterval(timer)
  }, [nextRun])

  // Auto-run interval
  useEffect(() => {
    if (!autoEnabled) return
    runPipeline() // run immediately when enabled
    const interval = setInterval(runPipeline, INTERVAL_MS)
    return () => clearInterval(interval)
  }, [autoEnabled, runPipeline])

  const StatusIcon = () => {
    if (status === 'running') return <RefreshCw size={10} className="animate-spin text-bloomberg-orange" />
    if (status === 'success') return <CheckCircle size={10} className="text-bloomberg-green" />
    if (status === 'error')   return <XCircle    size={10} className="text-bloomberg-red"   />
    return <Clock size={10} className="text-bloomberg-dim" />
  }

  return (
    <div className="px-3 py-3 border-t border-bloomberg-border space-y-2">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-bloomberg-dim">AUTO-REFRESH</span>
        <button
          onClick={() => setAutoEnabled(p => !p)}
          className={`relative w-8 h-4 rounded-full transition-colors ${
            autoEnabled ? 'bg-bloomberg-orange' : 'bg-bloomberg-muted'
          }`}
        >
          <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
            autoEnabled ? 'left-4' : 'left-0.5'
          }`} />
        </button>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-1.5">
        <StatusIcon />
        <span className="font-mono text-xs text-bloomberg-dim">
          {status === 'running' ? 'Running pipeline...' :
           status === 'success' ? `Done · next in ${countdown}` :
           status === 'error'   ? 'Last run failed' :
           autoEnabled          ? `Next in ${countdown}` : 'Manual mode'}
        </span>
      </div>

      {/* Last ran */}
      {lastRan && (
        <p className="font-mono text-xs text-bloomberg-dim">
          Last: {lastRan.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {/* Manual trigger */}
      <button
        onClick={runPipeline}
        disabled={status === 'running'}
        className="w-full py-1 text-xs font-mono border border-bloomberg-border text-bloomberg-dim hover:text-bloomberg-orange hover:border-bloomberg-orange transition-colors rounded"
      >
        {status === 'running' ? 'Running...' : '▶ Run Now'}
      </button>
    </div>
  )
}