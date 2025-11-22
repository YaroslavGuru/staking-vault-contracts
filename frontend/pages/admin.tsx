"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddresses, VAULT_ABI, RYAROSLAV_ABI } from "../utils/contract";
import Link from "next/link";
import Head from "next/head";

export default function Admin() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const addresses = getContractAddresses();
  const [rewardRate, setRewardRate] = useState("");
  const [fundAmount, setFundAmount] = useState("");

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: addresses.YaroslavStakingVault,
    abi: VAULT_ABI,
    functionName: "owner",
  });

  // Read current reward rate
  const { data: currentRewardRate, refetch: refetchRewardRate } = useReadContract({
    address: addresses.YaroslavStakingVault,
    abi: VAULT_ABI,
    functionName: "rewardRate",
  });

  // Read reward token balance
  const { data: rewardBalance, refetch: refetchRewardBalance } = useReadContract({
    address: addresses.YaroslavStakingVault,
    abi: VAULT_ABI,
    functionName: "getRewardTokenBalance",
  });

  // Read rYARO balance
  const { data: rYaroBalance, refetch: refetchRYaroBalance } = useReadContract({
    address: addresses.rYaroslav,
    abi: RYAROSLAV_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { writeContract: setRate, data: setRateHash } = useWriteContract();
  const { writeContract: fund, data: fundHash } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: setRateHash,
    onSuccess: () => {
      refetchRewardRate();
      setRewardRate("");
    },
  });

  useWaitForTransactionReceipt({
    hash: fundHash,
    onSuccess: () => {
      refetchRewardBalance();
      refetchRYaroBalance();
      setFundAmount("");
    },
  });

  const handleSetRewardRate = () => {
    if (!rewardRate) return;
    const rate = parseEther(rewardRate);
    setRate({
      address: addresses.YaroslavStakingVault,
      abi: VAULT_ABI,
      functionName: "setRewardRate",
      args: [rate],
    });
  };

  const handleFundRewards = () => {
    if (!fundAmount) return;
    const amount = parseEther(fundAmount);
    fund({
      address: addresses.YaroslavStakingVault,
      abi: VAULT_ABI,
      functionName: "fundRewards",
      args: [amount],
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = isConnected && address && owner && address.toLowerCase() === owner.toLowerCase();

  if (!mounted) {
    return (
      <>
        <Head>
          <title>Admin Panel - Yaroslav Staking Vault</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
          <h1>Admin Panel</h1>
          <p>Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Yaroslav Staking Vault</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        <h1>Admin Panel</h1>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
          Back to Dashboard
        </Link>

        {!isConnected ? (
          <div style={{ padding: "20px" }}>Please connect your wallet.</div>
        ) : !isOwner ? (
          <div style={{ padding: "20px", color: "red" }}>
            Access denied. Only the contract owner can access this page.
            <br />
            Owner: {owner}
            <br />
            Your address: {address}
          </div>
        ) : (
          <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "600px" }}>
            <h2>Vault Management</h2>

            <div style={{ marginBottom: "20px" }}>
              <h3>Current Status</h3>
              <p>Reward Rate: {currentRewardRate ? formatEther(currentRewardRate) : "0"} rYARO per second</p>
              <p>Vault Reward Balance: {rewardBalance ? formatEther(rewardBalance) : "0"} rYARO</p>
              <p>Your rYARO Balance: {rYaroBalance ? formatEther(rYaroBalance) : "0"} rYARO</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3>Set Reward Rate</h3>
              <input
                type="text"
                value={rewardRate}
                onChange={(e) => setRewardRate(e.target.value)}
                placeholder="Reward rate (rYARO per second)"
                style={{ padding: "8px", marginRight: "10px", width: "200px" }}
              />
              <button onClick={handleSetRewardRate} style={{ padding: "10px 20px", cursor: "pointer" }}>
                Set Rate
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3>Fund Rewards</h3>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Make sure you have approved the vault to spend your rYARO tokens first.
              </p>
              <input
                type="text"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Amount to fund"
                style={{ padding: "8px", marginRight: "10px", width: "200px" }}
              />
              <button onClick={handleFundRewards} style={{ padding: "10px 20px", cursor: "pointer" }}>
                Fund Rewards
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

