import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, ReactNode } from 'react'
import dayjs from 'dayjs'
import { JsxFlags } from 'typescript'
import { getClient, Exchange } from '../apollo/client'
import { GET_POOL_USDC_JPYC, TOKEN_DATA } from '../apollo/queries'
import { isAddress, getBlock, getPercentChange, get2DayPercentChange } from '../utils/index'
import { useEthPrice } from './GlobalData'

interface TokenRawDataBase {
  id: string
  name: string
  symbol: string
  untrackedVolumeUSD: string
  derivedETH: string
}

interface TokenRawDataUniV3 extends TokenRawDataBase {
  exchange: 'UNIV3'
  volume: string
  volumeUSD: string
  totalValueLocked: string
  totalValueLockedUSD: string
  untrackedVolumeUSD: string
}

interface TokenRawDataQuick06 extends TokenRawDataBase {
  exchange: 'QUICK'
  totalLiquidity: string
  tradeVolume: string
  tradeVolumeUSD: string
}

interface TokenRawDataSushi extends TokenRawDataBase {
  exchange: 'SUSHI'
  volume: string
  volumeUSD: string
  liquidity: string
  txCount: string
}

type TokenRawData = TokenRawDataUniV3 | TokenRawDataQuick06 | TokenRawDataSushi

export interface TokenData {
  priceUSD: number
  priceChangeUSD: number
  priceChangeJPYC: number
  totalLiquidityUSD: number
  oneDayVolumeUSD: number
  volumeChangeUSD: number
  oneDayVolumeUT: number
  volumeChangeUT: number
  liquidityChangeUSD: number
  // oneDayTxns: number
  // txnChange: number
}

type CallbackType = (tokenAddress: string, exchange: Exchange, data: TokenData) => void

interface ContextFunctions {
  update: CallbackType
}

interface State {
  [key: string]: TokenData
}

interface Action<T extends string, P = undefined> {
  type: T
  payload: P
}

type Actions = Action<'UPDATE', { tokenAddress: string; exchange: Exchange; data: TokenData }>

const UPDATE = 'UPDATE'

const TokenDataContext = createContext([{}, {}] as [State, ContextFunctions])

function useTokenDataContext() {
  return useContext(TokenDataContext)
}

function calucurateValues(
  ethPrice: number,
  ethPriceOld: number,
  rawData: TokenRawData,
  oneDayData: TokenRawData,
  twoDayData: TokenRawData
): TokenData {
  // calculate percentage changes and daily changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    parseFloat(
      rawData.exchange === 'SUSHI' || rawData.exchange === 'UNIV3' ? rawData.volumeUSD : rawData.tradeVolumeUSD
    ),
    parseFloat(
      oneDayData.exchange === 'SUSHI' || oneDayData.exchange === 'UNIV3'
        ? oneDayData?.volumeUSD
        : oneDayData?.tradeVolumeUSD
    ) ?? 0,
    parseFloat(
      twoDayData.exchange === 'SUSHI' || twoDayData.exchange === 'UNIV3'
        ? twoDayData?.volumeUSD
        : twoDayData?.tradeVolumeUSD
    ) ?? 0
  )

  // calculate percentage changes and daily changes
  const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange(
    parseFloat(rawData.untrackedVolumeUSD),
    parseFloat(oneDayData?.untrackedVolumeUSD) ?? 0,
    parseFloat(twoDayData?.untrackedVolumeUSD) ?? 0
  )

  // calculate percentage changes and daily changes
  // const [oneDayTxns, txnChange] = get2DayPercentChange(
  //   parseFloat(rawData.txCount),
  //   parseFloat(oneDayData?.txCount) ?? 0,
  //   parseFloat(twoDayData?.txCount) ?? 0
  // )

  const priceChangeUSD = getPercentChange(
    parseFloat(rawData?.derivedETH) * ethPrice,
    parseFloat(oneDayData?.derivedETH ?? 0) * ethPriceOld
  )
  const priceChangeJPYC = getPercentChange(
    1 / (parseFloat(rawData?.derivedETH) * ethPrice),
    1 / (parseFloat(oneDayData?.derivedETH ?? 0) * ethPriceOld)
  )

  let currentTotalLiquidity
  if (rawData.exchange === 'SUSHI') {
    currentTotalLiquidity = parseFloat(rawData?.liquidity)
  } else if (rawData.exchange === 'UNIV3') {
    currentTotalLiquidity = parseFloat(rawData?.totalValueLocked)
  } else {
    currentTotalLiquidity = parseFloat(rawData?.totalLiquidity)
  }

  let oldTotalLiquidity
  if (oneDayData.exchange === 'SUSHI') {
    oldTotalLiquidity = parseFloat(oneDayData?.liquidity)
  } else if (oneDayData.exchange === 'UNIV3') {
    oldTotalLiquidity = parseFloat(oneDayData?.totalValueLocked)
  } else {
    oldTotalLiquidity = parseFloat(oneDayData?.totalLiquidity)
  }

  const currentLiquidityUSD = currentTotalLiquidity * ethPrice * parseFloat(rawData?.derivedETH)
  const oldLiquidityUSD = oldTotalLiquidity * ethPriceOld * parseFloat(oneDayData?.derivedETH)

  // set data
  const priceUSD = parseFloat(rawData?.derivedETH) * ethPrice
  const liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)

  const data = {
    priceUSD,
    totalLiquidityUSD: currentLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    priceChangeUSD,
    priceChangeJPYC,
    oneDayVolumeUT,
    volumeChangeUT,
    liquidityChangeUSD,
    // oneDayTxns,
    // txnChange,
  }
  return data
}

