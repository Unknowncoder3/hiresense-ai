import { useEffect, useMemo, useState } from 'react'
import { getCandidates } from '../services/api'

export default function Candidates() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('All')
  const [role, setRole] = useState('All')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getCandidates({ search: query, stage, role })
      .then(data => setItems(data.items || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [query, stage, role])

  const roles = useMemo(() => ['All', ...new Set(items.map(c => c.role))], [items])

  return <>
    <div className="page-title-row">
      <div><div className="eyebrow">TALENT INTELLIGENCE</div><h1>Candidates</h1><p>Search, evaluate, and compare your active talent pool.</p></div>
      <button className="btn btn-primary-custom"><i className="bi bi-person-plus me-2"/>Add Candidate</button>
    </div>

    {error && <div className="alert alert-warning">Backend unavailable: {error}</div>}
    <div className="panel filters-panel mb-4">
      <div className="search-wrap"><i className="bi bi-search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, skills, role, or location..."/></div>
      <select className="form-select filter-select" value={role} onChange={e => setRole(e.target.value)}>{roles.map(r => <option key={r}>{r}</option>)}</select>
      <select className="form-select filter-select" value={stage} onChange={e => setStage(e.target.value)}><option>All</option>{['Applied','Screening','Shortlisted','Interview','Offer','Hired'].map(s => <option key={s}>{s}</option>)}</select>
      <button className="btn btn-outline-soft"><i className="bi bi-sliders2 me-2"/>More filters</button>
    </div>

    <div className="panel">
      <div className="panel-head"><div><h3>Candidate pool</h3><p>{loading ? 'Loading candidates...' : `${items.length} candidates match your current filters.`}</p></div><button className="text-btn"><i className="bi bi-download me-1"/> Export</button></div>
      <div className="table-responsive"><table className="table align-middle candidate-table"><thead><tr><th>Candidate</th><th>Target role</th><th>Match</th><th>Skills</th><th>Experience</th><th>Stage</th><th></th></tr></thead><tbody>
        {!loading && items.map(c => <tr key={c.application_id} onClick={() => setSelected(c)} className="clickable-row">
          <td><div className="candidate-name"><div className="avatar-sm">{c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{c.name}</strong><small>#{c.id} · {c.location}</small></div></div></td>
          <td>{c.role}</td><td><span className="match-pill">{c.score}%</span></td>
          <td><div className="skill-chips">{c.skills.slice(0,3).map(s => <span key={s}>{s}</span>)}{c.skills.length > 3 && <span>+{c.skills.length-3}</span>}</div></td>
          <td>{c.experience} yrs</td><td><span className={`status ${c.stage.toLowerCase()}`}>{c.stage}</span></td><td><i className="bi bi-chevron-right text-muted"/></td>
        </tr>)}
      </tbody></table></div>
    </div>

    {selected && <div className="detail-drawer-backdrop" onClick={() => setSelected(null)}><aside className="detail-drawer" onClick={e => e.stopPropagation()}>
      <div className="drawer-head"><div><div className="eyebrow">CANDIDATE PROFILE</div><h2>{selected.name}</h2><p>{selected.role} · {selected.location}</p></div><button className="icon-btn" onClick={() => setSelected(null)}><i className="bi bi-x-lg"/></button></div>
      <div className="score-hero"><div><span>AI Match Score</span><strong>{selected.score}%</strong></div><div className="score-ring"><div>{Math.round(selected.score)}</div></div></div>
      <div className="drawer-section"><h4>Fit snapshot</h4><div className="fit-grid"><div><span>Experience</span><b>{selected.experience} years</b></div><div><span>Stage</span><b>{selected.stage}</b></div><div><span>Source</span><b>{selected.source}</b></div><div><span>Applied</span><b>{selected.applied}</b></div></div></div>
      <div className="drawer-section"><h4>Relevant skills</h4><div className="skill-chips large">{selected.skills.map(s => <span key={s}>{s}</span>)}</div></div>
      <div className="drawer-section"><h4>AI recommendation</h4><div className="ai-mini"><i className="bi bi-stars"/><p>Strong fit for this role based on skills, experience, and current application stage. Review interview performance and role-specific requirements before final selection.</p></div></div>
      <div className="drawer-actions"><button className="btn btn-outline-soft flex-grow-1">View resume</button><button className="btn btn-primary-custom flex-grow-1">Move stage</button></div>
    </aside></div>}
  </>
}
