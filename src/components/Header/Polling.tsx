import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { TYPE, ExternalLink } from '../../theme'

// import { useSubgraphStatus } from '../../state/application/hooks'
import { getEtherscanLink } from '../../utils'
import useTheme from '../../contexts/Theme'

const StyledPolling = styled.div`
  display: flex;
  color: white;
  margin-right: 1rem;
  border-radius: 4px;
  width: 192px;
  padding: 4px;
  background-color: ${({ theme }) => theme.bg2};
  transition: opacity 0.25s ease;
  color: ${({ theme }) => theme.green1};
  :hover {
    opacity: 1;
  }
  z-index: 9999;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`
const StyledPollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-left: 0.4rem;
  margin-top: 3px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.green1};
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.green1};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  left: -3px;
  top: -3px;
`

export default function Polling() {
  const theme = useTheme()

  // const [status] = useSubgraphStatus()

  const [isMounted, setIsMounted] = useState(true)

  // const latestBlock = status.syncedBlock

  useEffect(
    () => {
      const timer1 = setTimeout(() => setIsMounted(true), 1000)

      // this will clear Timeout when component unmount like in willComponentUnmount
      return () => {
        setIsMounted(false)
        clearTimeout(timer1)
      }
    },
    // [status] // useEffect will run only one time
    []
    // if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
  )

  return (
    // <ExternalLink href={latestBlock ? getEtherscanLink(1, latestBlock.toString(), 'block') : ''}>
    <StyledPolling>
      {/* <TYPE.small mr="4px" color={theme.text3}>
          Latest synced block:{' '}
        </TYPE.small> */}
      {/* <TYPE.small style={{ opacity: isMounted ? '0.6' : '0.8' }}>{latestBlock}</TYPE.small> */}
      <StyledPollingDot>{!isMounted && <Spinner />}</StyledPollingDot>
    </StyledPolling>
    // </ExternalLink>
  )
}
