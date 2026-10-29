import { StyleProvider } from '@ant-design/cssinjs'
import { App as AntApp, ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import { getConfigError } from '@/config/env'
import { ConfigErrorScreen } from '@/components/feedback/ConfigErrorScreen'
import { router } from '@/routes/router'
import { theme } from '@/styles/theme'

const configError = getConfigError()

export default function App() {
  if (configError) return <ConfigErrorScreen message={configError} />

  return (
    <Provider store={store}>
      <StyleProvider layer>
        <ConfigProvider theme={theme}>
          <AntApp>
            <RouterProvider router={router} />
            <Toaster position="top-right" closeButton />
          </AntApp>
        </ConfigProvider>
      </StyleProvider>
    </Provider>
  )
}
