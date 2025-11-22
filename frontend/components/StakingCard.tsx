"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddresses, VAULT_ABI, YAROSLAV_ABI } from "../utils/contract";

export default function StakingCard() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const addresses = getContractAddresses();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read user info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: addresses.YaroslavStakingVault,
    abi: VAULT_ABI,
    functionName: "userInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read pending rewards
  const { data: pendingRewards, refetch: refetchPending } = useReadContract({
    address: addresses.YaroslavStakingVault,
    abi: VAULT_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Read YARO balance
  const { data: yaroBalance, refetch: refetchYaroBalance } = useReadContract({
    address: addresses.Yaroslav,
    abi: YAROSLAV_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: addresses.Yaroslav,
    abi: YAROSLAV_ABI,
    functionName: "allowance",
    args: address && addresses.YaroslavStakingVault ? [address, addresses.YaroslavStakingVault] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash } = useWriteContract();
  const { writeContract: claim, data: claimHash } = useWriteContract();

  // Wait for transactions
  useWaitForTransactionReceipt({ hash: approveHash, onSuccess: () => refetchAllowance() });
  useWaitForTransactionReceipt({
    hash: depositHash,
    onSuccess: () => {
      refetchUserInfo();
      refetchYaroBalance();
      refetchPending();
      setDepositAmount("");
    },
  });
  useWaitForTransactionReceipt({
    hash: withdrawHash,
    onSuccess: () => {
      refetchUserInfo();
      refetchYaroBalance();
      refetchPending();
      setWithdrawAmount("");
    },
  });
  useWaitForTransactionReceipt({
    hash: claimHash,
    onSuccess: () => {
      refetchPending();
    },
  });

  const handleApprove = () => {
    if (!address || !depositAmount) return;
    const amount = parseEther(depositAmount);
    approve({
      address: addresses.Yaroslav,
      abi: YAROSLAV_ABI,
      functionName: "approve",
      args: [addresses.YaroslavStakingVault, amount],
    });
  };

  const handleDeposit = () => {
    if (!depositAmount) return;
    const amount = parseEther(depositAmount);
    deposit({
      address: addresses.YaroslavStakingVault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [amount],
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    const amount = parseEther(withdrawAmount);
    withdraw({
      address: addresses.YaroslavStakingVault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [amount],
    });
  };

  const handleClaim = () => {
    claim({
      address: addresses.YaroslavStakingVault,
      abi: VAULT_ABI,
      functionName: "claimRewards",
      args: [],
    });
  };

  if (!mounted) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!isConnected) {
    return <div style={{ padding: "20px" }}>Please connect your wallet to view staking dashboard.</div>;
  }

  const stakedAmount = userInfo ? formatEther(userInfo[0]) : "0";
  const needsApproval =
    depositAmount &&
    allowance !== undefined &&
    parseEther(depositAmount) > allowance;

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "600px" }}>
      <h2>Staking Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Your Staking Info</h3>
        <p>Staked: {stakedAmount} YARO</p>
        <p>Pending Rewards: {pendingRewards ? formatEther(pendingRewards) : "0"} rYARO</p>
        <p>YARO Balance: {yaroBalance ? formatEther(yaroBalance) : "0"} YARO</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Deposit</h3>
        <input
          type="text"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount to deposit"
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        {needsApproval ? (
          <button onClick={handleApprove} style={{ padding: "10px 20px", cursor: "pointer" }}>
            Approve
          </button>
        ) : (
          <button onClick={handleDeposit} style={{ padding: "10px 20px", cursor: "pointer" }}>
            Deposit
          </button>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Withdraw</h3>
        <input
          type="text"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount to withdraw"
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        <button onClick={handleWithdraw} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Withdraw
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Claim Rewards</h3>
        <button onClick={handleClaim} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Claim Rewards
        </button>
      </div>
    </div>
  );
}

