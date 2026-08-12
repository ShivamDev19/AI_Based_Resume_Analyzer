import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeResult from './pages/ResumeResult'
import History from './pages/History'
import ProtectedRoute from './components/ProtectedRoute'
import MockInterview from './pages/Mockinterview'
import Navbar from './components/Navbar'

// Protected pages pe Navbar show hoga
const ProtectedLayout = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
)

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout><Dashboard /></ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/resume/:id" element={
          <ProtectedRoute>
            <ProtectedLayout><ResumeResult /></ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <ProtectedLayout><History /></ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/mock-interview" element={
          <ProtectedRoute>
            <ProtectedLayout><MockInterview /></ProtectedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
