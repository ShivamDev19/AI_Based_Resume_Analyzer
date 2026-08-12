import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const analyzedhistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/analyzed-history`, {
        method: "GET",
        headers: { "token": localStorage.getItem('token') }
      })
      const data = await response.json()
      if (data.success) {
        setHistory(data.resumes)
      }
    } catch (error) {
      console.error("Error fetching analyzed history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    analyzedhistory()
  }, [])

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-gray-400 text-sm mt-1">All your previously analyzed resumes</p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500">No analyzed resumes yet</p>
              <p className="text-gray-600 text-sm mt-1">Upload and analyze a resume to see history</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((resume) => (
                <div
                  key={resume._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-5 flex items-center justify-between hover:border-gray-700 transition cursor-pointer"
                  onClick={() => navigate(`/resume/${resume._id}`)}
                >
                  <div>
                    <p className="font-medium text-white">{resume.originalName}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Analyzed on {new Date(resume.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium px-3 py-1 rounded-full">
                      Analyzed
                    </span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default History
