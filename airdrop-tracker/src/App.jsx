import { useState } from 'react'
import WalletInput from './components/WalletInput'
import ChainSelector from './components/ChainSelector'
import AirdropResults from './components/AirdropResults'
import { checkAirdrops } from './services/airdropService'

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedChains, setSelectedChains] = useState(['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'bsc', 'zksync', 'linea', 'scroll'])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheck = async () => {
    if (!walletAddress.trim()) {
      setError('Masukkan alamat wallet')
      return
    }
    setLoading(true)
    setError(null)
    setResults(null)

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
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            GlowX Airdrop Tracker
          </h1>
        </div>
        <p className="text-[var(--color-text-muted)]">
          Cek airdrop & token belum diklaim — langsung dari blockchain
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <WalletInput
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          onCheck={handleCheck}
          loading={loading}
        />

        <ChainSelector
          selectedChains={selectedChains}
          setSelectedChains={setSelectedChains}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">{error}</div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-[var(--color-text-muted)]">Mengecek on-chain...</span>
            </div>
          </div>
        )}

        {results && !loading && (
          <AirdropResults results={results} walletAddress={walletAddress} />
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-12 pt-6 border-t border-[var(--color-border)] text-center">
        <p className="text-[var(--color-text-muted)] text-sm">
          Data langsung dari public RPC + <a href="https://drops.bot" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Drops.bot</a>
        </p>
      </div>
    </div>
  )
}

export default App
