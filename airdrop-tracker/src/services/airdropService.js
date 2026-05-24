/**
 * GlowX Airdrop Tracker Service
 * 
 * Approach: Since Drops.bot's website is FREE (no API key needed for web),
 * we generate the correct Drops.bot URL for the user's wallet and open it directly.
 * 
 * For programmatic checks, we use the free public endpoints where possible.
 */

const DROPS_BASE = 'https://drops.bot'

// Supported networks
const NETWORK_MAP = {
  ethereum: { type: 'evm', label: 'Ethereum', dropsPath: 'ethereum' },
  arbitrum: { type: 'evm', label: 'Arbitrum', dropsPath: 'arbitrum' },
  optimism: { type: 'evm', label: 'Optimism', dropsPath: 'optimism' },
  base: { type: 'evm', label: 'Base', dropsPath: 'base' },
  polygon: { type: 'evm', label: 'Polygon', dropsPath: 'polygon' },
  bsc: { type: 'evm', label: 'BSC', dropsPath: 'bsc' },
  avalanche: { type: 'evm', label: 'Avalanche', dropsPath: 'avalanche' },
  zksync: { type: 'evm', label: 'zkSync', dropsPath: 'zksync' },
  linea: { type: 'evm', label: 'Linea', dropsPath: 'linea' },
  scroll: { type: 'evm', label: 'Scroll', dropsPath: 'scroll' },
  starknet: { type: 'starknet', label: 'Starknet', dropsPath: 'starknet' },
  solana: { type: 'solana', label: 'Solana', dropsPath: 'solana' },
  sui: { type: 'sui', label: 'SUI', dropsPath: 'sui' },
  aptos: { type: 'aptos', label: 'Aptos', dropsPath: 'aptos' },
  cosmos: { type: 'cosmos', label: 'Cosmos', dropsPath: 'cosmos' },
}

/**
 * Detect wallet address type
 */
export function detectAddressType(address) {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return 'evm'
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana'
  if (/^0x[a-fA-F0-9]{64}$/.test(address)) return 'sui'
  if (/^(cosmos|osmo|juno|stars|atom|evmos|inj|celestia|dym)[a-z0-9]{38,}$/.test(address)) return 'cosmos'
  if (/^0x[a-fA-F0-9]{62,64}$/.test(address)) return 'aptos'
  if (/^0x0[a-fA-F0-9]{63}$/.test(address)) return 'starknet'
  return 'unknown'
}

/**
 * Get the Drops.bot URL to check a wallet
 */
export function getDropsUrl(address) {
  return `${DROPS_BASE}/address/${address}`
}

/**
 * Get compatible chains for an address type
 */
export function getCompatibleChains(address, selectedChains) {
  const addressType = detectAddressType(address)
  return selectedChains.filter(chain => {
    const config = NETWORK_MAP[chain]
    if (!config) return false
    if (addressType === 'evm' && config.type === 'evm') return true
    if (addressType === config.type) return true
    return false
  })
}

/**
 * Try to fetch airdrop data from Drops.bot API (if API key is set)
 * Falls back to redirect mode if no key
 */
