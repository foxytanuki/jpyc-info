import React, { useEffect, useMemo } from 'react'
import { SocialIcon } from 'react-social-icons'
import { ThemedBackground, PageWrapper } from './styled'
import { AutoColumn } from '../components/Column'
import { TYPE } from '../theme'

function About() {
  const backgroundColor = '#ffffff'

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <AutoColumn gap="lg">
        <TYPE.largeHeader>JPYC Info</TYPE.largeHeader>
        <TYPE.black>
          <TYPE.black>Polygon MainnetのJPYC価格キュレーションサイトです。</TYPE.black>
          <TYPE.black>現在は以下3つのDEXに対応しています。</TYPE.black>
        </TYPE.black>
        <TYPE.blue>
          <TYPE.blue> - Quickswap</TYPE.blue>
          <TYPE.blue> - Sushiswap</TYPE.blue>
          <TYPE.blue> - Uniswap V3</TYPE.blue>
        </TYPE.blue>
        <TYPE.black>
          <TYPE.black>万一、情報に誤りがあった場合においても制作者及び本サイトは一切の責任を負いかねます。</TYPE.black>
        </TYPE.black>
        <TYPE.black>
          <TYPE.black>
            <SocialIcon
              network="twitter"
              style={{ height: 24, width: 24, margin: 8 }}
              url="https://twitter.com/foxyTanuki"
            />
            <a href='https://twitter.com/foxyTanuki'>@foxyTanuki</a>
          </TYPE.black>
          <TYPE.black>
            <SocialIcon
              network="github"
              style={{ height: 24, width: 24, margin: 8 }}
              url="https://github.com/foxytanuki/jpyc-info"
            />
            <a href="https://github.com/foxytanuki/jpyc-info">foxytanuki/jpyc-info</a>
          </TYPE.black>
        </TYPE.black>
      </AutoColumn>
    </PageWrapper>
  )
}

export default About
