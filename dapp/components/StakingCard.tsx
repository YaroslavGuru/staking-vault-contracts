"use client";

import { useAccount } from "wagmi";
import { formatTokenAmount, parseTokenAmount, truncateDecimals } from "@/lib/utils";
import { useUserInfo, useYaroBalance, useYaroAllowance, useApproveYaro, useDeposit, useWithdraw } from "@/lib/staking";
import InputBox from "./InputBox";
import { useState, useEffect } from "react";

export default function StakingCard() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: userInfo, refetch: refetchUserInfo } = useUserInfo(address);
  const { data: yaroBalance, refetch: refetchYaroBalance } = useYaroBalance(address);
  const { data: allowance, refetch: refetchAllowance } = useYaroAllowance(address);

  const { approve, isPending: isApproving, isSuccess: isApproveSuccess } = useApproveYaro();
  const { deposit, isPending: isDepositing, isSuccess: isDepositSuccess } = useDeposit();
  const { withdraw, isPending: isWithdrawing, isSuccess: isWithdrawSuccess } = useWithdraw();

  // Refetch data after successful transactions
  useEffect(() => {
    if (isApproveSuccess || isDepositSuccess) {
      refetchUserInfo();
      refetchYaroBalance();
      refetchAllowance();
      setDepositAmount("");
    }
  }, [isApproveSuccess, isDepositSuccess, refetchUserInfo, refetchYaroBalance, refetchAllowance]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchUserInfo();
      refetchYaroBalance();
      setWithdrawAmount("");
    }
  }, [isWithdrawSuccess, refetchUserInfo, refetchYaroBalance]);

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please connect your wallet to view staking options
        </p>
      </div>
    );
  }

  const stakedAmount = userInfo ? formatTokenAmount(userInfo[0]) : "0";
  const needsApproval =
    depositAmount &&
    allowance !== undefined &&
    parseTokenAmount(depositAmount) > allowance;

  const handleDeposit = async () => {
    if (!depositAmount) return;
    const amount = parseTokenAmount(depositAmount);
    if (needsApproval) {
      await approve(amount);
    } else {
      await deposit(amount);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    const amount = parseTokenAmount(withdrawAmount);
    await withdraw(amount);
  };

  const handleMaxDeposit = () => {
    if (yaroBalance) {
      setDepositAmount(formatTokenAmount(yaroBalance));
    }
  };

  const handleMaxWithdraw = () => {
    if (userInfo) {
      setWithdrawAmount(formatTokenAmount(userInfo[0]));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staking</h2>

      {/* Staking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Staked Amount</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {truncateDecimals(stakedAmount)} YARO
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">YARO Balance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {truncateDecimals(formatTokenAmount(yaroBalance))} YARO
          </p>
        </div>
      </div>

      {/* Deposit */}
      <div className="space-y-2">
        <InputBox
          label="Deposit YARO"
          placeholder="0.0"
          value={depositAmount}
          onChange={setDepositAmount}
          onAction={handleDeposit}
          actionLabel={needsApproval ? "Approve" : "Deposit"}
          disabled={!yaroBalance || yaroBalance === 0n}
          isLoading={isApproving || isDepositing}
          maxValue={yaroBalance ? formatTokenAmount(yaroBalance) : undefined}
          onMaxClick={handleMaxDeposit}
        />
        {(!yaroBalance || yaroBalance === 0n) && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ You need YARO tokens to stake. Get tokens from the deployer or faucet.
          </p>
        )}
      </div>

      {/* Withdraw */}
      <InputBox
        label="Withdraw YARO"
        placeholder="0.0"
        value={withdrawAmount}
        onChange={setWithdrawAmount}
        onAction={handleWithdraw}
        actionLabel="Withdraw"
        disabled={!userInfo || userInfo[0] === 0n}
        isLoading={isWithdrawing}
        maxValue={stakedAmount}
        onMaxClick={handleMaxWithdraw}
      />
    </div>
  );
}