export async function checkAirdrops(address, selectedChains) {
  const addressType = detectAddressType(address)

  if (addressType === 'unknown') {
    throw new Error('Format alamat tidak dikenali. Gunakan EVM (0x...), Solana, SUI, Aptos, atau Cosmos.')
  }

  const compatibleChains = getCompatibleChains(address, selectedChains)

  if (compatibleChains.length === 0) {
    throw new Error(`Alamat ${addressType.toUpperCase()} tidak cocok dengan jaringan yang dipilih.`)
  }

  // Try Drops.bot API if user has key
  const apiKey = localStorage.getItem('glowx_drops_api_key')
  
  if (apiKey) {
    return await fetchFromDropsAPI(address, compatibleChains, addressType, apiKey)
  }

  // No API key — return redirect info (free mode)
  return {
    mode: 'redirect',
    address,
    addressType,
    checkedChains: compatibleChains.length,
    compatibleChains: compatibleChains.map(c => NETWORK_MAP[c]?.label || c),
    dropsUrl: getDropsUrl(address),
    airdrops: [],
    totalValue: 0,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Fetch from Drops.bot API with key
 */
async function fetchFromDropsAPI(address, chains, addressType, apiKey) {
  const networkName = addressType === 'evm' ? 'evm' : addressType

  const results = await Promise.allSettled([
    // Airdrops list
    fetch(`https://api.drops.bot/shared/v1/airdrops/${networkName}/${address}`, {
      headers: { 'x-api-key': apiKey },
    }).then(r => {
      if (r.status === 401) throw new Error('API_KEY_INVALID')
      if (r.status === 429) throw new Error('RATE_LIMITED')
      return r.ok ? r.json() : null
    }),
    // Value
    fetch(`https://api.drops.bot/shared/v1/value/airdrops/${networkName}/${address}`, {
      headers: { 'x-api-key': apiKey },
    }).then(r => r.ok ? r.json() : null),
  ])

  // Check for errors
  for (const r of results) {
    if (r.status === 'rejected') {
      if (r.reason?.message === 'API_KEY_INVALID') {
        throw new Error('API key tidak valid.')
      }
      if (r.reason?.message === 'RATE_LIMITED') {
        throw new Error('Rate limit. Coba lagi nanti.')
      }
    }
  }

  const airdropsData = results[0].status === 'fulfilled' ? results[0].value : null
  const valueData = results[1].status === 'fulfilled' ? results[1].value : null

  // Parse airdrops
  const airdrops = []
  const rawAirdrops = airdropsData?.airdrops || airdropsData?.data || (Array.isArray(airdropsData) ? airdropsData : [])
  
  for (const drop of rawAirdrops) {
    airdrops.push({
      name: drop.name || drop.title || 'Airdrop',
      token: drop.token || drop.symbol || '',
      chain: chains.map(c => NETWORK_MAP[c]?.label).filter(Boolean).join(', '),
      status: mapStatus(drop.status),
      value: drop.value || drop.usd_value || null,
      amount: drop.amount ? `${drop.amount} ${drop.token || ''}`.trim() : null,
      claimUrl: drop.claim_url || drop.claimUrl || null,
      deadline: drop.deadline || drop.expires_at || null,
    })
  }

  // Sort
  const order = { claimable: 0, unclaimed: 1, expired: 2, claimed: 3 }
  airdrops.sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99))

  const totalValue = valueData?.total_value || valueData?.totalValue || valueData?.value || 0

  return {
    mode: 'api',
    address,
    addressType,
    checkedChains: chains.length,
    compatibleChains: chains.map(c => NETWORK_MAP[c]?.label || c),
    dropsUrl: getDropsUrl(address),
    airdrops,
    totalValue: typeof totalValue === 'string' ? parseFloat(totalValue.replace(/[^0-9.]/g, '')) || 0 : totalValue,
    timestamp: new Date().toISOString(),
  }
}

function mapStatus(status) {
  if (!status) return 'unclaimed'
  const s = status.toLowerCase()
  if (s.includes('claim') && !s.includes('un')) return 'claimable'
  if (s.includes('unclaim') || s.includes('pending') || s.includes('eligible')) return 'unclaimed'
  if (s.includes('expire') || s.includes('miss')) return 'expired'
  if (s.includes('claimed') || s.includes('done')) return 'claimed'
  return 'unclaimed'
}

/**
 * Save/get/remove API key helpers
 */
export function getApiKey() {
  return localStorage.getItem('glowx_drops_api_key') || ''
}
export function saveApiKey(key) {
  localStorage.setItem('glowx_drops_api_key', key)
}
export function removeApiKey() {
  localStorage.removeItem('glowx_drops_api_key')
}
