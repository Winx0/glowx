const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627eea' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', color: '#2d374b' },
  { id: 'optimism', name: 'Optimism', icon: '🔴', color: '#ff0420' },
  { id: 'base', name: 'Base', icon: '🔷', color: '#0052ff' },
  { id: 'polygon', name: 'Polygon', icon: '💜', color: '#8247e5' },
  { id: 'bsc', name: 'BSC', icon: '💛', color: '#f3ba2f' },
  { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: '#e84142' },
  { id: 'zksync', name: 'zkSync', icon: '◆', color: '#8c8dfc' },
  { id: 'linea', name: 'Linea', icon: '▬', color: '#61dfff' },
  { id: 'scroll', name: 'Scroll', icon: '📜', color: '#ffeeda' },
  { id: 'solana', name: 'Solana', icon: '◎', color: '#9945ff' },
  { id: 'sui', name: 'SUI', icon: '💧', color: '#4da2ff' },
  { id: 'aptos', name: 'Aptos', icon: '🅰️', color: '#2dd8a3' },
  { id: 'cosmos', name: 'Cosmos', icon: '⚛️', color: '#6f7390' },
  { id: 'starknet', name: 'Starknet', icon: '⬡', color: '#ec796b' },
]

export default function ChainSelector({ selectedChains, setSelectedChains }) {
  const toggleChain = (chainId) => {
    setSelectedChains(prev =>
      prev.includes(chainId)
        ? prev.filter(c => c !== chainId)
        : [...prev, chainId]
    )
  }

  const selectAll = () => setSelectedChains(CHAINS.map(c => c.id))
  const deselectAll = () => setSelectedChains([])

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-[var(--color-text-muted)]">
          Pilih Jaringan ({selectedChains.length}/{CHAINS.length})
        </label>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
          >
            Semua
          </button>
          <button
            onClick={deselectAll}
            className="text-xs px-3 py-1 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {CHAINS.map(chain => (
          <button
            key={chain.id}
            onClick={() => toggleChain(chain.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
              selectedChains.includes(chain.id)
                ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                : 'bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/30'
            }`}
          >
            <span>{chain.icon}</span>
            <span>{chain.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
