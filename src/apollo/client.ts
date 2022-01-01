import { ApolloClient, InMemoryCache } from '@apollo/client'

export type Exchange = 'UNIV3' | 'QUICK' | 'SUSHI'

function getExchangeApiUri(exchange: Exchange) {
  switch (exchange) {
    case 'UNIV3':
      return 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon'
    case 'QUICK':
      return 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06'
    case 'SUSHI':
      return 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange'
    default:
      throw Error('There is no exchange')
  }
}

function getBlockApiUri(exchange: Exchange) {
  switch (exchange) {
    case 'UNIV3':
    case 'QUICK':
    case 'SUSHI':
      return 'https://api.thegraph.com/subgraphs/name/sameepsi/maticblocks'
    default:
      throw Error('There is no exchange')
  }
}

export function getClient(exchange: Exchange) {
  const uri = getExchangeApiUri(exchange)

  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  })
}

export const healthClient = new ApolloClient({
  uri: 'https://api.thegraph.com/index-node/graphql',
  cache: new InMemoryCache(),
})

export function getBlockClient(exchange: Exchange) {
  const uri = getBlockApiUri(exchange)

  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
    queryDeduplication: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  })
}
