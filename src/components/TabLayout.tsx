import { Navigate, Outlet } from 'react-router'
import { needsLogin, useAuth, useAuthError } from '../state/auth'
import { useProfileLoadedFor } from '../state/profileSync'
import { useProfile } from '../state/profile'
import { TabBar } from './TabBar/TabBar'

export function TabLayout() {
  const profile = useProfile()
  const auth = useAuth()
  const loadedFor = useProfileLoadedFor()
  const authError = useAuthError()
  if (auth.status === 'loading') return null
  if (authError && auth.status !== 'signedIn') return <Navigate to="/account?from=onboarding" replace />
  // Signed in: wait for their saved profile before deciding they still need onboarding.
  if (auth.status === 'signedIn' && loadedFor !== auth.userId) return null
  if (!profile.onboarded) return <Navigate to="/welcome" replace />
  // After the trial level call, a login is required to keep going.
  if (needsLogin(auth)) return <Navigate to="/account?from=onboarding" replace />
  return (
    <>
      <main style={{ paddingBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <TabBar />
    </>
  )
}
