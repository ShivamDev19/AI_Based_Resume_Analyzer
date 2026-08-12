import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">ResumeAI</span>
        </div>

        <p className="text-gray-600 text-xs order-3 sm:order-none">
          © {new Date().getFullYear()} ResumeAI. Built with MERN + GROK AI.
        </p>

        <p className="text-gray-600 text-xs">
          Made by <span className="text-blue-400">Shivam Sonawane</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer
