import { useState } from 'react'
import WalletInput from './components/WalletInput'
import ChainSelector from './components/ChainSelector'
import AirdropResults from './components/AirdropResults'
import { checkAirdrops } from './services/airdropService'

function App() {
  const [walletAddress, setWalletAddress] = useState('0x6f6E58303805BF77F465ef51d6101C738537F645')
  const [selectedChains, setSelectedChains] = useState(['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'bsc', 'avalanche', 'linea', 'scroll'])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheck = async () => {
    if (!walletAddress.trim()) { setError('Masukkan alamat wallet'); return }
    setLoading(true); setError(null); setResults(null)
    try {
      const data = await checkAirdrops(walletAddress.trim(), selectedChains)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          GlowX Airdrop Tracker
        </h1>
        <p className="text-[var(--color-text-muted)]">Multi-chain wallet scanner — data real via Ankr API (gratis)</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <WalletInput walletAddress={walletAddress} setWalletAddress={setWalletAddress} onCheck={handleCheck} loading={loading} />
        <ChainSelector selectedChains={selectedChains} setSelectedChains={setSelectedChains} />

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">{error}</div>}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-[var(--color-text-muted)]">Scanning {selectedChains.length} chains...</span>
            </div>
          </div>
        )}

        {results && !loading && <AirdropResults results={results} walletAddress={walletAddress} />}
      </div>
    </div>
  )
}

export default App
