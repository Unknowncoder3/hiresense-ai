import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line} from 'recharts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'

export default function Dashboard({data,loading}){
 const k=data?.kpis||{}; const funnel=data?.funnel||[]; const trends=data?.trends||[]; const candidates=data?.candidates||[]
 return <>
   <div className="page-title-row"><div><div className="eyebrow">RECRUITMENT OVERVIEW</div><h1>Good morning, Recruiter.</h1><p>Here’s what’s happening across your hiring pipeline.</p></div><div className="d-flex gap-2"><button className="btn btn-outline-soft"><i className="bi bi-download me-2"/>Export</button><button className="btn btn-primary-custom"><i className="bi bi-plus-lg me-2"/>New Job</button></div></div>
   {loading?<div className="panel p-5 text-center">Loading intelligence...</div>:<>
   <div className="kpi-grid">
    <KPICard label="Total Candidates" value={k.total_candidates?.toLocaleString()} delta="↑ 8.4% vs last month" icon="bi-people"/>
    <KPICard label="Active Jobs" value={k.active_jobs} delta="↑ 3 new roles" icon="bi-briefcase"/>
    <KPICard label="Shortlisted" value={k.shortlisted} delta="↑ 12.6% conversion" icon="bi-person-check"/>
    <KPICard label="Interviews" value={k.interviews} delta="↑ 7 this week" icon="bi-calendar2-check"/>
    <KPICard label="Offers" value={k.offers} delta="↑ 2.1% acceptance" icon="bi-file-earmark-check"/>
    <KPICard label="Hiring Rate" value={`${k.hiring_rate}%`} delta="↑ 1.8 pts" icon="bi-graph-up-arrow"/>
   </div>
   <div className="row g-4 mt-1">
    <div className="col-lg-5"><ChartCard title="Hiring Funnel" subtitle="Candidate progression by stage"><div className="chart-box"><ResponsiveContainer width="100%" height={290}><BarChart data={funnel} layout="vertical" margin={{left:15,right:20}}><CartesianGrid horizontal={false} strokeDasharray="3 3"/><XAxis type="number" hide/><YAxis dataKey="stage" type="category" width={82} axisLine={false} tickLine={false}/><Tooltip cursor={{fill:'rgba(84,109,255,.05)'}}/><Bar dataKey="count" radius={[0,8,8,0]} fill="#5b67f1" barSize={24}/></BarChart></ResponsiveContainer></div></ChartCard></div>
    <div className="col-lg-7"><ChartCard title="Application & Hiring Trends" subtitle="Monthly recruitment activity"><div className="chart-box"><ResponsiveContainer width="100%" height={290}><LineChart data={trends}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Line type="monotone" dataKey="applications" stroke="#5b67f1" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="hires" stroke="#22b573" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div></ChartCard></div>
   </div>
   <div className="panel mt-4"><div className="panel-head"><div><h3>Top Candidates</h3><p>Highest match scores across active applications.</p></div><button className="text-btn">View all <i className="bi bi-arrow-right"/></button></div><div className="table-responsive"><table className="table align-middle candidate-table"><thead><tr><th>Candidate</th><th>Role</th><th>Match</th><th>Experience</th><th>Location</th><th>Status</th></tr></thead><tbody>{candidates.map(c=><tr key={c.id}><td><div className="candidate-name"><div className="avatar-sm">{c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{c.name}</strong><small>ID #{String(c.id).padStart(4,'0')}</small></div></div></td><td>{c.job}</td><td><span className="match-pill">{c.match_score}%</span></td><td>{c.experience_years} yrs</td><td>{c.location}</td><td><span className={`status ${c.stage.toLowerCase()}`}>{c.stage}</span></td></tr>)}</tbody></table></div></div>
   <div className="ai-strip"><div className="ai-icon"><i className="bi bi-stars"/></div><div><div className="ai-title">AI Hiring Copilot <span>Preview</span></div><div className="ai-copy">Ask questions like <b>“Which Data Analyst candidates are strongest for the current opening?”</b> and get explainable recommendations from your recruitment data.</div></div><button className="btn btn-light ms-auto">Explore AI <i className="bi bi-arrow-up-right ms-1"/></button></div>
   </>}
 </>
}
