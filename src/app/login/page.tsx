'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      setIdentifier('')
      setPassword('')
      form.reset() // Clear the inputs on failure
    } else if (result?.success) {
      router.push(result.redirect || '/')
      router.refresh()
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .login-layout {
          display: flex;
          min-height: 100vh;
          background: #050505;
          color: white;
          font-family: var(--font-sans);
        }
        .login-left {
          flex: 1;
          display: none;
          position: relative;
          padding: 4rem;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .login-left {
            display: flex;
          }
        }
        .login-bg {
          position: absolute;
          inset: 0;
          background-image: url('/login-bg.png');
          background-size: cover;
          background-position: center;
          transition: transform 10s ease;
        }
        .login-left:hover .login-bg {
          transform: scale(1.05);
        }
        .login-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(15,25,50,0.6) 0%, rgba(5,5,5,0.8) 60%, #050505 100%);
        }
        .login-brand {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: slideDown 0.8s ease-out;
        }
        .login-logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.5rem;
          box-shadow: 0 0 20px rgba(59,130,246,0.5);
        }
        .login-brand-text {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .login-hero {
          position: relative;
          z-index: 10;
          max-width: 500px;
          animation: slideUp 0.8s ease-out 0.2s both;
        }
        .login-hero h1 {
          font-size: 3.5rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, var(--accent-cyan), #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .login-hero p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }
        .login-glow-1 {
          position: absolute;
          top: -20%; right: -10%;
          width: 500px; height: 500px;
          background: rgba(59,130,246,0.1);
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .login-glow-2 {
          position: absolute;
          bottom: -20%; left: -10%;
          width: 400px; height: 400px;
          background: rgba(6,182,212,0.1);
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .login-form-container {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
          animation: fadeIn 0.8s ease-out;
        }
        .login-header {
          margin-bottom: 2.5rem;
        }
        .login-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: var(--text-secondary);
        }
        .login-input-wrap {
          margin-bottom: 1.5rem;
        }
        .login-input-wrap label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          transition: color 0.3s;
        }
        .login-input-wrap:focus-within label {
          color: var(--accent-cyan);
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          color: white;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s;
          outline: none;
        }
        .login-input:focus {
          background: rgba(255,255,255,0.05);
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.2);
        }
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
          box-shadow: 0 0 20px rgba(59,130,246,0.3);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(59,130,246,0.5);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-error {
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.2);
          color: #f43f5e;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
      <div className="login-layout">
        <div className="login-left">
          <div className="login-bg" />
          <div className="login-overlay" />
          
          <div className="login-brand">
            <div className="login-logo">IT</div>
            <div className="login-brand-text">Asset Manager</div>
          </div>
          
          <div className="login-hero">
            <h1>Enterprise Asset Intelligence</h1>
            <p>Take complete control of your hardware and software lifecycle. Track, assign, and maintain your IT infrastructure with unparalleled visibility.</p>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-glow-1" />
          <div className="login-glow-2" />
          
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your administrator account</p>
            </div>
            
            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="login-input-wrap">
                <label>Email Address or NTID</label>
                <input 
                  type="text" 
                  name="identifier" 
                  className="login-input" 
                  placeholder="admin@company.com or ntid"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="off"
                  required 
                />
              </div>
              
              <div className="login-input-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ marginBottom: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <input 
                  type="password" 
                  name="password" 
                  className="login-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Securely managed by <span style={{ color: 'var(--text-secondary)' }}>IT Administration</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
