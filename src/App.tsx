import React, { Suspense, useState, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { disableFragmentWarnings } from 'graphql-tag'
import ReactSimplePullToRefresh from 'react-simple-pull-to-refresh'
import Home from './pages/Home'
import About from './pages/About'
import { LocalLoader } from './components/Loader'
import { HideMedium, OnlyMedium } from './theme'
import TopBar from './components/Header/TopBar'
import Header from './components/Header'
import TopMobileBar from './components/Header/TopMobileBar'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  width: 100%;
  position: fixed;
  justify-content: space-between;
  z-index: 2;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 40px;
  margin-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-top: 2rem;
    margin-top: 100px;
  `};

  z-index: 1;

  > * {
    max-width: 1200px;
  }
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function App() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 700)
  }, [])

  disableFragmentWarnings()

  // TODO: get subgraph status and display warning when its down
  return (
    <Suspense fallback={null}>
      {loading ? (
        <LocalLoader fill />
      ) : (
        <AppWrapper>
          <HeaderWrapper>
            <HideMedium>
              <TopBar />
            </HideMedium>
            <OnlyMedium>
              <TopMobileBar />
            </OnlyMedium>
            <Header />
          </HeaderWrapper>
          <ReactSimplePullToRefresh onRefresh={async ()=>{window.location.reload()}}>
            <BodyWrapper>
              <Switch>
                <Route exact strict path="/" component={Home} />
                <Route exact strict path="/about" component={About} />
              </Switch>
              <Marginer />
            </BodyWrapper>
          </ReactSimplePullToRefresh>
        </AppWrapper>
      )}
    </Suspense>
  )
}

export default App
