import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import ActionModal from '../components/ActionModal'
import { createJob } from '../services/api'
import { downloadCsv } from '../utils/exportCsv'

export default function Dashboard({data,loading,onNavigate,onRefresh}){
 const k=data?.kpis||{}; const funnel=data?.funnel||[]; const trends=data?.trends||[]; const candidates=data?.candidates||[]
 const [showJob,setShowJob]=useState(false); const [form,setForm]=useState({title:'',department:'Data',location:'Remote',openings:1}); const [saving,setSaving]=useState(false); const [message,setMessage]=useState('')
 async function saveJob(e){e.preventDefault();setSaving(true);setMessage('');try{await createJob({...form,openings:Number(form.openings)});setMessage('Job created successfully. Refreshing dashboard…');setShowJob(false);onRefresh?.()}catch(err){setMessage(err.message)}finally{setSaving(false)}}
 function exportDashboard(){downloadCsv('hiresense-dashboard.csv',(candidates.length?candidates:[{metric:'Total Candidates',value:k.total_candidates},{metric:'Active Jobs',value:k.active_jobs},{metric:'Shortlisted',value:k.shortlisted},{metric:'Interviews',value:k.interviews},{metric:'Offers',value:k.offers},{metric:'Hiring Rate',value:k.hiring_rate}]).map(x=>x.metric?x:{candidate:x.name,job:x.job,match:x.match_score,stage:x.stage}))}
 return <>
   <div className="page-title-row"><div><div className="eyebrow">RECRUITMENT OVERVIEW</div><h1>Good morning, Recruiter.</h1><p>Here’s what’s happening across your hiring pipeline.</p></div><div className="d-flex gap-2"><button className="btn btn-outline-soft" onClick={exportDashboard}><i className="bi bi-download me-2"/>Export</button><button className="btn btn-primary-custom" onClick={()=>setShowJob(true)}><i className="bi bi-plus-lg me-2"/>New Job</button></div></div>
   {message&&<div className="alert alert-success">{message}</div>}
   {loading?<div className="panel p-5 text-center">Loading intelligence...</div>:<>
   <div className="kpi-grid">
    <KPICard label="Total Candidates" value={k.total_candidates?.toLocaleString() ?? '—'} delta="↑ 8.4% vs last month" icon="bi-people"/>
    <KPICard label="Active Jobs" value={k.active_jobs ?? '—'} delta="↑ 3 new roles" icon="bi-briefcase"/>
    <KPICard label="Shortlisted" value={k.shortlisted ?? '—'} delta="↑ 12.6% conversion" icon="bi-person-check"/>
    <KPICard label="Interviews" value={k.interviews ?? '—'} delta="↑ 7 this week" icon="bi-calendar2-check"/>
    <KPICard label="Offers" value={k.offers ?? '—'} delta="↑ 2.1% acceptance" icon="bi-file-earmark-check"/>
    <KPICard label="Hiring Rate" value={k.hiring_rate != null ? `${k.hiring_rate}%` : '—'} delta="↑ 1.8 pts" icon="bi-graph-up-arrow"/>
   </div>
   <div className="row g-4 mt-1">
    <div className="col-lg-5"><ChartCard title="Hiring Funnel" subtitle="Candidate progression by stage"><div className="chart-box"><ResponsiveContainer width="100%" height={290}><BarChart data={funnel} layout="vertical" margin={{left:15,right:20}}><CartesianGrid horizontal={false} strokeDasharray="3 3"/><XAxis type="number" hide/><YAxis dataKey="stage" type="category" width={82} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="count" radius={[0,8,8,0]} fill="#5b67f1" barSize={24}/></BarChart></ResponsiveContainer></div></ChartCard></div>
    <div className="col-lg-7"><ChartCard title="Application & Hiring Trends" subtitle="Monthly recruitment activity"><div className="chart-box"><ResponsiveContainer width="100%" height={290}><LineChart data={trends}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Line type="monotone" dataKey="applications" stroke="#5b67f1" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="hires" stroke="#22b573" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div></ChartCard></div>
   </div>
   <div className="panel mt-4"><div className="panel-head"><div><h3>Top Candidates</h3><p>Highest match scores across active applications.</p></div><button className="text-btn" onClick={()=>onNavigate?.('Candidates')}>View all <i className="bi bi-arrow-right"/></button></div><div className="table-responsive"><table className="table align-middle candidate-table"><thead><tr><th>Candidate</th><th>Role</th><th>Match</th><th>Experience</th><th>Location</th><th>Status</th></tr></thead><tbody>{candidates.map(c=><tr key={c.id}><td><div className="candidate-name"><div className="avatar-sm">{c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{c.name}</strong><small>ID #{String(c.id).padStart(4,'0')}</small></div></div></td><td>{c.job}</td><td><span className="match-pill">{c.match_score}%</span></td><td>{c.experience_years} yrs</td><td>{c.location}</td><td><span className={`status ${c.stage.toLowerCase()}`}>{c.stage}</span></td></tr>)}</tbody></table></div></div>
   <div className="ai-strip"><div className="ai-icon"><i className="bi bi-stars"/></div><div><div className="ai-title">AI Hiring Copilot <span>Preview</span></div><div className="ai-copy">Ask questions like <b>“Which Data Analyst candidates are strongest for the current opening?”</b> and get explainable recommendations from your recruitment data.</div></div><button className="btn btn-light ms-auto" onClick={()=>onNavigate?.('AI Insights')}>Explore AI <i className="bi bi-arrow-up-right ms-1"/></button></div>
   </>}
   {showJob&&<ActionModal title="Create a new job" subtitle="Add a role to your live recruitment database." onClose={()=>setShowJob(false)} footer={<><button className="btn btn-outline-soft" onClick={()=>setShowJob(false)}>Cancel</button><button form="dashboard-job-form" className="btn btn-primary-custom" disabled={saving}>{saving?'Creating…':'Create job'}</button></>}>
    <form id="dashboard-job-form" onSubmit={saveJob} className="vstack gap-3"><div><label className="form-label">Job title</label><input className="form-control" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Data Scientist"/></div><div className="row g-3"><div className="col-md-6"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/></div><div className="col-md-6"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div></div><div><label className="form-label">Openings</label><input type="number" min="1" className="form-control" value={form.openings} onChange={e=>setForm({...form,openings:e.target.value})}/></div></form>
   </ActionModal>}
 </>
}
