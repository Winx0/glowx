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
            <h3 className="font-semibold text-white truncate">{airdrop.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>{status.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
            {airdrop.chain && <span>🔗 {airdrop.chain}</span>}
            {airdrop.token && <span>🪙 {airdrop.token}</span>}
            {airdrop.amount && <span>💰 {airdrop.amount}</span>}
          </div>
          {airdrop.deadline && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Deadline: {airdrop.deadline}</p>}
        </div>
        <div className="text-right shrink-0">
          {airdrop.value && <p className="text-lg font-bold text-white">${airdrop.value}</p>}
          {airdrop.claimUrl && (airdrop.status === 'claimable' || airdrop.status === 'unclaimed') && (
            <a href={airdrop.claimUrl} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 text-sm font-medium rounded-lg transition-colors">
              Klaim →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AirdropResults({ results, walletAddress }) {
  // Redirect mode (no API key) — just show link to Drops.bot
  if (results.mode === 'redirect') {
    return (
      <div className="space-y-4">
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <p className="text-2xl mb-3">✅</p>
          <p className="text-white font-semibold text-lg mb-2">Wallet Terdeteksi: {results.addressType.toUpperCase()}</p>
          <p className="text-[var(--color-text-muted)] text-sm mb-1">
            Jaringan kompatibel: {results.compatibleChains.join(', ')}
          </p>
          <p className="text-[var(--color-text-muted)] text-sm mb-6">
            Klik tombol di bawah untuk melihat semua airdrop yang belum diklaim (gratis, tanpa API key).
          </p>
          <a
            href={results.dropsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Cek Airdrop di Drops.bot (Gratis)
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p className="text-xs text-[var(--color-text-muted)] mt-4">
            Atau tambahkan API key di Settings untuk melihat hasil langsung di app ini.
          </p>
        </div>
      </div>
    )
  }

  // API mode — show real results
  const claimable = results.airdrops?.filter(a => a.status === 'claimable' || a.status === 'unclaimed') || []

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{results.airdrops?.length || 0}</p>
          <p className="text-xs text-[var(--color-text-muted)]">airdrop</p>
        </div>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Aktif</p>
          <p className="text-2xl font-bold text-green-400">{claimable.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">bisa diklaim</p>
        </div>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Nilai</p>
          <p className="text-2xl font-bold text-indigo-400">
            {results.totalValue > 0 ? `$${results.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : 'N/A'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">USD</p>
        </div>
      </div>

      {/* Data source badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <span className="text-green-400 text-xs font-medium">● LIVE DATA</span>
        <span className="text-xs text-[var(--color-text-muted)]">dari Drops.bot API • {results.compatibleChains?.join(', ')}</span>
      </div>

      {/* List */}
      {results.airdrops?.length > 0 ? (
        <div className="space-y-3">
          {results.airdrops.map((airdrop, idx) => (
            <AirdropCard key={idx} airdrop={airdrop} />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <p className="text-[var(--color-text-muted)]">Tidak ada airdrop ditemukan untuk wallet ini.</p>
        </div>
      )}

      {/* Drops.bot link */}
      <div className="text-center">
        <a href={results.dropsUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-400 font-medium rounded-xl transition-colors">
          Detail lengkap di Drops.bot →
        </a>
      </div>
    </div>
  )
}
