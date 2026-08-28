const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'
export async function getDashboard(){
  const res = await fetch(`${API_BASE}/dashboard`)
  if(!res.ok) throw new Error(`API request failed: ${res.status}`)
  return res.json()
}
