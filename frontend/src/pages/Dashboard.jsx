import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const Dashboard = () => {
  const [resumes, setResumes] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchResumes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/my-resumes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": localStorage.getItem('token')
        },
      })
      const data = await response.json()
      if (data.success) {
        setResumes(data.resumes)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Please select a file to upload.")
      return
    }
    const formData = new FormData()
    formData.append("resume", file)
    setUploading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/upload`, {
        method: "POST",
        headers: { "token": localStorage.getItem('token') },
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        setFile(null)
        fetchResumes()
      }
    } catch (error) {
      console.error("Error uploading resume:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleParse = async (id) => {
    setParsing(id)
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/${id}/parse`, {
        method: "POST",
        headers: { "token": localStorage.getItem('token') }
      })
      const data = await response.json()
      if (data.success) {
        fetchResumes()
      }
    } catch (error) {
      console.error("Error parsing resume:", error)
    } finally {
      setParsing(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this resume?")) return
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/resume/${id}`, {
        method: "DELETE",
        headers: { "token": localStorage.getItem('token') }
      })
      const data = await response.json()
      if (data.success) fetchResumes()
    } catch (error) {
      console.error("Error deleting resume:", error)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-blue-400">{user?.name}</span> 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Upload your resume and get AI-powered feedback</p>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-1">Upload Resume</h2>
            <p className="text-gray-400 text-sm mb-6">Upload your PDF resume to get AI-powered feedback</p>

            <form onSubmit={handleUpload} className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl px-6 py-5 transition text-center">
                  {file ? (
                    <p className="text-blue-400 text-sm font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-400 text-sm">Click to select PDF file</p>
                      <p className="text-gray-600 text-xs mt-1">Max size: 5MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <button
                type="submit"
                disabled={uploading || !file}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>

          {/* Resume List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">My Resumes</h2>

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
                <p className="text-gray-500">No resumes uploaded yet</p>
                <p className="text-gray-600 text-sm mt-1">Upload your first resume above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume._id} className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{resume.originalName}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(resume.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        {' · '}
                        {(resume.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {resume.isAnalyzed ? (
                        <button
                          onClick={() => navigate(`/resume/${resume._id}`)}
                          className="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                          View Analysis
                        </button>
                      ) : resume.pdf_content ? (
                        <button
                          onClick={() => navigate(`/resume/${resume._id}`)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                          Analyze
                        </button>
                      ) : (
                        <button
                          onClick={() => handleParse(resume._id)}
                          disabled={parsing === resume._id}
                          className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                          {parsing === resume._id ? "Parsing..." : "Parse"}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(resume._id)}
                        className="text-gray-500 hover:text-red-400 transition p-2 rounded-lg hover:bg-red-400/10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Dashboard
