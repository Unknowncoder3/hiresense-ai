import {useEffect,useState} from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import {getDashboard} from './services/api'

export default function App(){
 const [active,setActive]=useState('Dashboard'); const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{getDashboard().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[])
 return <div className="app-shell"><Sidebar active={active} setActive={setActive}/><main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><i className="bi bi-chevron-right"/><strong>{active}</strong></div><div className="top-actions"><button className="icon-btn"><i className="bi bi-search"/></button><button className="icon-btn position-relative"><i className="bi bi-bell"/><span className="notification-dot"/></button><div className="user-chip"><div className="avatar">SD</div><div><strong>Snehasish</strong><small>Recruiter</small></div><i className="bi bi-chevron-down"/></div></div></header><section className="content-wrap">{error?<div className="alert alert-warning">Backend unavailable: {error}. Start FastAPI on port 8000.</div>:active==='Dashboard'?<Dashboard data={data} loading={loading}/>:<div className="panel placeholder-page"><i className="bi bi-stars"/><h2>{active}</h2><p>This module is scaffolded for the next implementation phase.</p></div>}</section></main></div>
}
