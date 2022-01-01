import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { formatDollarAmount } from '../utils/numbers'
import LineChart from './LineChart/alt'
import BarChart from './BarChart/alt'
import CandleChart from './CandleChart'
import { AutoColumn } from './Column'
import { ChartData } from '../contexts/ChartData'
import { unixToDate } from '../utils/date'
import { DarkGreyCard } from './Card'
import { RowBetween, RowFixed } from './Row'

import { TYPE } from '../theme'
import { MonoSpace } from './shared'
import { ToggleWrapper, ToggleElementFree } from './Toggle'
import { TokenData } from '../contexts/TokenData'
import { LocalLoader } from './Loader'
import useTheme from '../contexts/Theme'

interface Props {
  chartData: ChartData[]
  tokenData: TokenData
}

enum ChartView {
  TVL,
  VOL,
  PRICE,
}

function TokenChartCard({ chartData, tokenData }: Props) {
  const [view, setView] = useState(ChartView.VOL)
  const [valueLabel, setValueLabel] = useState<string | undefined>()
  const [latestValue, setLatestValue] = useState<number | undefined>()
  const theme = useTheme()
  const backgroundColor = theme.blue1

  // format for chart component
  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => ({
        time: unixToDate(day.date),
        value: day.totalLiquidityUSD,
      }))
    }
    return []
  }, [chartData])
  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => ({
        time: unixToDate(day.date),
        value: day.dailyVolumeUSD,
      }))
    }
    return []
  }, [chartData])
  const formattedPriceData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => ({
        time: unixToDate(day.date),
        value: day.priceUSD,
      }))
    }
    return []
  }, [chartData])

  const adjustedToCurrent = false
  // const adjustedToCurrent = useMemo(() => {
  //   if (priceData && tokenData && priceData.length > 0) {
  //     const adjusted = Object.assign([], priceData)
  //     adjusted.push({
  //       time: currentTimestamp() / 1000,
  //       open: priceData[priceData.length - 1].close,
  //       close: tokenData?.priceUSD,
  //       high: tokenData?.priceUSD,
  //       low: priceData[priceData.length - 1].close,
  //     })
  //     return adjusted
  //   }
  //   return undefined
  // }, [priceData, tokenData])

  const Charts = (view: ChartView) => {
    switch (view) {
      case ChartView.TVL:
        return (
          <LineChart
            data={formattedTvlData}
            color={backgroundColor}
            minHeight={340}
            value={latestValue}
            label={valueLabel}
            setValue={setLatestValue}
            setLabel={setValueLabel}
          />
        )
      case ChartView.VOL:
        return (
          <BarChart
            data={formattedVolumeData}
            color={backgroundColor}
            minHeight={340}
            value={latestValue}
            label={valueLabel}
            setValue={setLatestValue}
            setLabel={setValueLabel}
          />
        )
      case ChartView.PRICE:
        return formattedPriceData ? (
          // <CandleChart
          //   data={adjustedToCurrent}
          //   setValue={setLatestValue}
          //   setLabel={setValueLabel}
          //   color={backgroundColor}
          // />
          <LineChart
            data={formattedPriceData}
            color={backgroundColor}
            minHeight={340}
            value={latestValue}
            label={valueLabel}
            setValue={setLatestValue}
            setLabel={setValueLabel}
          />
        ) : (
          <AutoColumn>
            <LocalLoader fill={false} />
          </AutoColumn>
        )
      default:
        return null
    }
  }

  return (
    <DarkGreyCard>
      <RowBetween align="flex-start">
        <AutoColumn>
          <RowFixed>
            <TYPE.label fontSize="24px" height="30px">
              <MonoSpace>
                {latestValue
                  ? formatDollarAmount(latestValue, 6)
                  : view === ChartView.VOL
                  ? formatDollarAmount(formattedVolumeData[formattedVolumeData.length - 1]?.value)
                  : view === ChartView.TVL
                  ? formatDollarAmount(formattedTvlData[formattedTvlData.length - 1]?.value)
                  : formatDollarAmount(tokenData.priceUSD, 6)}
              </MonoSpace>
            </TYPE.label>
          </RowFixed>
          <TYPE.main height="20px" fontSize="12px">
            {valueLabel ? (
              <MonoSpace>{valueLabel}</MonoSpace>
            ) : (
              <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
            )}
          </TYPE.main>
        </AutoColumn>
        <ToggleWrapper width="180px">
          <ToggleElementFree
            isActive={view === ChartView.VOL}
            fontSize="12px"
            onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
          >
            Volume
          </ToggleElementFree>
          <ToggleElementFree
            isActive={view === ChartView.TVL}
            fontSize="12px"
            onClick={() => (view === ChartView.TVL ? setView(ChartView.PRICE) : setView(ChartView.TVL))}
          >
            TVL
          </ToggleElementFree>
          <ToggleElementFree
            isActive={view === ChartView.PRICE}
            fontSize="12px"
            onClick={() => setView(ChartView.PRICE)}
          >
            Price
          </ToggleElementFree>
        </ToggleWrapper>
      </RowBetween>
      {Charts(view)}
    </DarkGreyCard>
  )
}

export default TokenChartCard
