import React from 'react'
import styled from 'styled-components'
import { TYPE, ExternalLink } from '../../theme'
import { useEthPrice, useJPYUSDPrice } from '../../contexts/GlobalData'
import { formatDollarAmount, formatYenAmount } from '../../utils/numbers'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import Polling from './Polling'

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.white};
  padding: 10px 20px;
`

const Item = styled(TYPE.main)`
  font-size: 12px;
`

const StyledLink = styled(ExternalLink)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const TopBar = () => {
  const [ethPrice] = useEthPrice('UNIV3')
  const jpyusdResult = useJPYUSDPrice()
  const jpyusdPrice = Number.parseFloat(`0.00${jpyusdResult}`)
  const usdjpyPrice = jpyusdPrice !== 0 ? 1 / jpyusdPrice : 0

  const jpyusdRow = (
    <RowFixed key="jpyusd">
      <Item>JPY/USD:</Item>
      <Item fontWeight="700" ml="4px">
        {formatDollarAmount(jpyusdPrice, 6)}
      </Item>
    </RowFixed>
  )

  const usdjpyRow = (
    <RowFixed key="usdjpy">
      <Item>USD/JPY:</Item>
      <Item fontWeight="700" ml="4px">
        {formatYenAmount(usdjpyPrice)}
      </Item>
    </RowFixed>
  )

  return (
    <Wrapper>
      <RowBetween>
        {/* <Polling /> */}
        <AutoRow gap="6px">
          <RowFixed key="ethprice">
            <Item>ETH Price:</Item>
            <Item fontWeight="700" ml="4px">
              {formatDollarAmount(ethPrice)}
            </Item>
          </RowFixed>
          {jpyusdPrice !== 0 && usdjpyPrice !== 0 ? [jpyusdRow, usdjpyRow] : ''}
        </AutoRow>
        <AutoRow gap="8px" style={{ justifyContent: 'flex-end' }}>
          <StyledLink href="https://jpyc.jp/">JPYC Official Website</StyledLink>
          <StyledLink href="https://app.jpyc.jp/">JPYC Apps</StyledLink>
          <StyledLink href="https://polygon.impermax.finance/lending-pool/0x205995421c72dc223f36bbfad78b66eea72d2677">
            Impermax JPYC Lending Pool
          </StyledLink>
        </AutoRow>
      </RowBetween>
    </Wrapper>
  )
}

export default TopBar
