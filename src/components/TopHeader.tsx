'use client'

import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  
  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('coffee')
    else setTheme('dark')
  }

  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '☕'
  const title = theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'Coffee Mode'

  return (
    <div style={{ marginRight: '1rem' }}>
      <button 
        onClick={cycleTheme}
        style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '1.1rem' }}
        title={title}
      >
        {icon}
      </button>
    </div>
  )
}

export function TopHeader({ user }: { user?: { name: string } }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
  
  return (
    <header className="top-header" style={{ justifyContent: 'space-between' }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div className="top-header-logo">
          <div className="top-header-icon">IT</div>
          <div>
            <div className="top-header-text">Asset Manager</div>
            <div className="top-header-sub">Enterprise System</div>
          </div>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ThemeSwitcher />
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Hi! {user.name}
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {initial}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
