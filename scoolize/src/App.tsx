import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Layout from './components/Layout/Layout'
import { Login } from './components/Auth/Login'
import { Register } from './components/Auth/Register'
import { HomePage } from './pages/HomePage'
import { StudentPage } from './pages/StudentPage'
import { SchoolPage } from './pages/SchoolPage'
import { Profile } from './types'

function ProtectedRoute({
  user,
  profile,
  children
}: {
  user: any;
  profile: Profile | null;
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login', { replace: true })
    }
  }, [user, navigate, location])

  if (!user) {
    return null
  }

  return <>{children}</>
}

function AuthRedirect({ user }: { user: any }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate, location])

  return null
}

function AppRoutes() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data && !error) {
      setProfile(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Chargement...
      </div>
    )
  }

  return (
    <Layout userEmail={user?.email} profile={profile}>
      <AuthRedirect user={user} />
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} profile={profile}>
              {profile?.role === 'student' ? (
                <StudentPage userId={user.id} />
              ) : profile?.role === 'school' ? (
                <SchoolPage userId={user.id} />
              ) : (
                <div style={{ padding: '20px' }}>
                  <h1>Profil incomplet</h1>
                  <p>Votre profil n'a pas de rôle défini.</p>
                </div>
              )}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
