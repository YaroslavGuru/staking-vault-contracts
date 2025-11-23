import Link from "next/link";
import ConnectWalletButton from "@/components/ConnectWalletButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            Yaroslav Staking Vault
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Stake your YARO tokens and earn rYARO rewards
          </p>

          <div className="pt-8">
            <ConnectWalletButton />
          </div>

          <div className="pt-12">
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            >
              Go to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Secure Staking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your tokens are secured by audited smart contracts on Ethereum
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Earn Rewards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn rYARO rewards based on your staked amount and time
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Flexible Withdrawal
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Withdraw your staked tokens anytime and claim your rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

