import { Navigate, Outlet } from 'react-router'
import { useProfile } from '../state/profile'
import { TabBar } from './TabBar/TabBar'

export function TabLayout() {
  const profile = useProfile()
  if (!profile.onboarded) return <Navigate to="/welcome" replace />
  return (
    <>
      <main style={{ paddingBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <TabBar />
    </>
  )
}
