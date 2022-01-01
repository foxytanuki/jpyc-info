import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, ReactNode } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { getClient, Exchange } from '../apollo/client'
import { TOKEN_ALL_DAY_DATAS } from '../apollo/queries'
import { JPYC_ADDRESS_ETH, JPYC_ADDRESS_POLYGON } from '../constants/index'

dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

export interface ChartData {
  date: number
  // volumeUSD?: number
  dailyVolumeUSD: number
  // totalValueLockedUSD?: number
  totalLiquidityUSD: number
  priceUSD: number
}

interface CombinedChartData extends ChartData {
  rawData: ChartData[]
}
interface ContextFunctions {
  update: Function
  updateCombined: Function
}

interface State {
  [key: string]: ChartData[] | CombinedChartData[]
}

interface Action<T extends string, P = undefined> {
  type: T
  payload: P
}

type Actions =
  | Action<'UPDATE', { tokenAddress: string; exchange: Exchange; data: ChartData[] }>
  | Action<'UPDATE_COMBINED', { data: ChartData[]; tokenAddress?: string; exchange?: Exchange }>

const UPDATE = 'UPDATE'
const UPDATE_COMBINED = 'UPDATE_COMBINED'

const ChartDataContext = createContext([{}, {}] as [State, ContextFunctions])

function useChartDataContext() {
  return useContext(ChartDataContext)
}

async function getChartData(address: string, exchange: Exchange) {
  const client = getClient(exchange)

  let data: {
    date: number
    volumeUSD?: string
    totalValueLockedUSD?: string
    dailyVolumeUSD?: string
    totalLiquidityUSD?: string
    priceUSD: string
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()
  const error = false

  try {
    const {
      data: chartResData,
      error,
      loading,
    } = await client.query({
      query: TOKEN_ALL_DAY_DATAS(address, exchange),
      fetchPolicy: 'cache-first',
    })
    if (chartResData) {
      data = data.concat(chartResData.tokenDayDatas)
    }
  } catch (e) {
    console.log(e)
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: ChartData }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      if (exchange === 'UNIV3' && dayData.volumeUSD && dayData.totalValueLockedUSD) {
        accum[roundedDate] = {
          date: dayData.date,
          dailyVolumeUSD: parseFloat(dayData.volumeUSD),
          totalLiquidityUSD: parseFloat(dayData.totalValueLockedUSD),
          priceUSD: parseFloat(dayData.priceUSD),
        }
      } else if (dayData.dailyVolumeUSD && dayData.totalLiquidityUSD) {
        accum[roundedDate] = {
          date: dayData.date,
          dailyVolumeUSD: parseFloat(dayData.dailyVolumeUSD),
          totalLiquidityUSD: parseFloat(dayData.totalLiquidityUSD),
          priceUSD: parseFloat(dayData.priceUSD),
        }
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalLiquidityUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          dailyVolumeUSD: 0,
          totalLiquidityUSD: latestTvl,
          priceUSD: 0,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalLiquidityUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => formattedExisting[parseInt(key)])

    return {
      data: dateMap,
      error: false,
    }
  }
  return {
    data: undefined,
    error,
  }
}

export async function useChartData(address: string, exchange: Exchange) {
  const [state, { update }]: [State, ContextFunctions] = useChartDataContext()
  const key = `${exchange}_${address}`
  const chartData = state?.[key]
  // const [error, setError] = useState(false)

  useEffect(() => {
    if (!chartData) {
      getChartData(address, exchange).then((data) => {
        if (data.data) update(address, exchange, data.data)
      })
    }
  }, [chartData, update])

  // return data
  return chartData
}

