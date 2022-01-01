import React, { ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { GA4R } from 'ga-4-react'
import App from './App'
import reportWebVitals from './reportWebVitals'
import GlobalDataProvider from './contexts/GlobalData'
import TokenDataProvider from './contexts/TokenData'
import CombinedTokenDataProvider from './contexts/CombinedTokenData'
import ChartDataProvider from './contexts/ChartData'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme'

function ContextProviders({ children }: { children: ReactNode }) {
  return (
    <GlobalDataProvider>
      <TokenDataProvider>
        <CombinedTokenDataProvider>
          <ChartDataProvider>{children}</ChartDataProvider>
        </CombinedTokenDataProvider>
      </TokenDataProvider>
    </GlobalDataProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <FixedGlobalStyle />
    <ContextProviders>
      <ThemeProvider>
        <ThemedGlobalStyle />
        <BrowserRouter>
          <GA4R code={process.env?.REACT_APP_GOOGLE_ANALYTICS_ID || ''}>
            <App />
          </GA4R>
        </BrowserRouter>
      </ThemeProvider>
    </ContextProviders>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
