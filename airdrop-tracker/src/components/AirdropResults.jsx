const STATUS_STYLES = {
  claimable: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    badge: 'bg-green-500/20 text-green-400',
    label: 'Bisa Diklaim',
  },
  unclaimed: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400',
    label: 'Belum Diklaim',
  },
  expired: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
    label: 'Kadaluarsa',
  },
  claimed: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    badge: 'bg-gray-500/20 text-gray-400',
    label: 'Sudah Diklaim',
  },
}

function AirdropCard({ airdrop }) {
  const status = STATUS_STYLES[airdrop.status] || STATUS_STYLES.unclaimed

  return (
    <div className={`${status.bg} border ${status.border} rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold text-white truncate">{airdrop.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>
              {status.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <span>🔗</span> {airdrop.chain}
            </span>
            {airdrop.token && (
              <span className="flex items-center gap-1">
                <span>🪙</span> {airdrop.token}
              </span>
            )}
            {airdrop.amount && (
              <span className="flex items-center gap-1">
                <span>💰</span> {airdrop.amount}
              </span>
            )}
          </div>
          {airdrop.deadline && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Deadline: {airdrop.deadline}
            </p>
          )}
          {airdrop.description && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)] opacity-70">
              {airdrop.description}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {airdrop.value && (
            <p className="text-lg font-bold text-white">${airdrop.value}</p>
          )}
          {airdrop.claimUrl && (airdrop.status === 'claimable' || airdrop.status === 'unclaimed') && (
            <a
              href={airdrop.claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 text-sm font-medium rounded-lg transition-colors"
            >
              Klaim →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AirdropResults({ results, walletAddress }) {
  const claimable = results.airdrops?.filter(a => a.status === 'claimable') || []
  const unclaimed = results.airdrops?.filter(a => a.status === 'unclaimed') || []
  const totalAirdrops = results.airdrops?.length || 0

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Total Ditemukan</p>
          <p className="text-2xl font-bold text-white">{totalAirdrops}</p>
          <p className="text-xs text-[var(--color-text-muted)]">airdrop di {results.checkedChains} jaringan</p>
        </div>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Bisa Diklaim</p>
          <p className="text-2xl font-bold text-green-400">{claimable.length + unclaimed.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">airdrop aktif</p>
        </div>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Estimasi Nilai</p>
          <p className="text-2xl font-bold text-indigo-400">
            {results.totalValue > 0
              ? `$${results.totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              : 'N/A'
            }
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">USD (dari Drops.bot)</p>
        </div>
      </div>

      {/* Info badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-indigo-300">
          Data real dari Drops.bot API • Dicek: {results.compatibleChains?.join(', ')} • {new Date(results.timestamp).toLocaleString('id-ID')}
        </p>
      </div>

      {/* Airdrop List */}
      {totalAirdrops > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Detail Airdrop</h2>
          {results.airdrops.map((airdrop, idx) => (
            <AirdropCard key={idx} airdrop={airdrop} />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[var(--color-text-muted)] text-lg">Tidak ada airdrop yang ditemukan</p>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">
            Wallet ini tidak memiliki airdrop yang belum diklaim di jaringan yang dipilih.
          </p>
          <p className="text-[var(--color-text-muted)] text-xs mt-3">
            Tip: Coba pilih lebih banyak jaringan atau gunakan alamat wallet lain.
          </p>
        </div>
      )}

      {/* Link to Drops.bot for full details */}
      <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
        <p className="text-[var(--color-text-muted)] text-sm mb-3">
          Lihat detail lengkap, claim link, dan history di Drops.bot
        </p>
        <a
          href={results.dropsUrl || `https://drops.bot/address/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-400 font-medium rounded-xl transition-colors"
        >
          Buka di Drops.bot
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
