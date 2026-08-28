export default function Sidebar({active='Dashboard', setActive}){
  const items=[['Dashboard','bi-grid-1x2-fill'],['Candidates','bi-people-fill'],['Jobs','bi-briefcase-fill'],['Applications','bi-kanban-fill'],['Interviews','bi-calendar2-check-fill'],['Analytics','bi-bar-chart-fill'],['Resume Intelligence','bi-file-earmark-person-fill'],['AI Insights','bi-stars']]
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><i className="bi bi-stars"/></span><div><div className="brand-name">HireSense</div><div className="brand-sub">AI RECRUITMENT OS</div></div></div>
    <div className="nav-label">Workspace</div>
    <nav>{items.map(([name,icon])=><button key={name} onClick={()=>setActive(name)} className={`nav-item ${active===name?'active':''}`}><i className={`bi ${icon}`}/><span>{name}</span></button>)}</nav>
    <div className="sidebar-bottom"><div className="nav-label">System</div><button className="nav-item"><i className="bi bi-gear-fill"/><span>Settings</span></button><div className="profile-mini"><div className="avatar">SD</div><div><strong>Recruiter</strong><small>Admin workspace</small></div><i className="bi bi-three-dots ms-auto"/></div></div>
  </aside>
}
