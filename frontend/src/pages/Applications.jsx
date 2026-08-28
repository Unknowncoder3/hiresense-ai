import { useEffect, useMemo, useState } from 'react'
import { getApplications } from '../services/api'

const stageIcons={Applied:'bi-send',Screening:'bi-search',Shortlisted:'bi-person-check',Interview:'bi-calendar2-check',Offer:'bi-file-earmark-check',Hired:'bi-person-badge'}
const stageOrder=['Applied','Screening','Shortlisted','Interview','Offer','Hired']

export default function Applications(){
 const [apps,setApps]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{getApplications().then(d=>setApps(d.items||[])).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[])
 const stages=useMemo(()=>stageOrder.map(stage=>[stage,apps.filter(a=>a.stage===stage).length,stageIcons[stage]]),[apps])
 return <><div className="page-title-row"><div><div className="eyebrow">HIRING PIPELINE</div><h1>Applications</h1><p>Track candidate movement from application to offer.</p></div><button className="btn btn-primary-custom"><i className="bi bi-funnel me-2"/>Pipeline filters</button></div>
 {error&&<div className="alert alert-warning">Backend unavailable: {error}</div>}
 <div className="pipeline-row">{stages.map((s,i)=><div className="pipeline-stage" key={s[0]}><div className="pipeline-icon"><i className={`bi ${s[2]}`}/></div><span>{s[0]}</span><strong>{s[1].toLocaleString()}</strong>{i<stages.length-1&&<i className="bi bi-chevron-right pipeline-arrow"/>}</div>)}</div>
 <div className="panel mt-4"><div className="panel-head"><div><h3>Recent applications</h3><p>{loading?'Loading live applications...':'Latest candidate activity from PostgreSQL.'}</p></div><div className="d-flex gap-2"><button className="btn btn-outline-soft">All time</button><button className="btn btn-outline-soft"><i className="bi bi-download"/></button></div></div><div className="table-responsive"><table className="table align-middle candidate-table"><thead><tr><th>Candidate</th><th>Position</th><th>Match</th><th>Stage</th><th>Applied</th><th></th></tr></thead><tbody>{!loading&&apps.map(a=><tr key={a.id}><td><div className="candidate-name"><div className="avatar-sm">{a.candidate.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{a.candidate}</strong><small>APP-{String(a.id).padStart(4,'0')}</small></div></div></td><td>{a.role}</td><td><span className="match-pill">{a.match}%</span></td><td><span className={`status ${a.stage.toLowerCase()}`}>{a.stage}</span></td><td>{a.applied}</td><td><button className="icon-btn"><i className="bi bi-three-dots"/></button></td></tr>)}</tbody></table></div></div></>}
