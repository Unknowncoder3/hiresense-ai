import { useEffect, useMemo, useRef, useState } from 'react'
import { getCandidates, getJobs, matchCandidate, uploadResume } from '../services/api'

export default function ResumeIntelligence() {
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [candidateId, setCandidateId] = useState('')
  const [jobId, setJobId] = useState('')
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    Promise.all([getCandidates(), getJobs()])
      .then(([candidateData, jobData]) => {
        setCandidates(candidateData.items || [])
        setJobs(jobData.items || [])
      })
      .catch(err => setError(err.message))
  }, [])

  const selectedCandidate = useMemo(() => candidates.find(c => String(c.id) === String(candidateId)), [candidates, candidateId])
  const selectedJob = useMemo(() => jobs.find(j => String(j.id).replace('JOB-', '') === String(jobId)), [jobs, jobId])

  async function handleUpload() {
    setError('')
    setMatch(null)
    if (!candidateId) return setError('Select a candidate first.')
    if (!file) return setError('Choose a PDF, DOCX, or TXT resume.')
    setLoading(true)
    try {
      const result = await uploadResume(candidateId, file)
      setParsed(result)
      const refreshed = await getCandidates()
      setCandidates(refreshed.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMatch() {
    setError('')
    if (!candidateId || !jobId) return setError('Select both a candidate and a target job.')
    setLoading(true)
    try {
      setMatch(await matchCandidate(candidateId, jobId))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <div className="page-title-row">
      <div><div className="eyebrow">AI TALENT INTELLIGENCE</div><h1>Resume Intelligence</h1><p>Turn an uploaded resume into structured skills, experience signals, and an explainable job match.</p></div>
      <span className="ai-badge"><i className="bi bi-stars me-1"/> AI-powered</span>
    </div>

    <div className="row g-4">
      <div className="col-xl-7">
        <div className="panel resume-upload-panel">
          <div className="panel-head"><div><h3>1. Upload & parse resume</h3><p>Supported: PDF, DOCX, TXT · max 8 MB</p></div></div>
          <div className="resume-controls">
            <div><label className="field-label">Candidate</label><select className="form-select" value={candidateId} onChange={e => setCandidateId(e.target.value)}><option value="">Choose candidate...</option>{candidates.map(c => <option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}</select></div>
            <div className="dropzone" onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files?.[0] || null) }}>
              <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
              <i className="bi bi-file-earmark-arrow-up"/>
              <strong>{file ? file.name : 'Drop resume here or click to browse'}</strong>
              <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : 'We extract text and skills; the original file is not stored.'}</span>
            </div>
          </div>
          {error && <div className="alert alert-warning mt-3 mb-0">{error}</div>}
          <button className="btn btn-primary-custom mt-3" onClick={handleUpload} disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"/>Processing...</> : <><i className="bi bi-magic me-2"/>Analyze resume</>}</button>
        </div>

        {parsed && <div className="panel mt-4">
          <div className="panel-head"><div><h3>Parsed resume</h3><p>{parsed.filename} · parsed {new Date(parsed.parsed_at).toLocaleString()}</p></div><span className="success-chip"><i className="bi bi-check2-circle me-1"/>Parsed</span></div>
          <div className="resume-summary-grid"><div><span>Skills detected</span><strong>{parsed.skills.length}</strong></div><div><span>Experience signal</span><strong>{parsed.extracted_experience_years || '—'} yrs</strong></div><div><span>Text extracted</span><strong>{parsed.text_preview?.length || 0}+ chars</strong></div></div>
          <div className="skill-chips large mt-3">{parsed.skills.map(s => <span key={s}>{s}</span>)}{parsed.skills.length === 0 && <span>No known skills detected</span>}</div>
          <div className="parsed-preview"><div className="eyebrow">TEXT PREVIEW</div><p>{parsed.text_preview}</p></div>
        </div>}
      </div>

      <div className="col-xl-5">
        <div className="panel match-panel">
          <div className="panel-head"><div><h3>2. Match to a job</h3><p>Explainable scoring from skills, experience, and semantic relevance.</p></div></div>
          <label className="field-label">Target job</label>
          <select className="form-select" value={jobId} onChange={e => setJobId(e.target.value)}><option value="">Choose open role...</option>{jobs.filter(j => j.status === 'Open').map(j => <option key={j.id} value={j.id.replace('JOB-', '')}>{j.title} · {j.location}</option>)}</select>
          {selectedCandidate && <div className="selected-profile"><div className="avatar-sm">{selectedCandidate.name.split(' ').map(x => x[0]).join('').slice(0,2)}</div><div><strong>{selectedCandidate.name}</strong><span>{selectedCandidate.experience} yrs · {selectedCandidate.location}</span></div></div>}
          <button className="btn btn-outline-soft w-100 mt-3" onClick={handleMatch} disabled={loading || !parsed}>{parsed ? <><i className="bi bi-stars me-2"/>Calculate AI match</> : 'Analyze a resume first'}</button>
          {!parsed && <div className="empty-match"><i className="bi bi-diagram-3"/><p>Upload a resume to unlock the candidate-job match breakdown.</p></div>}
          {match && <div className="match-result mt-4">
            <div className="match-score-row"><div><span>Match score</span><strong>{match.score}%</strong></div><div className="score-ring large"><div>{match.score}</div></div></div>
            <div className="recommendation"><i className="bi bi-lightbulb"/><div><strong>Recommendation</strong><p>{match.recommendation}</p></div></div>
            <div className="breakdown"><div><span>Skill match</span><b>{match.breakdown.skill_match}/70</b></div><div><span>Experience fit</span><b>{match.breakdown.experience_fit}/20</b></div><div><span>Semantic relevance</span><b>{match.breakdown.semantic_similarity}/10</b></div></div>
            <div className="row g-3 mt-1"><div className="col-sm-6"><h5>Matched skills</h5><div className="skill-chips">{match.matched_skills.map(s => <span key={s}>{s}</span>)}{!match.matched_skills.length && <span>None</span>}</div></div><div className="col-sm-6"><h5>Skill gaps</h5><div className="skill-chips gap">{match.skill_gaps.map(s => <span key={s}>{s}</span>)}{!match.skill_gaps.length && <span>None</span>}</div></div></div>
          </div>}
        </div>
      </div>
    </div>
  </>
}
