import { useMemo, useState } from 'react'

const jobs = [
  { id:'JOB-102', title:'Senior Data Analyst', dept:'Data & Analytics', location:'Bengaluru', type:'Full-time', applicants:128, shortlisted:24, days:18, status:'Open', priority:'High', skills:['SQL','Python','Power BI'] },
  { id:'JOB-101', title:'ML Engineer', dept:'AI & Engineering', location:'Hyderabad', type:'Full-time', applicants:94, shortlisted:16, days:11, status:'Open', priority:'High', skills:['Python','TensorFlow','AWS'] },
  { id:'JOB-099', title:'Product Analyst', dept:'Product', location:'Mumbai', type:'Full-time', applicants:76, shortlisted:13, days:26, status:'Open', priority:'Medium', skills:['SQL','Excel','A/B Testing'] },
  { id:'JOB-097', title:'Backend Engineer', dept:'Engineering', location:'Remote', type:'Full-time', applicants:143, shortlisted:31, days:32, status:'Open', priority:'Medium', skills:['FastAPI','PostgreSQL','Docker'] },
  { id:'JOB-094', title:'Business Analyst', dept:'Strategy', location:'Delhi', type:'Full-time', applicants:61, shortlisted:9, days:41, status:'Paused', priority:'Low', skills:['SQL','Power BI','Jira'] },
]

export default function Jobs(){
 const [query,setQuery]=useState(''); const [filter,setFilter]=useState('All')
 const filtered=useMemo(()=>jobs.filter(j=>(`${j.title} ${j.dept} ${j.location}`.toLowerCase().includes(query.toLowerCase()))&&(filter==='All'||j.status===filter)),[query,filter])
 return <>
  <div className="page-title-row"><div><div className="eyebrow">WORKFORCE PLANNING</div><h1>Jobs</h1><p>Manage open roles and monitor hiring demand across teams.</p></div><button className="btn btn-primary-custom"><i className="bi bi-plus-lg me-2"/>Create job</button></div>
  <div className="kpi-grid compact-kpis">
   <div className="mini-stat"><span>Open roles</span><strong>18</strong><small>+3 this month</small></div><div className="mini-stat"><span>Total applicants</span><strong>1,284</strong><small>Across active roles</small></div><div className="mini-stat"><span>Avg. applicants / job</span><strong>71</strong><small>↑ 9.2% vs last month</small></div><div className="mini-stat"><span>Critical roles</span><strong>4</strong><small>Need attention</small></div>
  </div>
  <div className="panel filters-panel mb-4"><div className="search-wrap"><i className="bi bi-search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jobs, departments, or locations..."/></div><select className="form-select filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Open</option><option>Paused</option></select></div>
  <div className="job-grid">{filtered.map(j=><article className="job-card" key={j.id}><div className="job-top"><span className={`priority ${j.priority.toLowerCase()}`}>{j.priority} priority</span><span className={`status ${j.status.toLowerCase()}`}>{j.status}</span></div><div className="job-icon"><i className="bi bi-briefcase"/></div><h3>{j.title}</h3><p>{j.dept}</p><div className="job-meta"><span><i className="bi bi-geo-alt"/> {j.location}</span><span><i className="bi bi-clock"/> {j.type}</span></div><div className="skill-chips">{j.skills.map(s=><span key={s}>{s}</span>)}</div><div className="job-stats"><div><b>{j.applicants}</b><span>Applicants</span></div><div><b>{j.shortlisted}</b><span>Shortlisted</span></div><div><b>{j.days}d</b><span>Open time</span></div></div><button className="job-action">View pipeline <i className="bi bi-arrow-right"/></button></article>)}</div>
 </>
}
