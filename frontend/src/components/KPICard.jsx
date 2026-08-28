export default function KPICard({label,value,delta,icon,muted=false}){
 return <div className="kpi-card"><div className="d-flex justify-content-between align-items-start"><div><div className="kpi-label">{label}</div><div className="kpi-value">{value}</div></div><div className="kpi-icon"><i className={`bi ${icon}`}/></div></div><div className={`kpi-delta ${muted?'muted':''}`}><span>{delta}</span></div></div>
}
