import {useEffect,useState} from 'react'
import Sidebar from './components/Sidebar'
import ActionModal from './components/ActionModal'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import Interviews from './pages/Interviews'
import Analytics from './pages/AnalyticsFunctional'
import ResumeIntelligence from './pages/ResumeIntelligence'
import AIInsights from './pages/AIInsights'
import Settings from './pages/Settings'
import Login from './pages/Login'
import {getDashboard,getMe} from './services/api'

const pages={Dashboard,Candidates,Jobs,Applications,Interviews,Analytics,'Resume Intelligence':ResumeIntelligence,'AI Insights':AIInsights,Settings}
export default function App(){
 const [user,setUser]=useState(null);const [ready,setReady]=useState(false);const [active,setActive]=useState('Dashboard');const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [modal,setModal]=useState(null);const [globalQuery,setGlobalQuery]=useState('')
 useEffect(()=>{const token=localStorage.getItem('hiresense_token');if(!token){setReady(true);setLoading(false);return}getMe().then(setUser).catch(()=>localStorage.removeItem('hiresense_token')).finally(()=>{setReady(true);setLoading(false)})},[])
 useEffect(()=>{if(!user)return;setLoading(true);setError('');getDashboard().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[user])
 function handleLogin(nextUser){setUser(nextUser);setActive('Dashboard')}
 function logout(){localStorage.removeItem('hiresense_token');setUser(null);setData(null)}
 function navigate(page){setActive(page);setModal(null)}
 function refreshDashboard(){if(user)getDashboard().then(setData).catch(e=>setError(e.message))}
 function runGlobalSearch(e){e.preventDefault();const q=globalQuery.trim().toLowerCase();if(q.includes('candidate')||q.includes('resume'))navigate('Candidates');else if(q.includes('job')||q.includes('role'))navigate('Jobs');else if(q.includes('application')||q.includes('pipeline'))navigate('Applications');else if(q.includes('interview'))navigate('Interviews');else if(q.includes('analytic'))navigate('Analytics');else if(q.includes('ai')||q.includes('copilot'))navigate('AI Insights');else setModal('search')}
 if(!ready)return <div className="auth-loading"><div className="spinner-border"/></div>
 if(!user)return <Login onLogin={handleLogin}/>
 const Page=pages[active]||Dashboard
 return <div className="app-shell"><Sidebar active={active} setActive={navigate} onLogout={logout}/><main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><i className="bi bi-chevron-right"/><strong>{active}</strong></div><div className="top-actions"><button className="icon-btn" onClick={()=>setModal('search')} title="Global search"><i className="bi bi-search"/></button><button className="icon-btn position-relative" onClick={()=>setModal('notifications')} title="Notifications"><i className="bi bi-bell"/><span className="notification-dot"/></button><button className="user-chip user-chip-button" onClick={()=>setModal('profile')}><div className="avatar">{user.name?.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{user.name}</strong><small>{user.role}</small></div><i className="bi bi-chevron-down"/></button></div></header><section className="content-wrap">{error&&<div className="alert alert-warning">{error}</div>}<Page data={data} loading={loading} user={user} onNavigate={navigate} onRefresh={refreshDashboard}/></section></main>
 {modal==='search'&&<ActionModal title="Search HireSense" subtitle="Jump directly to a recruiter workspace." onClose={()=>setModal(null)}><form onSubmit={runGlobalSearch} className="d-flex gap-2"><input autoFocus className="form-control" value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)} placeholder="Try candidates, jobs, interviews, analytics…"/><button className="btn btn-primary-custom">Search</button></form><div className="suggestion-list mt-3">{['Candidates','Jobs','Applications','Interviews','Analytics','AI Insights'].map(x=><button key={x} onClick={()=>navigate(x)}>{x}<i className="bi bi-arrow-right"/></button>)}</div></ActionModal>}
 {modal==='notifications'&&<ActionModal title="Notifications" subtitle="Recent recruitment activity." onClose={()=>setModal(null)}><div className="vstack gap-2"><div className="mini-stat"><strong>6 interviews on record</strong><span>Review your upcoming schedule.</span></div><div className="mini-stat"><strong>24 candidates in pipeline</strong><span>Top matches are ready for review.</span></div><div className="mini-stat"><strong>Resume intelligence available</strong><span>Upload resumes to calculate explainable job matches.</span></div></div></ActionModal>}
 {modal==='profile'&&<ActionModal title="Recruiter account" subtitle="Your active HireSense session." onClose={()=>setModal(null)} footer={<><button className="btn btn-outline-soft" onClick={()=>navigate('Settings')}>Settings</button><button className="btn btn-primary-custom" onClick={logout}>Sign out</button></>}><div className="fit-grid"><div><span>Name</span><b>{user.name}</b></div><div><span>Role</span><b>{user.role}</b></div><div><span>Email</span><b>{user.email}</b></div><div><span>Status</span><b>Authenticated</b></div></div></ActionModal>}
 </div>
}
