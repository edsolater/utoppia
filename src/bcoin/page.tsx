import { applyDecimal, createCurrentDateTimeStr, divide, toStringNumber } from '@edsolater/fnkit'
import { Box, jFetch, setIDBStoreValue, useIDBValue, useInterval } from '@edsolater/pivkit'
import { createEffect } from 'solid-js'
import { ETH, USDC, type SolanaTokenInfo } from './utils/wellknownTokens'

/**
 * Renders the BCoin component.
 */
export default function BCoinPage() {
  useInterval(async () => {
    console.log('run')
    const coinMinuteData = await fetchJupiterSwapPriceInfo({ token: ETH })
    setIDBStoreValue({ dbName: 'bcoin_prices', storeName: ETH.name }, coinMinuteData.timestamp, coinMinuteData)
  }, 60)
  const [ethPrices] = useIDBValue<{
    buyPrice: number
    sellPrice: number
    motion: { positive: number; negative: number }
  }>({
    dbName: 'bcoin_prices',
    storeName: ETH.name,
  })
  createEffect(() => {
    console.log('v: ', ethPrices())
  })
  return <Box>Hello this is page:bcoin</Box>
}

/**
 * Fetch real swap info by Jupiter swap v6.
 * doc: https://station.jup.ag/docs/apis/swap-api
 */
async function fetchJupiterSwapPriceInfo(options: { token: SolanaTokenInfo }) {
  //#region ---------------- buy price ----------------
  const buyPrice = (async () => {
    const inputToken = USDC
    const outputToken = options.token
    const inputAmount = 1000 // currently inputAmount is fixed to 1000
    const inputRawAmount = applyDecimal(inputAmount, -inputToken.decimal)
    const slippageBps = 50 // 0.5%
    const res = await jFetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${inputRawAmount}&slippageBps=${slippageBps}`,
    )
    const outputAmount = applyDecimal(res.outAmount, outputToken.decimal)
    const price = divide(inputAmount, outputAmount)
    console.log('price down: ', price)
    return toStringNumber(price)
  })()

  //#endregion

  //#region ---------------- sell price ----------------
  const sellPrice = (async () => {
    const inputToken = options.token
    const outputToken = USDC
    const outputAmount = 1000 // currently inputAmount is fixed to 1000
    const outputRawAmount = applyDecimal(outputAmount, -outputToken.decimal)
    const slippageBps = 50 // 0.5%
    const res = await jFetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${outputRawAmount}&slippageBps=${slippageBps}&swapMode=ExactOut`,
    )
    console.log('res.inAmount: ', res.inAmount)
    const inputAmount = applyDecimal(res.inAmount, inputToken.decimal)
    const price = divide(outputAmount, inputAmount)
    console.log('price up: ', price)
    return toStringNumber(price)
  })()
  //#endregion

  //#region ---------------- people motion about coin ----------------
  const motion = jFetch(
    `https://www.coingecko.com/sentiment_votes/voted_coin_today?api_symbol=${options.token.name}`,
  ).then((r: { percentage: { positive: number; negative: number } }) => r.percentage)
  //#endregion

  
  return Promise.all([buyPrice, sellPrice, motion]).then(([buyPrice, sellPrice, motion]) => ({
    timestamp: Date.now(),
    timestempStr: createCurrentDateTimeStr(),
    buyPrice,
    sellPrice,
    motion,
  }))
}
