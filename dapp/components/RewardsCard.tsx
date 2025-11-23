"use client";

import { useAccount } from "wagmi";
import { formatTokenAmount, truncateDecimals } from "@/lib/utils";
import { usePendingRewards, useTotalStaked, useRewardRate, useClaimRewards } from "@/lib/staking";
import { useEffect } from "react";

export default function RewardsCard() {
  const { address, isConnected } = useAccount();
  const { data: pendingRewards, refetch: refetchPending } = usePendingRewards(address);
  const { data: totalStaked } = useTotalStaked();
  const { data: rewardRate } = useRewardRate();
  const { claimRewards, isPending: isClaiming, isSuccess: isClaimSuccess } = useClaimRewards();

  useEffect(() => {
    if (isClaimSuccess) {
      refetchPending();
    }
  }, [isClaimSuccess, refetchPending]);

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please connect your wallet to view rewards
        </p>
      </div>
    );
  }

  const pendingRewardsFormatted = formatTokenAmount(pendingRewards as bigint | undefined);
  const totalStakedFormatted = formatTokenAmount(totalStaked as bigint | undefined);
  const rewardRateFormatted = formatTokenAmount(rewardRate as bigint | undefined);

  const handleClaim = async () => {
    const rewards = pendingRewards as bigint | undefined;
    if (rewards && rewards > 0n) {
      await claimRewards();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards</h2>

      {/* Pending Rewards */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Rewards</p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          {truncateDecimals(pendingRewardsFormatted)} rYARO
        </p>
        <button
          onClick={handleClaim}
          disabled={!pendingRewards || (pendingRewards as bigint) === 0n || isClaiming}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
        >
          {isClaiming ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Claiming...
            </span>
          ) : (
            "Claim Rewards"
          )}
        </button>
      </div>

      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Staked</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {truncateDecimals(totalStakedFormatted)} YARO
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Reward Rate</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {truncateDecimals(rewardRateFormatted)} rYARO/s
          </p>
        </div>
      </div>
    </div>
  );
}

