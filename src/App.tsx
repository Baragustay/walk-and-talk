import { createBrowserRouter, RouterProvider } from 'react-router'
import { TabLayout } from './components/TabLayout'
import { Account } from './screens/Account/Account'
import { Call } from './screens/Call/Call'
import { Home } from './screens/Home/Home'
import { Me } from './screens/Me/Me'
import { AboutYou } from './screens/Onboarding/AboutYou'
import { HowItWorks } from './screens/Onboarding/HowItWorks'
import { Languages } from './screens/Onboarding/Languages'
import { LevelIntro } from './screens/Onboarding/LevelIntro'
import { LevelResult } from './screens/Onboarding/LevelResult'
import { MeetBuddy } from './screens/Onboarding/MeetBuddy'
import { Welcome } from './screens/Onboarding/Welcome'
import { Settings } from './screens/Settings/Settings'
import { Flashcards } from './screens/Words/Flashcards'
import { Words } from './screens/Words/Words'

const router = createBrowserRouter([
  // Full screen, no tab bar
  { path: '/welcome', element: <Welcome /> },
  { path: '/onboarding/about', element: <AboutYou /> },
  { path: '/onboarding/languages', element: <Languages /> },
  { path: '/onboarding/how', element: <HowItWorks /> },
  { path: '/onboarding/meet', element: <MeetBuddy /> },
  { path: '/onboarding/level', element: <LevelIntro /> },
  { path: '/onboarding/result', element: <LevelResult /> },
  { path: '/call', element: <Call /> },
  { path: '/account', element: <Account /> },
  { path: '/words/review', element: <Flashcards /> },
  // With tab bar (redirects to onboarding if not done)
  {
    element: <TabLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/words', element: <Words /> },
      { path: '/me', element: <Me /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <Home /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
