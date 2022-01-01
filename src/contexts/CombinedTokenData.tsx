import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, ReactNode } from 'react'
import { TokenData, useTokenData } from './TokenData'
import { JPYC_ADDRESS_ETH, JPYC_ADDRESS_POLYGON } from '../constants/index'

export enum Network {
  ALL = 'all',
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
}

interface PayloadType {
  network: Network
  data: any
}

type CallbackType = (network: Network, data: TokenData) => void

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

type Actions = Action<'UPDATE', { network: Network; data: TokenData }>

const UPDATE = 'UPDATE'

const CombinedTokenDataContext = createContext([{}, {}] as [State, ContextFunctions])

function useCombinedTokenDataContext() {
  return useContext(CombinedTokenDataContext)
}

function combineTokenDatas(datas: TokenData[]) {
  const combinedTokenData: TokenData = { ...datas[0] }

  for (let i = 1; i < datas.length; i += 1) {
    const data = datas[i]
    combinedTokenData.oneDayVolumeUSD += data.oneDayVolumeUSD
    combinedTokenData.oneDayVolumeUT += data.oneDayVolumeUT
    combinedTokenData.totalLiquidityUSD += data.totalLiquidityUSD
  }

  let price: number = 0
  let priceChangeUSD: number = 0
  let volumeChangeUSD: number = 0
  let volumeChangeUT: number = 0
  let liquidityChangeUSD: number = 0

  datas.forEach((data) => {
    const rate = data.totalLiquidityUSD / combinedTokenData.totalLiquidityUSD
    price += rate * data.priceUSD
    priceChangeUSD += rate * data.priceChangeUSD
    volumeChangeUSD += rate * data.volumeChangeUSD
    volumeChangeUT += rate * data.volumeChangeUT
    liquidityChangeUSD += rate * data.liquidityChangeUSD
  })

  combinedTokenData.priceUSD = price
  combinedTokenData.priceChangeUSD = priceChangeUSD
  combinedTokenData.volumeChangeUSD = volumeChangeUSD
  combinedTokenData.volumeChangeUT = volumeChangeUT
  combinedTokenData.liquidityChangeUSD = liquidityChangeUSD

  return combinedTokenData
}

async function getCombinedTokenData(tokenDatas: any): Promise<TokenData | undefined> {
  try {
    const result = combineTokenDatas(tokenDatas)
    return result
  } catch (e) {
    console.log(e)
  }
  return undefined
}

export function useCombinedTokenData(network: Network) {
  const [state, { update }]: [State, ContextFunctions] = useCombinedTokenDataContext()
  const combinedTokenData: TokenData = state?.[network]
  const uniV3 = useTokenData(JPYC_ADDRESS_POLYGON, 'UNIV3')
  const quick = useTokenData(JPYC_ADDRESS_POLYGON, 'QUICK')
  let tokenDatas: TokenData[] = []
  if (uniV3.priceUSD && quick.priceUSD) {
    tokenDatas = [uniV3, quick]
  } else if (quick.priceUSD) {
    tokenDatas = [quick]
  }

  useEffect(() => {
    if (!combinedTokenData && uniV3.priceUSD && quick.priceUSD) {
      getCombinedTokenData(tokenDatas).then((data) => {
        if (data) update(network, data)
      })
    }
  }, [uniV3, quick, network, update])

  return combinedTokenData || {}
}

function reducer(state: State, { type, payload }: Actions) {
  switch (type) {
    case UPDATE: {
      const { network, data } = payload
      return {
        ...state,
        [network]: {
          ...data,
        },
      }
    }
    default: {
      throw Error(`Unexpected action type in CombinedTokenDataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((network, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        network,
        data,
      },
    })
  }, [])

  return (
    <CombinedTokenDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
          },
        ],
        [state, update]
      )}
    >
      {children}
    </CombinedTokenDataContext.Provider>
  )
}
