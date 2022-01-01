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
        <TYPE.largeHeader>JPYC Info (Unofficial)</TYPE.largeHeader>
        <TYPE.black>
          <TYPE.black>DEX全体のJPYC価格を表示するサイトです。</TYPE.black>
          <TYPE.black>現在は以下3つのDEXに対応しています。</TYPE.black>
        </TYPE.black>
        <TYPE.blue>
          <TYPE.blue> - Uniswap V3</TYPE.blue>
          <TYPE.blue> - Uniswap V2</TYPE.blue>
          <TYPE.blue> - Quickswap</TYPE.blue>
        </TYPE.blue>
        <TYPE.black>以下のDEXは流動性が基準を超え次第対応します。</TYPE.black>
        <TYPE.blue>
          <TYPE.blue> - Sushiswap Ethereum mainnet</TYPE.blue>
          <TYPE.blue> - Sushiswap Matic network</TYPE.blue>
        </TYPE.blue>
        <TYPE.black>
          <TYPE.black>万一、情報に誤りがあった場合においても制作者及び本サイトは一切の責任を負いかねます。</TYPE.black>
          <TYPE.black>
            特にUniswap V3についてはデータ取得先が開発中のため値に不具合が出る場合があります。ご注意ください。
          </TYPE.black>
        </TYPE.black>
        <TYPE.black>
          <TYPE.black>フィードバック、ご意見、その他連絡についてはTwitter及びDiscordまでお願いします。</TYPE.black>
          <TYPE.black>こんな機能がほしい！というご意見も大歓迎です。</TYPE.black>
        </TYPE.black>
        <TYPE.darkGray>
          <TYPE.darkGray>
            <SocialIcon
              network="twitter"
              style={{ height: 24, width: 24, margin: 4 }}
              url="https://twitter.com/foxyTanuki"
            />
            @foxyTanuki
          </TYPE.darkGray>
          <TYPE.darkGray>
            <SocialIcon network="discord" style={{ height: 24, width: 24, margin: 4, marginRight: 8 }} />
            foxytanuki#8096
          </TYPE.darkGray>
        </TYPE.darkGray>
      </AutoColumn>
    </PageWrapper>
  )
}

export default About
