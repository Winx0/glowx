export default function AirdropResults({ results, walletAddress }) {
  return (
    <div className="space-y-6">
      {/* Chain Balances */}
      <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-green-400 text-xs font-medium">● LIVE</span>
          <span className="text-xs text-[var(--color-text-muted)]">Public RPC — {results.activeChains}/{results.totalChains} chains aktif</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="text-left p-2">Chain</th>
                <th className="text-right p-2">Balance</th>
                <th className="text-right p-2">Tx Count</th>
                <th className="text-right p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.tokens.map((t, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-2 text-white">{t.chain}</td>
                  <td className="p-2 text-right font-mono text-white">
                    {t.balance !== null ? (t.balance < 0.0001 && t.balance > 0 ? '< 0.0001' : t.balance.toFixed(4)) : '-'} {t.symbol}
                  </td>
                  <td className="p-2 text-right text-[var(--color-text-muted)]">{t.txCount}</td>
                  <td className="p-2 text-right">
                    {t.balance > 0 || t.txCount > 0 ? (
                      <span className="text-green-400 text-xs">Aktif</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)] text-xs">Kosong</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drops.bot full airdrop check */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">Cek Airdrop Lengkap (388+ projects)</p>
        <p className="text-[var(--color-text-muted)] text-sm mb-4">Drops.bot — gratis, tanpa login, data real</p>
        <a
          href={results.dropsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20"
        >
          Cek Airdrop untuk {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} →
        </a>
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        {new Date(results.timestamp).toLocaleString('id-ID')}
      </p>
    </div>
  )
}
