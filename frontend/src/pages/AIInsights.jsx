import { useState } from 'react'
import { askCopilot } from '../services/api'

const suggestions = [
  'Which candidates are strongest for Data Analyst?',
  'Why did our hiring rate change this month?',
  'Which sourcing channel converts best?',
  'Show me roles that need recruiter attention.',
]

export default function AIInsights() {
  const [q, setQ] = useState('')
  const [asked, setAsked] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitQuestion(question = q) {
    const clean = question.trim()
    if (!clean || loading) return
    setQ(clean)
    setAsked(clean)
    setError('')
    setLoading(true)
    try {
      setResult(await askCopilot(clean))
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <div className="page-title-row">
      <div><div className="eyebrow">AI DECISION SUPPORT</div><h1>AI Hiring Copilot</h1><p>Ask questions about recruitment data and receive grounded, explainable decision support.</p></div>
      <span className="ai-live"><i className="bi bi-circle-fill"/> {result?.ai_enabled ? 'OpenAI connected' : 'Data copilot ready'}</span>
    </div>

    <div className="copilot-hero">
      <div className="copilot-glow"><i className="bi bi-stars"/></div>
      <h2>What would you like to know?</h2>
      <p>Ask about candidates, jobs, funnel performance, sourcing, or hiring trends.</p>
      <div className="copilot-input">
        <i className="bi bi-stars"/>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitQuestion()} placeholder="e.g. Find the strongest Data Analyst candidates..."/>
        <button onClick={() => submitQuestion()} disabled={!q.trim() || loading}><i className={loading ? 'bi bi-hourglass-split' : 'bi bi-arrow-up'}/></button>
      </div>
      <div className="suggestion-list">{suggestions.map(s => <button key={s} onClick={() => submitQuestion(s)}>{s}<i className="bi bi-arrow-up-right"/></button>)}</div>
    </div>

    {error && <div className="alert alert-warning mt-4">{error}</div>}

    {asked && <div className="panel mt-4">
      <div className="panel-head"><div><div className="eyebrow">COPILOT RESPONSE</div><h3>{asked}</h3></div><span className={`status ${result?.ai_enabled ? 'hired' : 'shortlisted'}`}>{result?.ai_enabled ? 'AI grounded' : 'Deterministic'}</span></div>
      {!result && loading && <div className="copilot-loading"><span className="spinner-border spinner-border-sm me-2"/>Analyzing recruitment data...</div>}
      {result && <div className="ai-response">
        <div className="response-icon"><i className="bi bi-stars"/></div>
        <div className="flex-grow-1">
          <p className="response-copy">{result.answer}</p>
          <div className="insight-grid">
            {(result.signals || []).map(signal => <div key={signal.label}><span>{signal.label}</span><strong>{signal.value}</strong><small>{signal.detail}</small></div>)}
          </div>

          {result.candidates?.length > 0 && <div className="panel-inner mt-4">
            <div className="inner-heading"><div><h4>Recommended candidates</h4><p>Prioritized for recruiter review based on current application data.</p></div></div>
            <div className="copilot-candidates">{result.candidates.map(c => <div className="copilot-candidate" key={c.id}><div className="candidate-name"><div className="avatar-sm">{c.name.split(' ').map(x => x[0]).join('').slice(0,2)}</div><div><strong>{c.name}</strong><small>{c.role} · {c.experience} yrs · {c.location}</small></div></div><span className="match-pill">{c.match_score}%</span></div>)}</div>
          </div>}

          {result.recommendations?.length > 0 && <div className="recommendation-list mt-4"><h4>Next actions</h4>{result.recommendations.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>}

          <div className="explain-box mt-4"><i className="bi bi-info-circle"/><span>{result.notice || 'Use this as decision support. A recruiter should review the underlying evidence before taking action.'}</span></div>
        </div>
      </div>}
    </div>}

    <div className="row g-4 mt-1">
      <div className="col-lg-4"><div className="panel insight-card"><i className="bi bi-person-check"/><h3>Candidate intelligence</h3><p>Combine live candidate and application data to prioritize recruiter review.</p></div></div>
      <div className="col-lg-4"><div className="panel insight-card"><i className="bi bi-graph-up-arrow"/><h3>Hiring diagnostics</h3><p>Surface funnel bottlenecks, sourcing patterns, and operational signals.</p></div></div>
      <div className="col-lg-4"><div className="panel insight-card"><i className="bi bi-lightbulb"/><h3>Action recommendations</h3><p>Convert recruitment evidence into clear next actions while keeping a human in control.</p></div></div>
    </div>
  </>
}
