/* eslint-disable import/extensions */
/* eslint-disable global-require */
import numbro from 'numbro'

// Helper Function for Numbro
function setNumbroLocale(locale: string): void {
  try {
    if (!numbro.languages()[locale]) {
      // Unfortunatelly we need to include the languages file directly.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const languages = require('./languages.min.js')
      if (languages) {
        const numbroLanguage = languages[locale]
        if (numbroLanguage) {
          numbro.registerLanguage(numbroLanguage)
        }
      }
    }
    numbro.setLanguage(locale)
  } catch (error: any) {
    console.log(`Error with configuring numbro${error.message ? `: ${error.message}` : '.'}`)
    console.log(error)
  }
}

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 2, round = true) => {
  if (num === 0) return '$0.00'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3) {
    return '<$0.001'
  }
  setNumbroLocale('en-US')
  return numbro(num).formatCurrency({ average: round, mantissa: num > 1000 ? 2 : digits })
}

export const formatYenAmount = (num: number | undefined, digits = 2, round = true) => {
  if (num === 0) return '¥0.00'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3) {
    return '<¥0.001'
  }
  setNumbroLocale('ja-JP')
  return numbro(num).formatCurrency({ average: round, mantissa: num > 1000 ? 2 : digits })
}

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2) => {
  if (num === 0) return '0'
  if (!num) return '-'
  if (num < 0.001) {
    return '<0.001'
  }
  const nf = new Intl.NumberFormat()
  return nf.format(parseFloat(num.toFixed(num > 1000 ? 0 : digits)))
}
