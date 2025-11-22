# Architecture Documentation

## Overview

The Yaroslav Staking Vault is a DeFi protocol that allows users to stake YARO tokens and earn rYARO rewards based on a configurable reward rate.

## System Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│  Wagmi + Viem   │
└────────┬────────┘
         │
         │ RPC Calls
         │
┌────────▼─────────────────────────────────────┐
│         Ethereum Sepolia Network             │
│                                              │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   YARO       │  │   rYARO      │        │
│  │  (ERC20)     │  │  (ERC20)     │        │
│  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │
│         └────────┬────────┘                 │
│                  │                          │
│         ┌────────▼──────────┐              │
│         │ Staking Vault     │              │
│         │ (Main Contract)   │              │
│         └───────────────────┘              │
└──────────────────────────────────────────────┘
```

## Contract Architecture

### YaroslavStakingVault

The main staking contract implements the following pattern:

#### Reward Distribution Model

The contract uses an **accumulator pattern** (similar to MasterChef) for efficient reward calculation:

1. **accRewardPerShare**: Accumulated rewards per share, scaled by PRECISION (1e18)
2. **rewardDebt**: User's share of already distributed rewards
3. **rewardRate**: Tokens per second distributed to all stakers

#### Reward Calculation Formula

```
accRewardPerShare += (rewardRate * timeElapsed * PRECISION) / totalStaked
userReward = (userAmount * accRewardPerShare) / PRECISION - userRewardDebt
```

#### Key Functions

- **deposit(amount)**: Stake tokens and update reward accounting
- **withdraw(amount)**: Unstake tokens and claim pending rewards
- **claimRewards()**: Claim pending rewards without unstaking
- **emergencyWithdraw()**: Withdraw staked tokens without claiming (forfeits rewards)
- **setRewardRate(rate)**: Admin function to update reward rate
- **fundRewards(amount)**: Admin function to add reward tokens to the vault

### Security Features

1. **ReentrancyGuard**: Prevents reentrancy attacks on state-changing functions
2. **Pausable**: Allows owner to pause contract in case of emergency
3. **Ownable**: Restricts admin functions to contract owner
4. **SafeERC20**: Uses OpenZeppelin's SafeERC20 for token transfers

## Data Flow

### Deposit Flow

1. User approves YARO tokens to vault
2. User calls `deposit(amount)`
3. Contract updates rewards accumulator
4. Contract claims any pending rewards for user
5. Contract transfers YARO from user to vault
6. Contract updates user's staked amount and reward debt

### Reward Claim Flow

1. User calls `claimRewards()` or rewards are auto-claimed on deposit/withdraw
2. Contract calculates pending rewards: `(amount * accRewardPerShare) / PRECISION - rewardDebt`
3. Contract transfers rYARO tokens to user
4. Contract updates user's reward debt

### Withdraw Flow

1. User calls `withdraw(amount)`
2. Contract updates rewards accumulator
3. Contract claims pending rewards
4. Contract updates user's staked amount and reward debt
5. Contract transfers YARO back to user

## Frontend Architecture

### Components

- **WalletConnect**: Handles wallet connection using Wagmi
- **StakingCard**: Main staking interface (deposit, withdraw, claim)
- **Admin Panel**: Owner-only interface for managing vault

### State Management

- Uses Wagmi hooks for blockchain interactions
- React Query for data fetching and caching
- Automatic refetching of pending rewards every 5 seconds

## Deployment Architecture

### Contracts Deployment Order

1. Deploy Yaroslav (YARO) token
2. Deploy rYaroslav (rYARO) token
3. Deploy YaroslavStakingVault with token addresses
4. Fund vault with rYARO tokens
5. Set initial reward rate

### Network Configuration

- **Development**: Hardhat local network
- **Testing**: Hardhat network with forking (optional)
- **Production**: Ethereum Sepolia testnet

## Gas Optimization

1. **Minimal Storage Writes**: Updates accumulator only when needed
2. **Unchecked Math**: Used where safe (after validation)
3. **Batch Operations**: Rewards auto-claimed on deposit/withdraw
4. **Efficient Calculations**: Uses scaled arithmetic to avoid precision loss

## Scalability Considerations

- Contract supports unlimited number of stakers
- Reward calculations scale with O(1) complexity per user
- Frontend uses pagination-ready patterns (if needed for large user bases)

