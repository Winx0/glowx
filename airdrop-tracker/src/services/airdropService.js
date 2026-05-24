/**
 * GlowX Airdrop Tracker - Public RPC (100% free, no API key)
 */

const RPCS = {
  ethereum: 'https://eth.llamarpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  base: 'https://mainnet.base.org',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed1.binance.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  linea: 'https://rpc.linea.build',
  scroll: 'https://rpc.scroll.io',
}

const CHAIN_LABELS = {
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  base: 'Base',
  polygon: 'Polygon',
  bsc: 'BSC',
  avalanche: 'Avalanche',
  linea: 'Linea',
  scroll: 'Scroll',
}

const NATIVE_SYMBOLS = {
  ethereum: 'ETH',
  arbitrum: 'ETH',
  optimism: 'ETH',
  base: 'ETH',
  polygon: 'POL',
  bsc: 'BNB',
  avalanche: 'AVAX',
  linea: 'ETH',
  scroll: 'ETH',
}

export function detectAddressType(address) {
  if (/^0x[a-fA-F0-9]{40}$/i.test(address)) return 'evm'
  return 'unknown'
}

async function getBalance(address, chain) {
  const rpc = RPCS[chain]
  if (!rpc) return null
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }),
    })
    const data = await res.json()
    if (data.result) {
      return Number(BigInt(data.result)) / 1e18
    }
  } catch (e) { /* skip */ }
  return null
}

async function getTxCount(address, chain) {
  const rpc = RPCS[chain]
  if (!rpc) return 0
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionCount', params: [address, 'latest'] }),
    })
    const data = await res.json()
    if (data.result) return Number(BigInt(data.result))
  } catch (e) { /* skip */ }
  return 0
}

export async function checkAirdrops(address, selectedChains) {
  const addressType = detectAddressType(address)
  if (addressType !== 'evm') {
    throw new Error('Hanya support alamat EVM (0x...).')
  }

  const chains = selectedChains.filter(c => RPCS[c])

  // Fetch balances and tx counts in parallel
  const results = await Promise.all(
    chains.map(async (chain) => {
      const [balance, txCount] = await Promise.all([
        getBalance(address, chain),
        getTxCount(address, chain),
      ])
      return { chain, balance, txCount }
    })
  )

  const tokens = results
    .filter(r => r.balance !== null)
    .map(r => ({
      symbol: NATIVE_SYMBOLS[r.chain],
      chain: CHAIN_LABELS[r.chain],
      balance: r.balance,
      txCount: r.txCount,
    }))

  const activeChains = tokens.filter(t => t.balance > 0 || t.txCount > 0)

  return {
    address,
    tokens,
    activeChains: activeChains.length,
    totalChains: chains.length,
    compatibleChains: chains.map(c => CHAIN_LABELS[c]),
    dropsUrl: `https://drops.bot/address/${address}`,
    timestamp: new Date().toISOString(),
  }
}
