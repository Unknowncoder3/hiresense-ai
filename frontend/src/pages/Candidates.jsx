import { useMemo, useState } from 'react'

const mockCandidates = [
  { id: 1042, name: 'Rahul Sharma', role: 'Data Analyst', location: 'Bengaluru', experience: 2.4, skills: ['SQL', 'Python', 'Power BI', 'Excel'], score: 96, stage: 'Interview', source: 'LinkedIn', applied: '2 days ago' },
  { id: 1037, name: 'Priya Menon', role: 'Data Analyst', location: 'Hyderabad', experience: 3.1, skills: ['Python', 'SQL', 'Tableau', 'Statistics'], score: 92, stage: 'Shortlisted', source: 'Referral', applied: '3 days ago' },
  { id: 1061, name: 'Arjun Kapoor', role: 'ML Engineer', location: 'Pune', experience: 3.8, skills: ['Python', 'Scikit-learn', 'TensorFlow', 'AWS'], score: 91, stage: 'Screening', source: 'Website', applied: '4 days ago' },
  { id: 1055, name: 'Ananya Rao', role: 'Product Analyst', location: 'Mumbai', experience: 2.1, skills: ['SQL', 'Excel', 'Power BI', 'A/B Testing'], score: 89, stage: 'Interview', source: 'Indeed', applied: '5 days ago' },
  { id: 1029, name: 'Vikram Singh', role: 'Backend Engineer', location: 'Delhi', experience: 4.5, skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'], score: 87, stage: 'Offer', source: 'Referral', applied: '1 week ago' },
  { id: 1073, name: 'Neha Iyer', role: 'Business Analyst', location: 'Chennai', experience: 2.7, skills: ['SQL', 'Excel', 'Power BI', 'Jira'], score: 86, stage: 'Screening', source: 'LinkedIn', applied: '1 week ago' },
  { id: 1018, name: 'Karan Patel', role: 'Data Scientist', location: 'Ahmedabad', experience: 4.1, skills: ['Python', 'Pandas', 'XGBoost', 'MLflow'], score: 84, stage: 'Shortlisted', source: 'Campus', applied: '8 days ago' },
  { id: 1080, name: 'Sneha Das', role: 'Data Analyst', location: 'Kolkata', experience: 1.8, skills: ['SQL', 'Python', 'Excel', 'Power BI'], score: 82, stage: 'Applied', source: 'Website', applied: '9 days ago' },
]

export default function Candidates() {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('All')
  const [role, setRole] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => mockCandidates.filter(c => {
    const matchesQuery = `${c.name} ${c.role} ${c.location} ${c.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const matchesStage = stage === 'All' || c.stage === stage
    const matchesRole = role === 'All' || c.role === role
    return matchesQuery && matchesStage && matchesRole
  }), [query, stage, role])

  return <>
    <div className="page-title-row">
      <div><div className="eyebrow">TALENT INTELLIGENCE</div><h1>Candidates</h1><p>Search, evaluate, and compare your active talent pool.</p></div>
      <button className="btn btn-primary-custom"><i className="bi bi-person-plus me-2"/>Add Candidate</button>
    </div>

    <div className="panel filters-panel mb-4">
      <div className="search-wrap"><i className="bi bi-search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, skills, role, or location..."/></div>
      <select className="form-select filter-select" value={role} onChange={e => setRole(e.target.value)}><option>All</option>{[...new Set(mockCandidates.map(c => c.role))].map(r => <option key={r}>{r}</option>)}</select>
      <select className="form-select filter-select" value={stage} onChange={e => setStage(e.target.value)}><option>All</option>{['Applied','Screening','Shortlisted','Interview','Offer','Hired'].map(s => <option key={s}>{s}</option>)}</select>
      <button className="btn btn-outline-soft"><i className="bi bi-sliders2 me-2"/>More filters</button>
    </div>

    <div className="panel">
      <div className="panel-head"><div><h3>Candidate pool</h3><p>{filtered.length} candidates match your current filters.</p></div><button className="text-btn"><i className="bi bi-download me-1"/> Export</button></div>
      <div className="table-responsive"><table className="table align-middle candidate-table"><thead><tr><th>Candidate</th><th>Target role</th><th>Match</th><th>Skills</th><th>Experience</th><th>Stage</th><th></th></tr></thead><tbody>
        {filtered.map(c => <tr key={c.id} onClick={() => setSelected(c)} className="clickable-row">
          <td><div className="candidate-name"><div className="avatar-sm">{c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{c.name}</strong><small>#{c.id} · {c.location}</small></div></div></td>
          <td>{c.role}</td><td><span className="match-pill">{c.score}%</span></td>
          <td><div className="skill-chips">{c.skills.slice(0,3).map(s => <span key={s}>{s}</span>)}{c.skills.length > 3 && <span>+{c.skills.length-3}</span>}</div></td>
          <td>{c.experience} yrs</td><td><span className={`status ${c.stage.toLowerCase()}`}>{c.stage}</span></td><td><i className="bi bi-chevron-right text-muted"/></td>
        </tr>)}
      </tbody></table></div>
    </div>

    {selected && <div className="detail-drawer-backdrop" onClick={() => setSelected(null)}><aside className="detail-drawer" onClick={e => e.stopPropagation()}>
      <div className="drawer-head"><div><div className="eyebrow">CANDIDATE PROFILE</div><h2>{selected.name}</h2><p>{selected.role} · {selected.location}</p></div><button className="icon-btn" onClick={() => setSelected(null)}><i className="bi bi-x-lg"/></button></div>
      <div className="score-hero"><div><span>AI Match Score</span><strong>{selected.score}%</strong></div><div className="score-ring"><div>{selected.score}</div></div></div>
      <div className="drawer-section"><h4>Fit snapshot</h4><div className="fit-grid"><div><span>Experience</span><b>{selected.experience} years</b></div><div><span>Stage</span><b>{selected.stage}</b></div><div><span>Source</span><b>{selected.source}</b></div><div><span>Applied</span><b>{selected.applied}</b></div></div></div>
      <div className="drawer-section"><h4>Relevant skills</h4><div className="skill-chips large">{selected.skills.map(s => <span key={s}>{s}</span>)}</div></div>
      <div className="drawer-section"><h4>AI recommendation</h4><div className="ai-mini"><i className="bi bi-stars"/><p>Strong fit for this role based on core skills, relevant experience, and current pipeline stage. Review project depth and communication performance before final selection.</p></div></div>
      <div className="drawer-actions"><button className="btn btn-outline-soft flex-grow-1">View resume</button><button className="btn btn-primary-custom flex-grow-1">Move stage</button></div>
    </aside></div>}
  </>
}
