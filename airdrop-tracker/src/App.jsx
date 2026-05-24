import { useState, useEffect } from 'react'
import WalletInput from './components/WalletInput'
import ChainSelector from './components/ChainSelector'
import AirdropResults from './components/AirdropResults'
import ApiKeySetup from './components/ApiKeySetup'
import { checkAirdrops, getApiKey } from './services/airdropService'

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedChains, setSelectedChains] = useState(['ethereum', 'arbitrum', 'optimism', 'base', 'solana', 'sui', 'aptos'])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasApiKey, setHasApiKey] = useState(!!getApiKey())
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setHasApiKey(!!getApiKey())
  }, [showSettings])

  const handleCheck = async () => {
    if (!walletAddress.trim()) {
      setError('Masukkan alamat wallet terlebih dahulu')
      return
    }

    if (!getApiKey()) {
      setError('API_KEY_MISSING')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const data = await checkAirdrops(walletAddress.trim(), selectedChains)
      setResults(data)
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setError('API_KEY_MISSING')
      } else {
        setError(err.message || 'Terjadi kesalahan saat mengecek airdrop')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      {/* Header */}
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
        <p className="text-[var(--color-text-muted)] text-lg">
          Cek airdrop & token yang belum di-claim di semua jaringan blockchain
        </p>
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-indigo-500/50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hasApiKey ? 'API Key ✓' : 'Setup API Key'}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* API Key Setup (shown if toggled or missing) */}
        {(showSettings || !hasApiKey) && (
          <ApiKeySetup
            onSaved={() => {
              setHasApiKey(true)
              setShowSettings(false)
              setError(null)
            }}
          />
        )}

        {/* Wallet Input */}
        <WalletInput
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          onCheck={handleCheck}
          loading={loading}
        />

        {/* Chain Selector */}
        <ChainSelector
          selectedChains={selectedChains}
          setSelectedChains={setSelectedChains}
        />

        {/* Error */}
        {error && error !== 'API_KEY_MISSING' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {error === 'API_KEY_MISSING' && !showSettings && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <p className="text-yellow-400 font-medium mb-2">API Key belum diatur</p>
            <p className="text-[var(--color-text-muted)] text-sm mb-3">
              Kamu butuh API key dari Drops.bot untuk mengecek airdrop secara real.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
            >
              Setup API Key →
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-[var(--color-text-muted)]">Mengecek airdrop di {selectedChains.length} jaringan (real data)...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <AirdropResults results={results} walletAddress={walletAddress} />
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 pt-6 border-t border-[var(--color-border)] text-center">
        <p className="text-[var(--color-text-muted)] text-sm">
          Real data powered by <a href="https://drops.bot" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Drops.bot API</a> • Multi-chain airdrop checker
        </p>
      </div>
    </div>
  )
}

export default App
