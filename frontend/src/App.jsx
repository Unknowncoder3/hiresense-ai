import {useEffect,useState} from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import Interviews from './pages/Interviews'
import Analytics from './pages/Analytics'
import AIInsights from './pages/AIInsights'
import {getDashboard} from './services/api'

const pages={Dashboard,Candidates,Jobs,Applications,Interviews,Analytics,'AI Insights':AIInsights}
export default function App(){
 const [active,setActive]=useState('Dashboard'); const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{getDashboard().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[])
 const Page=pages[active]||Dashboard
 return <div className="app-shell"><Sidebar active={active} setActive={setActive}/><main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><i className="bi bi-chevron-right"/><strong>{active}</strong></div><div className="top-actions"><button className="icon-btn"><i className="bi bi-search"/></button><button className="icon-btn position-relative"><i className="bi bi-bell"/><span className="notification-dot"/></button><div className="user-chip"><div className="avatar">SD</div><div><strong>Snehasish</strong><small>Recruiter</small></div><i className="bi bi-chevron-down"/></div></div></header><section className="content-wrap">{error&&active==='Dashboard'&&<div className="alert alert-warning">Backend unavailable: {error}. Dashboard will show live data when FastAPI is running.</div>}<Page data={data} loading={loading}/></section></main></div>
}
