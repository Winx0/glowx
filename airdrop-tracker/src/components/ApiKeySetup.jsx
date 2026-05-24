import { useState } from 'react'
import { getApiKey, saveApiKey, removeApiKey } from '../services/airdropService'

export default function ApiKeySetup({ onSaved }) {
  const [apiKey, setApiKey] = useState(getApiKey())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!apiKey.trim()) return
    saveApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onSaved?.()
    }, 1500)
  }

  const handleRemove = () => {
    removeApiKey()
    setApiKey('')
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl border border-indigo-500/30 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">Drops.bot API Key</h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            Untuk mengecek airdrop secara real, kamu perlu API key dari Drops.bot. 
            Ini diperlukan untuk mengakses data airdrop yang sebenarnya dari blockchain.
          </p>

          {/* Steps */}
          <div className="bg-[var(--color-bg-dark)] rounded-xl p-4 mb-4 text-sm">
            <p className="text-white font-medium mb-2">Cara mendapatkan API Key:</p>
            <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-muted)]">
              <li>Buka <a href="https://www.drops.bot/airdrops-api" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">drops.bot/airdrops-api</a></li>
              <li>Daftar/login ke akun Drops.bot</li>
              <li>Buat API key baru di dashboard</li>
              <li>Copy API key dan paste di bawah</li>
            </ol>
            <p className="mt-3 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2">
              * Endpoint basic (daftar airdrop & total value) gratis. Detail lengkap (claim URL, dll) butuh credits.
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste API key kamu di sini..."
              className="flex-1 px-4 py-2.5 bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm font-mono"
            />
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
            >
              {saved ? '✓ Tersimpan!' : 'Simpan'}
            </button>
            {getApiKey() && (
              <button
                onClick={handleRemove}
                className="px-3 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium rounded-lg transition-colors text-sm"
              >
                Hapus
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            API key disimpan di browser kamu (localStorage) dan tidak dikirim ke server manapun selain Drops.bot.
          </p>
        </div>
      </div>
    </div>
  )
}
