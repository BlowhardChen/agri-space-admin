import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/layouts'
import Login from '@/views/login'
import Home from '@/views/home'
import NotFound from '@/views/not-found'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '*',
    element: <NotFound />
  }
])

export default router
