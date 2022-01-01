/* eslint-disable import/prefer-default-export */
import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, ReactNode } from 'react'
import dayjs from 'dayjs'
import Web3 from 'web3'
import { getClient, Exchange } from '../apollo/client'
import { getBlock, getPercentChange } from '../utils/index'
import { ETH_PRICE } from '../apollo/queries'
import { aggregatorV3InterfaceABI, INFURA_API1, CHAINLINK_JPY_ADDR } from '../constants'

const ETH_PRICE_KEY = 'ETH_PRICE_KEY'
const ETH_ONE_DAY_PRICE_KEY = 'ETH_ONEDAY_PRICE_KEY'
const ETH_PRICE_CHANGE_KEY = 'ETH_CHANGE_KEY'
const JPYUSD_KEY = 'JPYUSD_KEY'

const web3 = new Web3(INFURA_API1)

const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, CHAINLINK_JPY_ADDR)
interface ProviderType {
  children: ReactNode
}

enum ActionType {
  UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE',
  UPDATE_JPYUSD_PRICE = 'UPDATE_JPYUSD_PRICE',
}

type Action = {
  type: ActionType
  payload: any
}

type State = {
  [key: string]: number
}

const initialGlobalData = {
  [ETH_PRICE_KEY]: 0,
  [ETH_ONE_DAY_PRICE_KEY]: 0,
  [ETH_PRICE_CHANGE_KEY]: 0,
  [JPYUSD_KEY]: 0,
}

const GlobalDataContext = createContext({} as any)

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

async function getJPYUSDPrice() {
  let d
  try {
    d = await priceFeed.methods.latestRoundData().call()
  } catch (e) {
    console.error('Failed to get JPYUSD')
    return 0
  }
  return d
}

export function useJPYUSDPrice() {
  const [state, { updateJPYUSDPrice }]: any = useGlobalDataContext()
  const price = state?.[JPYUSD_KEY]

  useEffect(() => {
    async function checkForJPYUSDPrice() {
      if (!price) {
        const p = await getJPYUSDPrice()
        updateJPYUSDPrice(p.answer)
      }
    }
    checkForJPYUSDPrice()
  }, [])

  return price
}

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
async function getEthPrice(exchange: Exchange) {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const client = getClient(exchange)

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    const oneDayBlock = await getBlock(utcOneDayBack, exchange)
    const result = await client.query({
      query: ETH_PRICE(),
      fetchPolicy: 'cache-first',
    })
    const resultOneDay = await client.query({
      query: ETH_PRICE(oneDayBlock),
      fetchPolicy: 'cache-first',
    })
    const currentPrice = result?.data?.bundles[0]?.ethPrice
    const oneDayBackPrice = resultOneDay?.data?.bundles[0]?.ethPrice
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

export function useEthPrice(_exchange: Exchange): [ethPrice: number, ethPriceOld: number] {
  const [state, { updateEthPrice }]: any = useGlobalDataContext()
  const ethPrice = state?.[ETH_PRICE_KEY]
  const ethPriceOld = state?.[ETH_ONE_DAY_PRICE_KEY]

  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        const [newPrice, oneDayPrice, priceChange] = await getEthPrice(_exchange)
        updateEthPrice(newPrice, oneDayPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [])

  return [ethPrice, ethPriceOld]
}

function reducer(state: State, { type, payload }: any) {
  switch (type) {
    case ActionType.UPDATE_ETH_PRICE: {
      const { ethPrice, oneDayPrice, ethPriceChange } = payload
      return {
        ...state,
        [ETH_PRICE_KEY]: ethPrice,
        [ETH_ONE_DAY_PRICE_KEY]: oneDayPrice,
        [ETH_PRICE_CHANGE_KEY]: ethPriceChange,
      }
    }

    case ActionType.UPDATE_JPYUSD_PRICE: {
      const { price } = payload
      return {
        ...state,
        [JPYUSD_KEY]: price,
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }: ProviderType) {
  const [state, dispatch] = useReducer(reducer, initialGlobalData)

  const updateEthPrice = useCallback((ethPrice, oneDayPrice, ethPriceChange) => {
    dispatch({
      type: ActionType.UPDATE_ETH_PRICE,
      payload: {
        ethPrice,
        oneDayPrice,
        ethPriceChange,
      },
    })
  }, [])

  const updateJPYUSDPrice = useCallback((price) => {
    dispatch({
      type: ActionType.UPDATE_JPYUSD_PRICE,
      payload: {
        price,
      },
    })
  }, [])

  return (
    <GlobalDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            updateEthPrice,
            updateJPYUSDPrice,
          },
        ],
        [state, updateEthPrice, updateJPYUSDPrice]
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}
