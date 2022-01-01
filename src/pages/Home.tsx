import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { ThemedBackground, PageWrapper } from './styled'
import { Network, useCombinedTokenData } from '../contexts/CombinedTokenData'
import { JPYC_ADDRESS_ETH, JPYC_ADDRESS_POLYGON } from '../constants/index'
import { AutoColumn } from '../components/Column'
import { RowBetween, RowFixed, RowFlat } from '../components/Row'
import { TYPE } from '../theme'
import Percent from '../components/Percent'
import { formatDollarAmount } from '../utils/numbers'
import { useTokenData } from '../contexts/TokenData'
import CurrencyLogo from '../components/CurrencyLogo'
import DetailsCard from '../components/DetailsCard'

import { useCombinedChartData } from '../contexts/ChartData'
import TokenChartCard from '../components/TokenChartCard'

const PriceText = styled(TYPE.label)`
  font-size: 36px;
  line-height: 0.8;
`

const ContentLayout = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`

const DetailContentLayout = styled.div`
  margin-top: 16px;
  display: grid;
  // grid-template-columns: 260px 1fr;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 1em;

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
`
const ResponsiveRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`

function Home() {
  const uniV3 = useTokenData(JPYC_ADDRESS_POLYGON, 'UNIV3')
  const quick = useTokenData(JPYC_ADDRESS_POLYGON, 'QUICK')
  const all = useCombinedTokenData(Network.ALL)
  const tokenData = all

  const backgroundColor = '#ffffff'
  const address = JPYC_ADDRESS_ETH
  const chartData = useCombinedChartData()

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <AutoColumn gap="lg">
        <AutoColumn gap="40px">
          <TYPE.main>Overview</TYPE.main>
          <ResponsiveRow align="flex-end">
            <AutoColumn gap="md">
              <RowFixed gap="4px">
                <CurrencyLogo address={address} />
                <TYPE.label ml="12px" fontSize="20px">
                  JPY Coin
                </TYPE.label>
                <TYPE.main ml="12px" fontSize="20px">
                  JPYC
                </TYPE.main>
              </RowFixed>
              <RowFlat style={{ marginTop: '8px' }}>
                <PriceText mr="10px"> {formatDollarAmount(tokenData.priceUSD, 6)}</PriceText>
                (<Percent value={tokenData.priceChangeUSD} />)
              </RowFlat>
            </AutoColumn>
          </ResponsiveRow>
        </AutoColumn>
        <ContentLayout>
          <DetailsCard tokenData={tokenData} />
          <TokenChartCard chartData={chartData} tokenData={all} />
        </ContentLayout>
        <TYPE.main>Exchanges</TYPE.main>
        <DetailContentLayout>
          <DetailsCard exchange="UNIV3" tokenData={uniV3} />
          <DetailsCard exchange="QUICK" tokenData={quick} />
        </DetailContentLayout>
      </AutoColumn>
    </PageWrapper>
  )
}

export default Home
