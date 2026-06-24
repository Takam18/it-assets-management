import { MenuBar } from "@/components/MenuBar";
import { TopHeader } from "@/components/TopHeader";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ 
    where: { id: session.userId },
    select: { name: true, email: true }
  });
  
  const displayName = user?.name || user?.email || 'User';

  return (
    <>
      <TopHeader user={{ name: displayName }} />
      <div className="app-layout">
        <MenuBar role={session.role} />
        <main className="main-content">
        {children}
        </main>
      </div>

      {/* Footer */}
      <footer style={{ 
        position: 'relative',
        zIndex: 100,
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 2rem', 
        opacity: 0.9,
        background: 'rgba(0, 0, 0, 0.4)',
        borderTop: '1px solid var(--glass-border)'
      }}>
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginBottom: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {['About us', 'Community', 'Contact us', 'Privacy policy', 'Terms of use'].map((text) => (
              <Link key={text} href={`/${text.toLowerCase().replace(/\s+/g, '-')}`} style={{
                color: 'var(--text-tertiary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500
              }}>
                {text}
              </Link>
            ))}
          </div>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <h2 style={{ 
                fontSize: '48px', 
                fontWeight: 400, 
                color: 'var(--accent-amber)', 
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1,
                fontFamily: '"Press Start 2P", system-ui',
                textShadow: '0 0 10px hsla(38, 95%, 55%, 0.3)'
              }}>
                IT WORKS!
              </h2>
              <div style={{
                width: '100%',
                height: '3px',
                background: 'var(--accent-amber)',
                margin: '0.5rem 0'
              }} />
              <p style={{ 
                fontSize: '12px', 
                color: 'var(--text-tertiary)', 
                margin: '0.5rem 0 0 0' 
              }}>
                @2026 IT Works!. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
    </>
  );
}
