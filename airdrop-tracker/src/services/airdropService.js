/**
 * GlowX Airdrop Tracker - Ankr Advanced API (FREE, no key)
 * https://www.ankr.com/docs/advanced-api/token-methods/
 */

const ANKR_URL = 'https://rpc.ankr.com/multichain'

const CHAIN_LABELS = {
  eth: 'Ethereum',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  base: 'Base',
  polygon: 'Polygon',
  bsc: 'BSC',
  avalanche: 'Avalanche',
  linea: 'Linea',
  scroll: 'Scroll',
  fantom: 'Fantom',
}

// Map our chain IDs to Ankr blockchain names
const CHAIN_TO_ANKR = {
  ethereum: 'eth',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  base: 'base',
  polygon: 'polygon',
  bsc: 'bsc',
  avalanche: 'avalanche',
  linea: 'linea',
  scroll: 'scroll',
  fantom: 'fantom',
}

export function detectAddressType(address) {
  if (/^0x[a-fA-F0-9]{40}$/i.test(address)) return 'evm'
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana'
  return 'unknown'
}

/**
 * Ankr: get token balances across multiple chains (FREE)
 */
async function ankrGetBalances(address, chains) {
  const blockchains = chains.map(c => CHAIN_TO_ANKR[c]).filter(Boolean)

  const res = await fetch(ANKR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'ankr_getAccountBalance',
      params: {
        walletAddress: address,
        blockchain: blockchains,
      },
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'Ankr API error')
  return data.result
}

/**
 * Ankr: get token transfers (to detect airdrops received)
 */
async function ankrGetTokenTransfers(address, chains) {
  const blockchains = chains.map(c => CHAIN_TO_ANKR[c]).filter(Boolean)

  const res = await fetch(ANKR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'ankr_getTokenTransfers',
      params: {
        address: [address],
        blockchain: blockchains,
        descOrder: true,
        pageSize: 50,
      },
    }),
  })

  const data = await res.json()
  if (data.error) return null
  return data.result
}

/**
 * Main check function
 */
export async function checkAirdrops(address, selectedChains) {
  const addressType = detectAddressType(address)
  if (addressType !== 'evm') {
    throw new Error('Saat ini hanya support alamat EVM (0x...). Solana segera.')
  }

  // Fetch balances and transfers in parallel
  const [balanceResult, transferResult] = await Promise.all([
    ankrGetBalances(address, selectedChains),
    ankrGetTokenTransfers(address, selectedChains),
  ])

  // Process balances
  const assets = balanceResult?.assets || []
  const tokens = assets
    .filter(a => parseFloat(a.balanceUsd || '0') > 0.01)
    .map(a => ({
      name: a.tokenName || 'Unknown',
      symbol: a.tokenSymbol || '???',
      chain: CHAIN_LABELS[a.blockchain] || a.blockchain,
      balance: parseFloat(a.balance || '0'),
      balanceUsd: parseFloat(a.balanceUsd || '0'),
      thumbnail: a.thumbnail || null,
      contractAddress: a.contractAddress || null,
      tokenType: a.tokenType || 'ERC20',
    }))
    .sort((a, b) => b.balanceUsd - a.balanceUsd)

  // Process transfers to find potential airdrops (tokens received from unknown contracts)
  const transfers = transferResult?.transfers || []
  const incomingTokens = transfers
    .filter(t => t.toAddress?.toLowerCase() === address.toLowerCase())
    .filter(t => t.fromAddress !== '0x0000000000000000000000000000000000000000') // skip mints? actually airdrops often come from 0x0
    .slice(0, 20)

  // Identify potential airdrops: tokens received that user still holds
  const heldSymbols = new Set(tokens.map(t => t.symbol.toLowerCase()))
  const potentialAirdrops = incomingTokens
    .filter(t => {
      const sym = (t.tokenSymbol || '').toLowerCase()
      return sym && heldSymbols.has(sym)
    })
    .reduce((acc, t) => {
      const key = `${t.tokenSymbol}-${t.blockchain}`
      if (!acc.has(key)) {
        acc.set(key, {
          name: t.tokenName || t.tokenSymbol || 'Unknown',
          token: t.tokenSymbol || '',
          chain: CHAIN_LABELS[t.blockchain] || t.blockchain,
          status: 'claimable',
          amount: null,
          value: null,
        })
      }
      return acc
    }, new Map())

  const totalUsd = tokens.reduce((sum, t) => sum + t.balanceUsd, 0)

  return {
    address,
    addressType,
    tokens,
    airdrops: [...potentialAirdrops.values()],
    totalUsd,
    totalTokens: tokens.length,
    chainsChecked: selectedChains.length,
    compatibleChains: selectedChains.map(c => CHAIN_LABELS[CHAIN_TO_ANKR[c]] || c),
    dropsUrl: `https://drops.bot/address/${address}`,
    timestamp: new Date().toISOString(),
  }
}

export function getApiKey() { return '' }
export function saveApiKey() {}
export function removeApiKey() {}
