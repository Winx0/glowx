import { useState } from 'react'
import { getApiKey, saveApiKey, removeApiKey } from '../services/airdropService'

export default function ApiKeySetup({ onSaved }) {
  const [apiKey, setApiKey] = useState(getApiKey())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!apiKey.trim()) return
    saveApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onSaved?.() }, 1000)
  }

  const handleRemove = () => {
    removeApiKey()
    setApiKey('')
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl border border-indigo-500/30 p-6">
      <h3 className="text-white font-semibold mb-2">Drops.bot API Key (Opsional)</h3>
      <p className="text-[var(--color-text-muted)] text-sm mb-4">
        Tanpa API key, app akan redirect ke Drops.bot (gratis).
        Dengan API key, hasil langsung tampil di app ini.
        <br />
        <span className="text-xs">Dapatkan key: DM <a href="https://x.com/AirdropDropsBot" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">@AirdropDropsBot</a> di X/Twitter</span>
      </p>
      <div className="flex gap-3">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API key (opsional)"
          className="flex-1 px-4 py-2.5 bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 text-sm font-mono"
        />
        <button onClick={handleSave} disabled={!apiKey.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm">
          {saved ? '✓' : 'Simpan'}
        </button>
        {getApiKey() && (
          <button onClick={handleRemove}
            className="px-3 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg text-sm">
            Hapus
          </button>
        )}
      </div>
    </div>
  )
}
