import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import InvitePage from './pages/InvitePage'
import BoothPage from './pages/BoothPage'
import PrintPage from './pages/PrintPage'
import FinalPage from './pages/FinalPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/booth/:roomId" element={<BoothPage />} />
        <Route path="/print/:roomId" element={<PrintPage />} />
        <Route path="/final" element={<FinalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}