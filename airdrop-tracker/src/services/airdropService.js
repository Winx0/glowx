/**
 * GlowX Airdrop Tracker Service
 * 
 * Uses multiple free sources to check wallet airdrop eligibility:
 * 1. Drops.bot (free web checker - no API key needed via iframe/redirect)
 * 2. Direct on-chain token balance checking via public RPCs
 */

// Public RPC endpoints (no API key needed)
const RPC_ENDPOINTS = {
  ethereum: 'https://eth.llamarpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  base: 'https://mainnet.base.org',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  zksync: 'https://mainnet.era.zksync.io',
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
  zksync: 'zkSync',
  linea: 'Linea',
  scroll: 'Scroll',
  solana: 'Solana',
  sui: 'SUI',
  aptos: 'Aptos',
  cosmos: 'Cosmos',
  starknet: 'Starknet',
}

// Known airdrop claim contracts that can be checked on-chain
const CLAIM_CONTRACTS = [
  {
    name: 'LayerZero ZRO',
    token: 'ZRO',
    chain: 'arbitrum',
    contract: '0xB09F16F625B363875e39ADa56C03682c4B8c01ef',
    method: '0x1e83409a', // claimable(address)
  },
  {
    name: 'Starknet STRK Provisions',
    token: 'STRK',
    chain: 'ethereum',
    contract: '0x1e8aba82a06ea53e668a210ffaa3e8f6b1c0e36f',
    method: '0x1e83409a',
  },
  {
    name: 'EigenLayer EIGEN',
    token: 'EIGEN',
    chain: 'ethereum',
    contract: '0x035bdA7EE80e42Ec7cF6154463Fd557c3e86e66b',
    method: '0x1e83409a',
  },
  {
    name: 'Scroll SCR',
    token: 'SCR',
    chain: 'scroll',
    contract: '0x67fd208EB42B8B2d5E2Ec8b6aa7e4a7d45A3D1E5',
    method: '0x1e83409a',
  },
]

/**
 * Detect wallet address type
 */
export function detectAddressType(address) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return 'evm'
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana'
  if (/^0x[a-fA-F0-9]{64}$/.test(address)) return 'sui'
  if (/^(cosmos|osmo|juno|stars|celestia|dym)[a-z0-9]{38,}$/.test(address)) return 'cosmos'
  return 'unknown'
}

/**
 * Get native balance from public RPC (no API key)
 */
async function getNativeBalance(address, chain) {
  const rpc = RPC_ENDPOINTS[chain]
  if (!rpc) return null

  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    })
    const data = await res.json()
    if (data.result) {
      const wei = BigInt(data.result)
      const eth = Number(wei) / 1e18
      return eth
    }
  } catch (e) {
    console.warn(`[${chain}] RPC error:`, e.message)
  }
  return null
}

/**
 * Check if address has claimable amount on a known airdrop contract
 */
async function checkClaimContract(address, airdrop) {
  const rpc = RPC_ENDPOINTS[airdrop.chain]
  if (!rpc) return null

  try {
    // eth_call to check claimable balance
    const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0')
    const callData = airdrop.method + paddedAddress

    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: airdrop.contract, data: callData }, 'latest'],
      }),
    })
    const data = await res.json()

    if (data.result && data.result !== '0x' && data.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      const amount = Number(BigInt(data.result)) / 1e18
      if (amount > 0) {
        return { ...airdrop, amount, claimable: true }
      }
    }
  } catch (e) {
    // Contract might not support this method - that's fine
  }
  return null
}

/**
 * Main: check wallet across all selected chains
 */
export async function checkAirdrops(address, selectedChains) {
  const addressType = detectAddressType(address)

  if (addressType === 'unknown') {
    throw new Error('Format alamat tidak dikenali.')
  }

  if (addressType !== 'evm') {
    // Non-EVM: langsung redirect ke Drops.bot
    return {
      mode: 'redirect',
      address,
      addressType,
      dropsUrl: `https://drops.bot/address/${address}`,
      compatibleChains: selectedChains.filter(c => c === addressType).map(c => CHAIN_LABELS[c] || c),
      airdrops: [],
      balances: [],
      timestamp: new Date().toISOString(),
    }
  }

  // EVM: check on-chain
  const evmChains = selectedChains.filter(c => RPC_ENDPOINTS[c])

  // 1. Check native balances on all chains (parallel)
  const balancePromises = evmChains.map(async (chain) => {
    const bal = await getNativeBalance(address, chain)
    return { chain, label: CHAIN_LABELS[chain], balance: bal }
  })

  // 2. Check known airdrop claim contracts
  const claimPromises = CLAIM_CONTRACTS
    .filter(a => evmChains.includes(a.chain))
    .map(a => checkClaimContract(address, a))

  const [balances, claims] = await Promise.all([
    Promise.all(balancePromises),
    Promise.all(claimPromises),
  ])

  // Filter active balances
  const activeChains = balances.filter(b => b.balance !== null && b.balance > 0)

  // Filter valid claims
  const validClaims = claims.filter(Boolean)

  // Build airdrop results from on-chain data
  const airdrops = validClaims.map(claim => ({
    name: claim.name,
    token: claim.token,
    chain: CHAIN_LABELS[claim.chain] || claim.chain,
    status: 'claimable',
    amount: `${claim.amount.toFixed(2)} ${claim.token}`,
    value: null,
    claimUrl: null,
  }))

  return {
    mode: 'onchain',
    address,
    addressType,
    dropsUrl: `https://drops.bot/address/${address}`,
    compatibleChains: evmChains.map(c => CHAIN_LABELS[c] || c),
    airdrops,
    balances: activeChains,
    totalChains: evmChains.length,
    activeChains: activeChains.length,
    timestamp: new Date().toISOString(),
  }
}

// Keep these for settings compatibility
export function getApiKey() { return localStorage.getItem('glowx_drops_api_key') || '' }
export function saveApiKey(key) { localStorage.setItem('glowx_drops_api_key', key) }
export function removeApiKey() { localStorage.removeItem('glowx_drops_api_key') }
