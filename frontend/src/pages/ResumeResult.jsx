import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import Footer from '../components/Footer'

const ResumeResult = () => {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [atsResult, setAtsResult] = useState('')
  const [atsLoading, setAtsLoading] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()

  const fetchResume = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/${id}`, {
        method: "GET",
        headers: { "token": localStorage.getItem('token') }
      })
      const data = await response.json()
      if (data.success) {
        setResume(data.resume)
        if (data.resume.atsAnalysis) setAtsResult(data.resume.atsAnalysis)
      }
    } catch (error) {
      console.error("Error fetching resume:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/${id}/analyze`, {
        method: "POST",
        headers: { "token": localStorage.getItem('token') }
      })
      const data = await response.json()
      if (data.success) fetchResume()
    } catch (error) {
      console.error("Error analyzing resume:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAtsCheck = async () => {
    if (!jobDescription) {
      alert("Please enter job description")
      return
    }
    setAtsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/${id}/ats-check`, {
        method: "POST",
        headers: {
          "token": localStorage.getItem('token'),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ job_description: jobDescription })
      })
      const data = await response.json()
      if (data.success) setAtsResult(data.analysis)
    } catch (error) {
      console.error("ATS check error:", error)
    } finally {
      setAtsLoading(false)
    }
  }

  useEffect(() => {
    fetchResume()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <p className="text-gray-400 text-sm sm:text-base">Loading...</p>
    </div>
  )

  if (!resume) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <p className="text-gray-400 text-sm sm:text-base">Resume not found</p>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Resume Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold break-words">{resume.originalName}</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Uploaded on {new Date(resume.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
                {' · '}
                {(resume.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {resume.isAnalyzed ? (
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  Analyzed
                </span>
              ) : resume.pdf_content ? (
                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  Parsed
                </span>
              ) : (
                <span className="bg-gray-500/10 text-gray-400 border border-gray-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  Not Parsed
                </span>
              )}
            </div>
          </div>

          {/* Analysis Section */}
          {resume.isAnalyzed ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                <span className="w-6 h-6 shrink-0 bg-blue-600 rounded flex items-center justify-center text-xs">AI</span>
                AI Analysis
              </h2>
              <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none">
                <ReactMarkdown>{resume.aiAnalysis}</ReactMarkdown>
              </div>
            </div>
          ) : resume.pdf_content ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-gray-400 text-sm mb-6">Resume has been parsed. Click below to get AI feedback.</p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : "Analyze with AI"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center mb-4 sm:mb-6">
              <p className="text-gray-400 mb-2 text-sm sm:text-base">Resume not parsed yet</p>
              <p className="text-gray-600 text-xs sm:text-sm">Go back to dashboard and parse the resume first</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white text-sm px-6 py-2.5 sm:py-2 rounded-lg transition"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* ATS Check Section */}
          {resume.isAnalyzed && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 shrink-0 bg-purple-600 rounded flex items-center justify-center text-xs">ATS</span>
                ATS Compatibility Check
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-4">Paste the job description to check how well your resume matches</p>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                rows={5}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-purple-500 transition placeholder-gray-600 resize-none mb-4"
              />

              <button
                onClick={handleAtsCheck}
                disabled={atsLoading || !jobDescription}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 sm:py-2.5 rounded-lg transition"
              >
                {atsLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Checking...
                  </span>
                ) : "Check ATS Score"}
              </button>

              {atsResult && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">ATS Analysis Result</h3>
                  <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none">
                    <ReactMarkdown>{atsResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ResumeResult
