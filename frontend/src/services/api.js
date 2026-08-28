const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = localStorage.getItem('hiresense_token')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!(options.body instanceof FormData) && options.body !== undefined) headers.set('Content-Type', 'application/json')
  const res = await fetch(`${API_BASE}${path}`, {...options, headers})
  if (!res.ok) {
    let detail = `API request failed: ${res.status}`
    try { const body = await res.json(); detail = body.detail || detail } catch (_) {}
    if (res.status === 401) localStorage.removeItem('hiresense_token')
    throw new Error(detail)
  }
  return res.json()
}

export function login(email, password) { return request('/auth/login', {method:'POST', body: JSON.stringify({email, password})}) }
export function register(name, email, password) { return request('/auth/register', {method:'POST', body: JSON.stringify({name, email, password})}) }
export function getMe() { return request('/auth/me') }
export function getDashboard() { return request('/dashboard') }
export function getCandidates(params = {}) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value && value !== 'All')); return request(`/candidates${query.toString() ? `?${query}` : ''}`) }
export function getJobs(params = {}) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value && value !== 'All')); return request(`/jobs${query.toString() ? `?${query}` : ''}`) }
export function getApplications() { return request('/applications') }
export function getInterviews() { return request('/interviews') }
export function getAnalytics() { return request('/analytics') }
export async function uploadResume(candidateId, file) { const form = new FormData(); form.append('file', file); return request(`/resume/upload/${candidateId}`, {method:'POST', body:form}) }
export function getLatestResume(candidateId) { return request(`/resume/${candidateId}`) }
export function matchCandidate(candidateId, jobId) { return request(`/resume/match/${candidateId}/${jobId}`, {method:'POST'}) }
export function askCopilot(question) { return request('/ai/copilot', {method:'POST', body:JSON.stringify({question})}) }
