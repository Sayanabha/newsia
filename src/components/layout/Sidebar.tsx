'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Newspaper, TrendingUp,
  BarChart2, PiggyBank, Zap
} from 'lucide-react'
import { AutoRefresh } from './AutoRefresh'

const NAV_ITEMS = [
  { href: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/news',      label: 'News',      icon: Newspaper       },
  { href: '/sentiment', label: 'Sentiment', icon: TrendingUp      },
  { href: '/stocks',    label: 'Stocks',    icon: BarChart2       },
  { href: '/planner',   label: 'Planner',   icon: PiggyBank       },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* ═══════════════════════════════════════
          DESKTOP SIDEBAR — visible on md+
          Hidden completely on mobile
      ═══════════════════════════════════════ */}
      <aside style={{
        position:        'fixed',
        top:             0,
        left:            0,
        height:          '100vh',
        width:           '224px',
        backgroundColor: '#111111',
        borderRight:     '1px solid #1e1e1e',
        display:         'flex',
        flexDirection:   'column',
        zIndex:          50,
      }}
        className="desktop-sidebar"
      >
        {/* Logo */}
        <div style={{
          padding:      '20px 16px',
          borderBottom: '1px solid #1e1e1e',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#ff6600" />
            <span style={{
              fontFamily:    'monospace',
              fontSize:      '14px',
              color:         '#ff6600',
              fontWeight:    600,
              letterSpacing: '0.15em',
            }}>
              NEWSIA
            </span>
          </div>
          <p style={{
            fontFamily: 'monospace', fontSize: '11px',
            color: '#888', margin: '4px 0 0',
          }}>
            Market Intelligence
          </p>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '10px',
                  padding:         '8px 12px',
                  borderRadius:    '6px',
                  fontFamily:      'monospace',
                  fontSize:        '12px',
                  textDecoration:  'none',
                  transition:      'all 0.15s',
                  backgroundColor: active ? '#2a2a2a' : 'transparent',
                  color:           active ? '#ff6600' : '#888',
                  borderLeft:      active ? '2px solid #ff6600' : '2px solid transparent',
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Auto refresh */}
        <AutoRefresh />

        {/* Footer */}
        <div style={{
          padding:      '12px 16px',
          borderTop:    '1px solid #1e1e1e',
          fontFamily:   'monospace',
          fontSize:     '10px',
          color:        '#555',
        }}>
          ⚠ Not financial advice
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          MOBILE BOTTOM TAB BAR
          No hamburger. No drawer. Just tabs.
          Visible only on mobile (max-width 767px)
      ═══════════════════════════════════════ */}
      <div className="mobile-topbar" style={{
        position:        'fixed',
        top:             0,
        left:            0,
        right:           0,
        height:          '52px',
        backgroundColor: '#111111',
        borderBottom:    '1px solid #1e1e1e',
        display:         'flex',
        alignItems:      'center',
        paddingLeft:     '16px',
        zIndex:          50,
      }}>
        <Zap size={14} color="#ff6600" />
        <span style={{
          fontFamily:    'monospace',
          fontSize:      '13px',
          color:         '#ff6600',
          fontWeight:    600,
          letterSpacing: '0.15em',
          marginLeft:    '8px',
        }}>
          NEWSIA
        </span>
      </div>

      <nav className="mobile-bottombar" style={{
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        height:          '60px',
        backgroundColor: '#111111',
        borderTop:       '1px solid #1e1e1e',
        display:         'flex',
        alignItems:      'stretch',
        zIndex:          50,
      }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex:           1,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '3px',
                textDecoration: 'none',
                color:          active ? '#ff6600' : '#555',
                backgroundColor: active ? 'rgba(255,102,0,0.08)' : 'transparent',
                borderTop:      active ? '2px solid #ff6600' : '2px solid transparent',
                transition:     'all 0.15s',
              }}
            >
              <Icon size={18} />
              <span style={{
                fontFamily: 'monospace',
                fontSize:   '9px',
                letterSpacing: '0.05em',
              }}>
                {label.toUpperCase()}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── Visibility rules ── */}
      <style>{`
        /* Desktop: show sidebar, hide mobile bars */
        @media (min-width: 768px) {
          .desktop-sidebar  { display: flex !important; }
          .mobile-topbar    { display: none !important; }
          .mobile-bottombar { display: none !important; }
        }

        /* Mobile: hide sidebar, show mobile bars */
        @media (max-width: 767px) {
          .desktop-sidebar  { display: none !important; }
          .mobile-topbar    { display: flex !important; }
          .mobile-bottombar { display: flex !important; }

          /* Extra bottom padding so content clears the tab bar */
          #main-content {
            padding-bottom: 68px;
          }
        }
      `}</style>
    </>
  )
}