import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import * as Tooltip from '@radix-ui/react-tooltip'
import { router } from './routes'
import 'react-toastify/dist/ReactToastify.css'

export function App() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable={false}
        theme="dark"
      />
    </Tooltip.Provider>
  )
}