function combineChartData(chartDatas: ChartData[][]) {
  const [uniV3, quick] = chartDatas
  const len = Math.min(uniV3?.length, quick?.length)
  const maxLen = Math.max(uniV3?.length, quick?.length)

  const tmp: any = []
  let combinedChartData: CombinedChartData[] = []

  const getMaxLenData = (data: ChartData[], maxLen: number) => {
    if (data.length === maxLen) return true
    return false
  }

  try {
    const baseChartData = chartDatas.find((chart) => getMaxLenData(chart, maxLen))
    const startDate = baseChartData && baseChartData[0].date
    const endDate = baseChartData && baseChartData[baseChartData.length - 1].date
    const ONE_DAY = 86400
    const everyDayChart: ChartData[][] = []

    if (startDate && endDate) {
      for (let time = startDate; time <= endDate; time += ONE_DAY) {
        const dayChart: ChartData[] = chartDatas.map((chart) => {
          const data = chart.find((data) => data.date === time)
          if (!data) {
            return {
              date: time,
              dailyVolumeUSD: 0,
              totalLiquidityUSD: 0,
              priceUSD: 0,
            }
          }
          return data
        })
        everyDayChart.push(dayChart)
      }
    } else {
      throw new Error('no startDate or endDate')
    }

    let prevPrice = 0
    combinedChartData = everyDayChart.map((oneDayCharts) => {
      interface Combined extends CombinedChartData {
        pricedTotalLiquidityUSD?: number
      }

      const combined: Combined = {
        date: oneDayCharts[0].date,
        dailyVolumeUSD: 0,
        totalLiquidityUSD: 0,
        priceUSD: 0,
        pricedTotalLiquidityUSD: 0,
        rawData: [] as ChartData[],
      }

      oneDayCharts.forEach((oneDayChart) => {
        combined.dailyVolumeUSD += oneDayChart.dailyVolumeUSD
        combined.totalLiquidityUSD += oneDayChart.totalLiquidityUSD
        if (combined.pricedTotalLiquidityUSD !== undefined && oneDayChart.priceUSD > 0) {
          combined.pricedTotalLiquidityUSD += oneDayChart.totalLiquidityUSD
        }
        combined.rawData.push(oneDayChart)
      })

      oneDayCharts.forEach((oneDayChart) => {
        let rate = 1
        if (combined.pricedTotalLiquidityUSD !== undefined) {
          rate = oneDayChart.totalLiquidityUSD / combined.pricedTotalLiquidityUSD
        } else {
          rate = oneDayChart.totalLiquidityUSD / combined.totalLiquidityUSD
        }
        if (!Number.isNaN(rate) && rate !== 0 && oneDayChart.priceUSD !== 0) {
          combined.priceUSD += rate * oneDayChart.priceUSD
        }
      })
      delete combined.pricedTotalLiquidityUSD
      if (combined.priceUSD === 0) combined.priceUSD = prevPrice
      prevPrice = combined.priceUSD
      return combined
    })
  } catch (e) {
    console.error(e)
  }
  // Data on the first day is empty
  combinedChartData.shift()
  return combinedChartData
}

export function useCombinedChartData() {
  const [state, { updateCombined }]: [State, ContextFunctions] = useChartDataContext()
  const key = 'combined'
  const combinedChartData = state?.[key]

  useEffect(() => {
    async function fetchData() {
      const result = await Promise.all([
        getChartData(JPYC_ADDRESS_POLYGON, 'UNIV3'),
        getChartData(JPYC_ADDRESS_POLYGON, 'QUICK'),
      ])
      const datas = result.map((chartData) => {
        const { data } = chartData
        if (data) return data
        return []
      })
      const combined = combineChartData(datas)
      updateCombined(combined)
    }
    if (!combinedChartData) {
      fetchData()
    }
  }, [combinedChartData, updateCombined])

  // return data
  return combinedChartData
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
    case UPDATE_COMBINED: {
      const { data } = payload
      const key = 'combined'
      return {
        ...state,
        [key]: data,
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

  const updateCombined = useCallback((data) => {
    dispatch({
      type: UPDATE_COMBINED,
      payload: {
        data,
      },
    })
  }, [])

  const value: [State, ContextFunctions] = useMemo(
    () => [
      state,
      {
        update,
        updateCombined,
      },
    ],
    [state, update, updateCombined]
  )

  return <ChartDataContext.Provider value={value}>{children}</ChartDataContext.Provider>
}
