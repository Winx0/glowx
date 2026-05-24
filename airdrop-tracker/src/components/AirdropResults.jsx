const STATUS_STYLES = {
  claimable: { bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'bg-green-500/20 text-green-400', label: 'Bisa Diklaim' },
  unclaimed: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500/20 text-yellow-400', label: 'Belum Diklaim' },
  expired: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-400', label: 'Kadaluarsa' },
  claimed: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', badge: 'bg-gray-500/20 text-gray-400', label: 'Sudah Diklaim' },
}

function AirdropCard({ airdrop }) {
  const status = STATUS_STYLES[airdrop.status] || STATUS_STYLES.unclaimed
  return (
    <div className={`${status.bg} border ${status.border} rounded-xl p-5 hover:scale-[1.01] transition-all`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold text-white">{airdrop.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>{status.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
            {airdrop.chain && <span>🔗 {airdrop.chain}</span>}
            {airdrop.token && <span>🪙 {airdrop.token}</span>}
            {airdrop.amount && <span>💰 {airdrop.amount}</span>}
          </div>
        </div>
        {airdrop.value && (
          <p className="text-lg font-bold text-white shrink-0">${airdrop.value}</p>
        )}
      </div>
    </div>
  )
}

export default function AirdropResults({ results, walletAddress }) {
  return (
    <div className="space-y-6">
      {/* On-chain balance info */}
      {results.balances && results.balances.length > 0 && (
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
          <h3 className="text-white font-semibold mb-3">Aktivitas Wallet (On-Chain)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {results.balances.map((b, i) => (
              <div key={i} className="bg-[var(--color-bg-dark)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--color-text-muted)]">{b.label}</p>
                <p className="text-sm font-mono text-white mt-1">
                  {b.balance < 0.0001 ? '< 0.0001' : b.balance.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            Wallet aktif di {results.activeChains} dari {results.totalChains} jaringan yang dicek
          </p>
        </div>
      )}

      {/* Airdrops from on-chain checks */}
      {results.airdrops && results.airdrops.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Airdrop Terdeteksi (On-Chain)</h3>
          {results.airdrops.map((a, i) => <AirdropCard key={i} airdrop={a} />)}
        </div>
      )}

      {/* Always show Drops.bot full check */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 text-center">
        <p className="text-white font-semibold text-lg mb-2">Cek Lengkap di Drops.bot</p>
        <p className="text-[var(--color-text-muted)] text-sm mb-4">
          Drops.bot mengecek 388+ airdrop di semua jaringan — gratis, tanpa login.
        </p>
        <a
          href={results.dropsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          Buka Drops.bot untuk {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Timestamp */}
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Dicek: {new Date(results.timestamp).toLocaleString('id-ID')} • Jaringan: {results.compatibleChains?.join(', ')}
      </p>
    </div>
  )
}
