'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'

const navSections = [
  {
    title: 'Overview',
    links: [
      { href: '/', label: 'Dashboard', icon: '📊' },
      { href: '/forecast', label: 'The Forecast', icon: '📈' },
    ],
  },
  {
    title: 'Asset Management',
    links: [
      { href: '/assets', label: 'Assets', icon: '💻' },
      { href: '/assignments', label: 'Assignments', icon: '🔗' },
      { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
    ],
  },
  {
    title: 'People',
    links: [
      { href: '/employees', label: 'Employees', icon: '👤' },
    ],
  },
  {
    title: 'Procurement',
    links: [
      { href: '/procure', label: 'Procure & Sourcing', icon: '🛒' },
    ],
  },
  {
    title: 'Reference Data',
    links: [
      { href: '/categories', label: 'Categories', icon: '📁' },
      { href: '/brands', label: 'Brands', icon: '🏷️' },
      { href: '/vendors', label: 'Vendors', icon: '🏢' },
      { href: '/locations', label: 'Locations', icon: '📍' },
      { href: '/areas', label: 'Areas', icon: '🏢' },
      { href: '/departments', label: 'Departments', icon: '🏛️' },
    ],
  },
]

export function MenuBar({ role }: { role?: string }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isSectionActive = (links: any[]) => {
    return links.some(link => isActive(link.href))
  }

  return (
    <nav className="menubar">
      {/* Spacer for true centering */}
      <div style={{ flex: 1 }}></div>

      {/* Centered navigation items */}
      <div style={{ display: 'flex', height: '100%', gap: 'var(--space-lg)' }}>
        {navSections.map((section) => (
        <div key={section.title} className={`menu-item ${isSectionActive(section.links) ? 'active' : ''}`}>
          <span>{section.title}</span>
          <div className="menu-dropdown">
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`menu-dropdown-link ${isActive(link.href) ? 'active' : ''}`}
                style={isActive(link.href) ? { color: 'var(--accent-cyan)' } : {}}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {role === 'ADMIN' && (
        <div className={`menu-item ${pathname.startsWith('/settings') ? 'active' : ''}`}>
          <span>Settings</span>
          <div className="menu-dropdown">
            <Link
              href="/settings/users"
              className="menu-dropdown-link"
              style={isActive('/settings/users') ? { color: 'var(--accent-cyan)' } : {}}
            >
              <span className="sidebar-link-icon">👥</span>
              Users
            </Link>
            <Link
              href="/settings/pricing"
              className="menu-dropdown-link"
              style={isActive('/settings/pricing') ? { color: 'var(--accent-cyan)' } : {}}
            >
              <span className="sidebar-link-icon">⚙️</span>
              Pricing Defaults
            </Link>
          </div>
        </div>
      )}
      </div>

      {/* Logout button pushed to the right */}
      <div className="menu-item" style={{ flex: 1, justifyContent: 'flex-end' }}>
        <form action={logout} style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
          <button 
            type="submit" 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: 'var(--accent-rose)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </form>
      </div>
    </nav>
  )
}
