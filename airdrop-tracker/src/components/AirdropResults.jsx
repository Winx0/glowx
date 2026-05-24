export default function AirdropResults({ results, walletAddress }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Total Tokens</p>
          <p className="text-2xl font-bold text-white">{results.totalTokens}</p>
        </div>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Total Nilai</p>
          <p className="text-2xl font-bold text-green-400">${results.totalUsd.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-1">Chains Dicek</p>
          <p className="text-2xl font-bold text-indigo-400">{results.chainsChecked}</p>
        </div>
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <span className="text-green-400 text-xs font-medium">● LIVE</span>
        <span className="text-xs text-[var(--color-text-muted)]">Ankr API • {results.compatibleChains.join(', ')}</span>
      </div>

      {/* Token Balances */}
      {results.tokens.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3">Token Balances</h3>
          <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <th className="text-left p-3">Token</th>
                  <th className="text-left p-3">Chain</th>
                  <th className="text-right p-3">Balance</th>
                  <th className="text-right p-3">USD</th>
                </tr>
              </thead>
              <tbody>
                {results.tokens.slice(0, 30).map((t, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-card-hover)]">
                    <td className="p-3 text-white font-medium">{t.symbol}</td>
                    <td className="p-3 text-[var(--color-text-muted)]">{t.chain}</td>
                    <td className="p-3 text-right text-white font-mono">{t.balance < 0.001 ? '< 0.001' : t.balance.toFixed(4)}</td>
                    <td className="p-3 text-right text-green-400">${t.balanceUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.tokens.length === 0 && (
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <p className="text-[var(--color-text-muted)]">Tidak ada token ditemukan di wallet ini.</p>
        </div>
      )}

      {/* Drops.bot full airdrop check */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">Cek Airdrop Lengkap (388+ projects)</p>
        <p className="text-[var(--color-text-muted)] text-sm mb-4">Drops.bot — gratis, tanpa login</p>
        <a
          href={results.dropsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20"
        >
          Buka Drops.bot →
        </a>
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        {new Date(results.timestamp).toLocaleString('id-ID')}
      </p>
    </div>
  )
}
