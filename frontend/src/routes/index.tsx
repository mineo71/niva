import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/auth/Login'
import { Signup } from '@/pages/auth/Signup'
import { Overview } from '@/pages/dashboard/Overview'
import { Fields } from '@/pages/dashboard/Fields'
import { FieldDetail } from '@/pages/dashboard/FieldDetail'
import { MapPage } from '@/pages/dashboard/Map'
import { SettingsPage } from '@/pages/dashboard/Settings'

export const router = createBrowserRouter([
  // Public landing
  {
    path: '/',
    element: <Landing />,
  },

  // Public auth routes (redirect away if already logged in)
  {
    element: <PublicRoute />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/signup', element: <Signup /> },
    ],
  },

  // Protected dashboard routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <Overview /> },
          { path: '/dashboard/fields', element: <Fields /> },
          { path: '/dashboard/fields/:id', element: <FieldDetail /> },
          { path: '/dashboard/map', element: <MapPage /> },
          { path: '/dashboard/map/:id', element: <MapPage /> },
          { path: '/dashboard/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
