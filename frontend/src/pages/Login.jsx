import { useState } from 'react'
import { login, register } from '../services/api'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: 'admin@hiresense.ai', password: 'HireSense123!' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const result = mode === 'login' ? await login(form.email, form.password) : await register(form.name, form.email, form.password)
      localStorage.setItem('hiresense_token', result.access_token)
      onLogin(result.user)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return <div className="auth-shell">
    <div className="auth-brand"><span className="brand-mark"><i className="bi bi-stars"/></span><div><strong>HireSense</strong><small>AI RECRUITMENT OS</small></div></div>
    <div className="auth-card">
      <div className="eyebrow">SECURE RECRUITER WORKSPACE</div>
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your recruiter account'}</h1>
      <p>{mode === 'login' ? 'Sign in to access recruitment intelligence.' : 'Set up a recruiter account for this workspace.'}</p>
      {error && <div className="alert alert-warning">{error}</div>}
      <form onSubmit={submit}>
        {mode === 'register' && <label className="field-label">Full name<input className="form-control auth-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>}
        <label className="field-label">Email<input type="email" className="form-control auth-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label>
        <label className="field-label">Password<input type="password" className="form-control auth-input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={8} required/></label>
        <button className="btn btn-primary-custom w-100 auth-submit" disabled={loading}>{loading ? 'Signing in...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <div className="demo-login"><i className="bi bi-shield-check"/><div><strong>Demo recruiter</strong><span>admin@hiresense.ai · HireSense123!</span></div></div>
      <button className="auth-switch" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
    </div>
    <small className="auth-footer">HireSense AI · portfolio-grade recruitment intelligence platform</small>
  </div>
}
