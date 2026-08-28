import {useEffect,useState} from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import Interviews from './pages/Interviews'
import Analytics from './pages/Analytics'
import ResumeIntelligence from './pages/ResumeIntelligence'
import AIInsights from './pages/AIInsights'
import Login from './pages/Login'
import {getDashboard,getMe} from './services/api'

const pages={Dashboard,Candidates,Jobs,Applications,Interviews,Analytics,'Resume Intelligence':ResumeIntelligence,'AI Insights':AIInsights}

export default function App(){
 const [user,setUser]=useState(null); const [ready,setReady]=useState(false); const [active,setActive]=useState('Dashboard'); const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
 useEffect(()=>{
   const token=localStorage.getItem('hiresense_token')
   if(!token){setReady(true);setLoading(false);return}
   getMe().then(setUser).catch(()=>localStorage.removeItem('hiresense_token')).finally(()=>{setReady(true);setLoading(false)})
 },[])
 useEffect(()=>{
   if(!user) return
   setLoading(true); setError('')
   getDashboard().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))
 },[user])
 function handleLogin(nextUser){setUser(nextUser);setActive('Dashboard')}
 function logout(){localStorage.removeItem('hiresense_token');setUser(null);setData(null)}
 if(!ready) return <div className="auth-loading"><div className="spinner-border"/></div>
 if(!user) return <Login onLogin={handleLogin}/>
 const Page=pages[active]||Dashboard
 return <div className="app-shell"><Sidebar active={active} setActive={setActive} onLogout={logout}/><main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><i className="bi bi-chevron-right"/><strong>{active}</strong></div><div className="top-actions"><button className="icon-btn"><i className="bi bi-search"/></button><button className="icon-btn position-relative"><i className="bi bi-bell"/><span className="notification-dot"/></button><div className="user-chip"><div className="avatar">{user.name?.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{user.name}</strong><small>{user.role}</small></div><i className="bi bi-chevron-down"/></div></div></header><section className="content-wrap">{error&&<div className="alert alert-warning">{error}</div>}<Page data={data} loading={loading}/></section></main></div>
}
