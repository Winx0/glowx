export default function WalletInput({ walletAddress, setWalletAddress, onCheck, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onCheck()
    }
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-6">
      <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-3">
        Alamat Wallet
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0x... / alamat Solana / alamat Cosmos / alamat SUI"
          className="flex-1 px-4 py-3 bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          disabled={loading}
        />
        <button
          onClick={onCheck}
          disabled={loading || !walletAddress.trim()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 whitespace-nowrap"
        >
          {loading ? 'Mengecek...' : 'Cek Airdrop'}
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        Mendukung: EVM (Ethereum, Arbitrum, Optimism, Base, Polygon, etc.), Solana, SUI, Aptos, Cosmos
      </p>
    </div>
  )
}
