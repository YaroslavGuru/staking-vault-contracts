import ConnectWalletButton from "@/components/ConnectWalletButton";
import StakingCard from "@/components/StakingCard";
import RewardsCard from "@/components/RewardsCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Staking Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your YARO staking and rewards
              </p>
            </div>
            <ConnectWalletButton />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StakingCard />
            <RewardsCard />
          </div>

          {/* Info Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 mb-6">
              <p>
                <strong className="text-gray-900 dark:text-white">1. Get YARO Tokens:</strong> You need YARO tokens to stake. 
                Contact the deployer or use a faucet to get test tokens.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">2. Approve (First Time):</strong> Approve the vault to spend your YARO tokens
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">3. Deposit:</strong> Deposit your YARO tokens to start earning rewards
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">4. Earn:</strong> Accumulate
                rYARO rewards based on your staked amount and the reward rate
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">5. Claim:</strong> Claim your
                rewards at any time without withdrawing your staked tokens
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">6. Withdraw:</strong> Withdraw
                your staked tokens anytime. Rewards are automatically claimed on withdrawal
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📝 Need Help?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                If the deposit button is disabled, you need YARO tokens first. Check the{" "}
                <a 
                  href="/USER_GUIDE.md" 
                  target="_blank"
                  className="underline font-medium"
                >
                  Complete User Guide
                </a>{" "}
                for detailed instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