async function getTokenData(
  address: string,
  ethPrice: number,
  ethPriceOld: number,
  exchange: Exchange
): Promise<TokenData | undefined> {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const oneDayBlock = await getBlock(utcOneDayBack, exchange)
  const twoDayBlock = await getBlock(utcTwoDaysBack, exchange)
  const client = getClient(exchange)

  try {
    // fetch all current and historical data
    const result = await client.query({
      query: TOKEN_DATA(address, null, exchange),
      fetchPolicy: 'cache-first',
    })
    const rawData: TokenRawData = {
      exchange,
      ...result?.data?.tokens?.[0],
    }

    // get results from 24 hours in past
    const oneDayResult = await client.query({
      query: TOKEN_DATA(address, oneDayBlock, exchange),
      fetchPolicy: 'cache-first',
    })
    const oneDayData: TokenRawData = {
      exchange,
      ...oneDayResult.data.tokens[0],
    }

    // get results from 48 hours in past
    const twoDayResult = await client.query({
      query: TOKEN_DATA(address, twoDayBlock, exchange),
      fetchPolicy: 'cache-first',
    })
    const twoDayData: TokenRawData = {
      exchange,
      ...twoDayResult.data.tokens[0],
    }

    const data = calucurateValues(ethPrice, ethPriceOld, rawData, oneDayData, twoDayData)

    if (exchange === 'UNIV3') {
      const client = getClient(exchange)
      const result = await client.query({
        query: GET_POOL_USDC_JPYC,
        fetchPolicy: 'cache-first',
      })
      const { token0Price } = result.data.pool
      data.priceUSD = token0Price
    }
    if (data.totalLiquidityUSD > 2059073682054) {
      data.totalLiquidityUSD = 0
    }

    return data
  } catch (e) {
    console.log(e)
  }
  return undefined
}

export function useTokenData(tokenAddress: string, exchange: Exchange): TokenData {
  const [state, { update }]: [State, ContextFunctions] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice(exchange)
  const key = `${exchange}_${tokenAddress}`
  const tokenData = state?.[key]

  useEffect(() => {
    if (!tokenData && ethPrice && ethPriceOld && isAddress(tokenAddress)) {
      getTokenData(tokenAddress, ethPrice, ethPriceOld, exchange).then((data) => {
        if (data) update(tokenAddress, exchange, data)
      })
    }
  }, [ethPrice, ethPriceOld, tokenAddress, tokenData, update])

  return tokenData || {}
}

function reducer(state: State, { type, payload }: Actions) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, exchange, data } = payload
      const key = `${exchange}_${tokenAddress}`
      return {
        ...state,
        [key]: {
          ...data,
        },
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((tokenAddress, exchange, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        exchange,
        data,
      },
    })
  }, [])
  const value: [State, ContextFunctions] = useMemo(
    () => [
      state,
      {
        update,
      },
    ],
    [state, update]
  )

  return <TokenDataContext.Provider value={value}>{children}</TokenDataContext.Provider>
}
