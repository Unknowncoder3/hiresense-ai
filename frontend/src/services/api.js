const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) {
    let detail = `API request failed: ${res.status}`
    try { const body = await res.json(); detail = body.detail || detail } catch (_) {}
    throw new Error(detail)
  }
  return res.json()
}

export function getDashboard() { return request('/dashboard') }
export function getCandidates(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value && value !== 'All'))
  return request(`/candidates${query.toString() ? `?${query}` : ''}`)
}
export function getJobs(params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value && value !== 'All'))
  return request(`/jobs${query.toString() ? `?${query}` : ''}`)
}
export function getApplications() { return request('/applications') }
export function getInterviews() { return request('/interviews') }
export function getAnalytics() { return request('/analytics') }

export async function uploadResume(candidateId, file) {
  const form = new FormData()
  form.append('file', file)
  return request(`/resume/upload/${candidateId}`, { method: 'POST', body: form })
}

export function getLatestResume(candidateId) { return request(`/resume/${candidateId}`) }
export function matchCandidate(candidateId, jobId) {
  return request(`/resume/match/${candidateId}/${jobId}`, { method: 'POST' })
}
