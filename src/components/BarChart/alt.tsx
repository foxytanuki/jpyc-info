import React, { Dispatch, SetStateAction, ReactNode } from 'react'
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar } from 'recharts'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Card from '../Card'
import { RowBetween } from '../Row'
import useTheme from '../../contexts/Theme'

dayjs.extend(utc)

const DEFAULT_HEIGHT = 300

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 1rem;
  padding-right: 2rem;
  display: flex;
  background-color: ${({ theme }) => theme.bg0}
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => (
  <g>
    <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
  </g>
)

const Chart = ({
  data,
  color = '#56B2A4',
  setValue,
  setLabel,
  value,
  label,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  const parsedValue = value

  return (
    <Wrapper minHeight={minHeight} {...rest}>
      {/* <RowBetween>
        {topLeft ?? null}
        {topRight ?? null}
      </RowBetween> */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 8,
            right: 16,
            left: 16,
            bottom: 8,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined)
            setValue && setValue(undefined)
          }}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(time) => dayjs(time).format('MMM DD')}
            minTickGap={60}
          />
          <Tooltip
            cursor={{ fill: theme.bg4 }}
            contentStyle={{ display: 'none' }}
            formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
              if (setValue && parsedValue !== props.payload.value) {
                setValue(props.payload.value)
              }
              const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY')
              if (setLabel && label !== formattedTime) setLabel(formattedTime)
            }}
          />
          <Bar
            dataKey="value"
            fill={color}
            shape={(props) => (
              <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
      {/* <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween> */}
    </Wrapper>
  )
}

export default Chart
