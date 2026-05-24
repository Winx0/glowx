/**
 * GlowX Airdrop Tracker Service
 * 
 * Uses Drops.bot API for real airdrop eligibility checking.
 * API Docs: https://docs.drops.bot
 * 
 * Endpoints used:
 * - GET /shared/v1/airdrops/{network}/{address} (free - basic info)
 * - GET /shared/v1/value/airdrops/{network}/{address} (free - total value)
 * - GET /shared/v1/airdrops/{network}/{address}/full (paid - full details)
 */

const BASE_URL = 'https://api.drops.bot/shared/v1'

// Supported networks by Drops.bot API
const NETWORK_MAP = {
  ethereum: { apiName: 'evm', addressType: 'evm', label: 'Ethereum' },
  arbitrum: { apiName: 'arbitrum', addressType: 'evm', label: 'Arbitrum' },
  optimism: { apiName: 'optimism', addressType: 'evm', label: 'Optimism' },
  base: { apiName: 'base', addressType: 'evm', label: 'Base' },
  polygon: { apiName: 'polygon', addressType: 'evm', label: 'Polygon' },
  bsc: { apiName: 'bsc', addressType: 'evm', label: 'BSC' },
  avalanche: { apiName: 'avalanche', addressType: 'evm', label: 'Avalanche' },
  zksync: { apiName: 'zksync', addressType: 'evm', label: 'zkSync' },
  linea: { apiName: 'linea', addressType: 'evm', label: 'Linea' },
  scroll: { apiName: 'scroll', addressType: 'evm', label: 'Scroll' },
  starknet: { apiName: 'starknet', addressType: 'starknet', label: 'Starknet' },
  solana: { apiName: 'solana', addressType: 'solana', label: 'Solana' },
  sui: { apiName: 'sui', addressType: 'sui', label: 'SUI' },
  aptos: { apiName: 'aptos', addressType: 'aptos', label: 'Aptos' },
  cosmos: { apiName: 'cosmos', addressType: 'cosmos', label: 'Cosmos' },
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
 * Get API key from localStorage
 */
export function getApiKey() {
  return localStorage.getItem('glowx_drops_api_key') || ''
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(key) {
  localStorage.setItem('glowx_drops_api_key', key)
}

/**
 * Remove API key
 */
export function removeApiKey() {
  localStorage.removeItem('glowx_drops_api_key')
}

/**
 * Fetch airdrops for a specific network using Drops.bot API
 * Free endpoint: returns airdrop names/count but details hidden
 */
async function fetchAirdropsForNetwork(address, network, apiKey) {
  const networkConfig = NETWORK_MAP[network]
  if (!networkConfig) return null

  const url = `${BASE_URL}/airdrops/${networkConfig.apiName}/${address}`

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 401) {
      throw new Error('API_KEY_INVALID')
    }

    if (response.status === 429) {
      throw new Error('RATE_LIMITED')
    }

    if (!response.ok) {
      console.warn(`[${network}] API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    return { network, networkLabel: networkConfig.label, data }
  } catch (error) {
    if (error.message === 'API_KEY_INVALID' || error.message === 'RATE_LIMITED') {
      throw error
    }
    console.warn(`[${network}] Fetch failed:`, error.message)
    return null
  }
}

/**
 * Fetch total airdrop value for a network
 * Free endpoint: returns total fiat value
 */
async function fetchAirdropValue(address, network, apiKey) {
  const networkConfig = NETWORK_MAP[network]
  if (!networkConfig) return null

  const url = `${BASE_URL}/value/airdrops/${networkConfig.apiName}/${address}`

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return { network, networkLabel: networkConfig.label, data }
  } catch (error) {
    console.warn(`[${network}] Value fetch failed:`, error.message)
    return null
  }
}

/**
 * Main function: check airdrops across selected chains
 */
export async function checkAirdrops(address, selectedChains) {
  const addressType = detectAddressType(address)
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error('API_KEY_MISSING')
  }

  if (addressType === 'unknown') {
    throw new Error('Format alamat wallet tidak dikenali. Gunakan format EVM (0x...), Solana, SUI, Aptos, atau Cosmos.')
  }

  // Filter chains compatible with the address type
  const compatibleChains = selectedChains.filter(chain => {
    const config = NETWORK_MAP[chain]
    if (!config) return false
    // EVM addresses work for all EVM chains
    if (addressType === 'evm' && config.addressType === 'evm') return true
    // Non-EVM: must match exactly
    if (addressType === config.addressType) return true
    return false
  })

  if (compatibleChains.length === 0) {
    throw new Error(`Alamat ${addressType.toUpperCase()} tidak kompatibel dengan jaringan yang dipilih.`)
  }

  // Fetch airdrops + values in parallel for all compatible chains
  const results = await Promise.allSettled(
    compatibleChains.flatMap(chain => [
      fetchAirdropsForNetwork(address, chain, apiKey),
      fetchAirdropValue(address, chain, apiKey),
    ])
  )

  // Check for auth errors
  for (const result of results) {
    if (result.status === 'rejected') {
      if (result.reason.message === 'API_KEY_INVALID') {
        throw new Error('API key tidak valid. Periksa kembali API key kamu di pengaturan.')
      }
      if (result.reason.message === 'RATE_LIMITED') {
        throw new Error('Rate limit tercapai. Coba lagi dalam beberapa saat.')
      }
    }
  }

  // Process airdrop results
  const airdrops = []
  const valueByNetwork = {}

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue
    const { network, networkLabel, data } = result.value

    // Value endpoint response
    if (data?.total_value !== undefined || data?.totalValue !== undefined || data?.value !== undefined) {
      valueByNetwork[network] = data.total_value || data.totalValue || data.value || data.formatted_value || '0'
      continue
    }

    // Airdrops endpoint response
    if (data?.airdrops && Array.isArray(data.airdrops)) {
      for (const drop of data.airdrops) {
        airdrops.push({
          name: drop.name || drop.title || 'Unknown Airdrop',
          token: drop.token || drop.symbol || '',
          chain: networkLabel,
          chainId: network,
          status: mapStatus(drop.status),
          value: drop.value || drop.usd_value || null,
          amount: drop.amount ? `${drop.amount} ${drop.token || ''}`.trim() : null,
          claimUrl: drop.claim_url || drop.claimUrl || null,
          deadline: drop.deadline || drop.expires_at || null,
          description: drop.description || '',
        })
      }
    }

    // Some APIs return as array directly
    if (Array.isArray(data)) {
      for (const drop of data) {
        airdrops.push({
          name: drop.name || drop.title || 'Unknown Airdrop',
          token: drop.token || drop.symbol || '',
          chain: networkLabel,
          chainId: network,
          status: mapStatus(drop.status),
          value: drop.value || drop.usd_value || null,
          amount: drop.amount ? `${drop.amount} ${drop.token || ''}`.trim() : null,
          claimUrl: drop.claim_url || drop.claimUrl || null,
          deadline: drop.deadline || drop.expires_at || null,
          description: drop.description || '',
        })
      }
    }

    // If response has success: true and contains data differently
    if (data?.success && data?.data) {
      const items = Array.isArray(data.data) ? data.data : [data.data]
      for (const drop of items) {
        airdrops.push({
          name: drop.name || drop.title || 'Unknown Airdrop',
          token: drop.token || drop.symbol || '',
          chain: networkLabel,
          chainId: network,
          status: mapStatus(drop.status),
          value: drop.value || drop.usd_value || null,
          amount: drop.amount ? `${drop.amount} ${drop.token || ''}`.trim() : null,
          claimUrl: drop.claim_url || drop.claimUrl || null,
          deadline: drop.deadline || drop.expires_at || null,
          description: drop.description || '',
        })
      }
    }
  }

  // Sort: claimable first, then unclaimed, then others
  const statusOrder = { claimable: 0, unclaimed: 1, expired: 2, claimed: 3 }
  airdrops.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99))

  // Calculate total value
  const totalValue = Object.values(valueByNetwork).reduce((sum, val) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : (val || 0)
    return sum + (isNaN(num) ? 0 : num)
  }, 0)

  return {
    address,
    addressType,
    checkedChains: compatibleChains.length,
    compatibleChains: compatibleChains.map(c => NETWORK_MAP[c]?.label || c),
    airdrops,
    totalValue,
    valueByNetwork,
    timestamp: new Date().toISOString(),
    dropsUrl: `https://drops.bot/address/${address}`,
  }
}

/**
 * Map various status strings to our standard format
 */
function mapStatus(status) {
  if (!status) return 'unclaimed'
  const s = status.toLowerCase()
  if (s.includes('claim') && !s.includes('un')) return 'claimable'
  if (s.includes('unclaim') || s.includes('pending') || s.includes('eligible')) return 'unclaimed'
  if (s.includes('expire') || s.includes('miss')) return 'expired'
  if (s.includes('claimed') || s.includes('done')) return 'claimed'
  return 'unclaimed'
}
