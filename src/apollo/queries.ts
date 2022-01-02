/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag'
import { BUNDLE_ID } from '../constants'
import { Exchange } from './client'

// interface TokenFields {
//   id: string
//   symbol: string
//   name: string
//   derivedETH: string
//   volumeUSD: string
//   volume: string
//   txCount: string
//   totalValueLocked: string
//   totalValueLockedUSD: string
// }

export const GET_POOL_USDC_JPYC = gql`
  query {
    pool(id: "0x98349e1689538fd878646b77b3dcd89040a35eb6") {
      token0Price
      token1Price
    }
  }
`

export const GET_LATEST_BLOCK = gql`
  query {
    blocks(first: 1, skip: 0, orderBy: number, orderDirection: desc, where: { number_gt: 9300000 }) {
      id
      number
      timestamp
      author
      difficulty
      gasUsed
      gasLimit
    }
  }
`

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`

export const ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(first: 500, skip: $skip) {
      id
      name
      symbol
    }
  }
`
const TokenFieldsUniV3 = `
  fragment TokenFields on Token {
    id
    name
    symbol
    volume
    volumeUSD
    derivedETH
    untrackedVolumeUSD
    totalValueLocked
    totalValueLockedUSD
  }
`

const TokenFieldsQuick06 = `
  fragment TokenFields on Token {
    id
    name
    symbol
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    whitelist
    totalLiquidity
    derivedETH
  }
`

const TokenFieldsSushiMatic = `
  fragment TokenFields on Token {
    id
    name
    symbol
    volume
    volumeUSD
    untrackedVolumeUSD
    liquidity
    derivedETH
  }
`

export const TOKEN_CHART = gql`
  query tokenDayDatas($tokenAddr: String!, $skip: Int!) {
    tokenDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { token: $tokenAddr }) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`

function getTokenFields(exchange: Exchange) {
  switch (exchange) {
    case 'UNIV3':
      return TokenFieldsUniV3
    case 'QUICK':
      return TokenFieldsQuick06
    case 'SUSHI':
      return TokenFieldsSushiMatic
    default:
      throw Error('There is no exchange')
  }
}

export const TOKEN_DATA = (tokenAddress: string, block: number | null, exchange: Exchange) => {
  const TokenFields = getTokenFields(exchange)
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_ALL_DAY_DATAS = (address: string, exchange: Exchange) => {
  const isV3 = exchange === 'UNIV3'
  const isSUSHI = exchange === 'SUSHI'
  const TokenDayDataFields = `
    fragment TokenDayDataFields on TokenDayData {
      date
      ${isV3 || isSUSHI ? 'volumeUSD' : 'dailyVolumeUSD'}
      ${isV3 ? 'totalValueLockedUSD' : isSUSHI ? 'liquidityUSD' :'totalLiquidityUSD'}
      priceUSD
    }
  `
  const queryString = `
    ${TokenDayDataFields}
    query tokenDayDatas {
      tokenDayDatas(first: 1000, orderBy: date, orderDirection: asc, where: {token: "${address}"}) {
        ...TokenDayDataFields
      }
    }
  `
  return gql(queryString)
}

export const ETH_PRICE = (block: number | void) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `
  return gql(queryString)
}
