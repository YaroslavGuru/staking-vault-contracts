"use client";

import { Address } from "viem";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import stakingVaultABI from "@/contracts/stakingVaultABI.json";

const STAKING_CONTRACT = (process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || "") as Address;
const YARO_TOKEN = (process.env.NEXT_PUBLIC_YARO_TOKEN_ADDRESS || "") as Address;

/**
 * Get user staking information
 */
export function useUserInfo(userAddress: Address | undefined) {
  return useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingVaultABI,
    functionName: "userInfo",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });
}

/**
 * Get pending rewards for a user
 */
export function usePendingRewards(userAddress: Address | undefined) {
  return useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingVaultABI,
    functionName: "pendingRewards",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    },
  });
}

/**
 * Get total staked amount
 */
export function useTotalStaked() {
  return useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingVaultABI,
    functionName: "totalStaked",
    query: {
      refetchInterval: 10000,
    },
  });
}

/**
 * Get reward rate
 */
export function useRewardRate() {
  return useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingVaultABI,
    functionName: "rewardRate",
  });
}

/**
 * Hook for depositing tokens
 */
export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = async (amount: bigint) => {
    if (!STAKING_CONTRACT) {
      throw new Error("Staking contract address not configured");
    }

    // First, check and approve if needed
    // For now, assuming approval is handled separately
    writeContract({
      address: STAKING_CONTRACT,
      abi: stakingVaultABI,
      functionName: "deposit",
      args: [amount],
    });
  };

  return {
    deposit,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for withdrawing tokens
 */
export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = async (amount: bigint) => {
    if (!STAKING_CONTRACT) {
      throw new Error("Staking contract address not configured");
    }

    writeContract({
      address: STAKING_CONTRACT,
      abi: stakingVaultABI,
      functionName: "withdraw",
      args: [amount],
    });
  };

  return {
    withdraw,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for claiming rewards
 */
export function useClaimRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimRewards = async () => {
    if (!STAKING_CONTRACT) {
      throw new Error("Staking contract address not configured");
    }

    writeContract({
      address: STAKING_CONTRACT,
      abi: stakingVaultABI,
      functionName: "claimRewards",
    });
  };

  return {
    claimRewards,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Get YARO token balance
 */
export function useYaroBalance(userAddress: Address | undefined) {
  const erc20ABI = [
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

  return useReadContract({
    address: YARO_TOKEN,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!YARO_TOKEN,
      refetchInterval: 10000,
    },
  });
}

/**
 * Get YARO token allowance
 */
export function useYaroAllowance(userAddress: Address | undefined) {
  const erc20ABI = [
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

  return useReadContract({
    address: YARO_TOKEN,
    abi: erc20ABI,
    functionName: "allowance",
    args: userAddress && STAKING_CONTRACT ? [userAddress, STAKING_CONTRACT] : undefined,
    query: {
      enabled: !!userAddress && !!STAKING_CONTRACT && !!YARO_TOKEN,
      refetchInterval: 10000,
    },
  });
}

/**
 * Hook for approving YARO tokens
 */
export function useApproveYaro() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amount: bigint) => {
    if (!YARO_TOKEN || !STAKING_CONTRACT) {
      throw new Error("Token or contract address not configured");
    }

    const erc20ABI = [
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ] as const;

    writeContract({
      address: YARO_TOKEN,
      abi: erc20ABI,
      functionName: "approve",
      args: [STAKING_CONTRACT, amount],
    });
  };

  return {
    approve,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

