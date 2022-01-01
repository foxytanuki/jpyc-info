import React from 'react'
import styled from 'styled-components'
import { Search, Repeat } from 'react-feather'
import { DarkGreyCard, LightGreyCard } from './Card'
import { AutoColumn } from './Column'
import { TYPE } from '../theme'
import Percent from './Percent'
import { TokenData } from '../contexts/TokenData'
import useTheme from '../contexts/Theme'
import { RowBetween, RowFlat } from './Row'
import { formatDollarAmount, formatYenAmount } from '../utils/numbers'
import { Exchange } from '../apollo/client'
import { ExternalLink as StyledExternalLink } from '../theme/components'
import { getAnalyticsLink, getSwapLink } from '../utils'

type PropType = {
  exchange?: Exchange
  tokenData: TokenData
}

function DetailsCard({ exchange, tokenData }: PropType) {
  const isV3 = exchange === 'UNIV3'
  const theme = useTheme()

  const exchangeColumn = exchange ? (
    <AutoColumn gap="4px">
      <RowBetween>
        <TYPE.main fontWeight={600}>{exchange}</TYPE.main>
        <RowFlat>
          <StyledExternalLink href={getAnalyticsLink(exchange)}>
            <Search stroke={theme.text3} size="18px" style={{ marginLeft: '12px' }} />
          </StyledExternalLink>
          <StyledExternalLink href={getSwapLink(exchange)}>
            <Repeat stroke={theme.text3} size="18px" style={{ marginLeft: '12px' }} />
          </StyledExternalLink>
        </RowFlat>
      </RowBetween>
    </AutoColumn>
  ) : (
    ''
  )

  const JPYCUSDColumn = exchange ? (
    <AutoColumn gap="4px">
      <TYPE.main fontWeight={400}>Price - JPYC/USDC</TYPE.main>
      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.priceUSD, 6)}</TYPE.label>
      <Percent value={tokenData.priceChangeUSD} />
    </AutoColumn>
  ) : (
    ''
  )

  const TotalLiquidity = (
    <AutoColumn gap="4px">
      <TYPE.main fontWeight={400}>{isV3 ? 'TVL' : 'Total Liquidity'}</TYPE.main>
      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.totalLiquidityUSD)}</TYPE.label>
      {exchange ? <Percent value={tokenData.liquidityChangeUSD} /> : ''}
    </AutoColumn>
  )

  const Volume24h = (
    <AutoColumn gap="4px">
      <TYPE.main fontWeight={400}>24h Trading Vol</TYPE.main>
      <TYPE.label fontSize="24px">{formatDollarAmount(tokenData.oneDayVolumeUSD)}</TYPE.label>
      {exchange ? <Percent value={tokenData.volumeChangeUSD} /> : ''}
    </AutoColumn>
  )

  return (
    <DarkGreyCard>
      <AutoColumn gap="lg">
        {exchangeColumn}
        {JPYCUSDColumn}
        <AutoColumn gap="4px">
          <TYPE.main fontWeight={400}>Price - USDC/JPYC</TYPE.main>
          <TYPE.label fontSize="24px">{formatYenAmount(1 / tokenData.priceUSD)}</TYPE.label>
          {exchange && <Percent value={tokenData.priceChangeJPYC} />}
        </AutoColumn>
        {TotalLiquidity}
        {Volume24h}
      </AutoColumn>
    </DarkGreyCard>
  )
}

export default DetailsCard
