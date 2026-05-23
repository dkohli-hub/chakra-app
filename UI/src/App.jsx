import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage'
import KarmaKshetra from './components/dashboard/KarmaKshetra'
import { AuthProvider, useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <KarmaKshetra />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
