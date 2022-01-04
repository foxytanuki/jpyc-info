import { ethers } from 'ethers'
import { getBlockClient, Exchange } from '../apollo/client'
import { GET_BLOCK, GET_LATEST_BLOCK } from '../apollo/queries'

type ChainId = '1'

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
}

export const isAddress = (value: string) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export function getAnalyticsLink(exchange: Exchange): string {
  switch (exchange) {
    case 'UNIV3': {
      return 'https://info.uniswap.org/#/polygon/tokens/0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'
    }
    case 'QUICK': {
      return 'https://info.quickswap.exchange/#/token/0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'
    }
    case 'SUSHI': {
      return 'https://analytics-polygon.sushi.com/tokens/0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'
    }
    default: {
      return ''
    }
  }
}

export function getSwapLink(exchange: Exchange): string {
  switch (exchange) {
    case 'UNIV3': {
      return 'https://app.uniswap.org/#/swap?inputCurrency=0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'
    }
    case 'QUICK': {
      return 'https://quickswap.exchange/#/swap?inputCurrency=0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'
    }
    case 'SUSHI': {
      return 'https://app.sushi.com/swap?inputCurrency=0x6ae7dfc73e0dde2aa99ac063dcf7e8a63265108c'
    }
    default: {
      return ''
    }
  }
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export async function getBlock(timestamp: number, exchange: Exchange) {
  const blockClient = getBlockClient(exchange)
  const result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: 'cache-first',
  })
  const block = result?.data?.blocks?.[0]?.number
  return block
}

export const get2DayPercentChange = (valueNow: number, value24HoursAgo: number, value48HoursAgo: number) => {
  // get volume info for both 24 hour periods
  const currentChange: number = valueNow - value24HoursAgo
  const previousChange: number = value24HoursAgo - value48HoursAgo

  const adjustedPercentChange = ((currentChange - previousChange) / previousChange) * 100

  if (Number.isNaN(adjustedPercentChange) || !Number.isFinite(adjustedPercentChange)) {
    return [currentChange, 0]
  }
  return [currentChange, adjustedPercentChange]
}

export const getPercentChange = (valueNow: number, value24HoursAgo: number) => {
  const adjustedPercentChange = ((valueNow - value24HoursAgo) / value24HoursAgo) * 100
  if (Number.isNaN(adjustedPercentChange) || !Number.isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}
