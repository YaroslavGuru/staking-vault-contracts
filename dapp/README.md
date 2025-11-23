# Yaroslav Staking Vault - Web3 DApp

A production-ready Web3 frontend DApp for the Yaroslav Staking Vault smart contract. Built with Next.js 14, TypeScript, TailwindCSS, and RainbowKit.

## Overview

This DApp provides a user-friendly interface for interacting with the Yaroslav Staking Vault smart contract on Ethereum Sepolia testnet. Users can stake YARO tokens and earn rYARO rewards through an intuitive dashboard.

## Features

- 🔐 **Wallet Connection**: Seamless wallet connection using RainbowKit
- 📊 **Real-time Data**: Live updates of staking balances and pending rewards
- 💰 **Deposit & Withdraw**: Easy staking and unstaking of YARO tokens
- 🎁 **Claim Rewards**: One-click reward claiming
- 📱 **Responsive Design**: Mobile-first, beautiful UI with TailwindCSS
- ⚡ **Fast & Optimized**: Built with Next.js 14 App Router
- 🔄 **Auto-refresh**: Automatic data updates every 5-10 seconds

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: Wagmi v2, viem, RainbowKit
- **State Management**: React Query (TanStack Query)
- **Deployment**: Vercel-ready

## Project Structure

```
dapp/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── dashboard/
│   │   └── page.tsx        # Staking dashboard
│   ├── providers.tsx       # Wagmi & RainbowKit providers
│   └── globals.css         # Global styles
├── components/
│   ├── ConnectWalletButton.tsx  # Wallet connection UI
│   ├── StakingCard.tsx          # Deposit/Withdraw interface
│   ├── RewardsCard.tsx          # Rewards display & claim
│   └── InputBox.tsx             # Reusable input component
├── lib/
│   ├── wagmi.ts            # Wagmi configuration
│   ├── staking.ts          # Contract interaction hooks
│   └── utils.ts            # Utility functions
├── contracts/
│   └── stakingVaultABI.json    # Contract ABI
└── public/
```

## Setup Guide

### Prerequisites

- Node.js >= 20
- npm or yarn
- A Web3 wallet (MetaMask, Rainbow, etc.)

### Installation

1. **Clone the repository** (if not already done):
```bash
cd dapp
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
Create a `.env.local` file in the `dapp` directory:

```env
# RPC URL for Sepolia testnet
NEXT_PUBLIC_RPC_URL=https://rpc2.sepolia.org

# Staking Vault Contract Address (Sepolia)
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF

# YARO Token Address (for approval)
NEXT_PUBLIC_YARO_TOKEN_ADDRESS=0x8a7153ee7B982744E94CA8CE7682D0451D3924bd

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint for Sepolia | Yes |
| `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS` | Staking vault contract address | Yes |
| `NEXT_PUBLIC_YARO_TOKEN_ADDRESS` | YARO token contract address | Yes |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | No |

## How to Use

### 1. Connect Your Wallet

- Click "Connect Wallet" on the home page or dashboard
- Select your preferred wallet (MetaMask, Rainbow, etc.)
- Approve the connection request

### 2. Deposit YARO Tokens

1. Navigate to the Dashboard
2. Enter the amount of YARO you want to stake
3. Click "Approve" if this is your first deposit (approves token spending)
4. Click "Deposit" to stake your tokens
5. Confirm the transaction in your wallet

### 3. View Rewards

- Your pending rewards are displayed in real-time
- Rewards accumulate based on your staked amount and the reward rate

### 4. Claim Rewards

- Click "Claim Rewards" to receive your rYARO tokens
- This doesn't affect your staked YARO tokens

### 5. Withdraw Staked Tokens

1. Enter the amount you want to withdraw
2. Click "Withdraw"
3. Confirm the transaction
4. Your rewards are automatically claimed on withdrawal

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project in Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**:
   - Add all environment variables from `.env.local`
   - Use the same values as your local setup

4. **Deploy**:
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your DApp will be live in minutes!

### Manual Build

```bash
npm run build
npm start
```

## Contract Interaction Flow

### Deposit Flow
1. User enters deposit amount
2. Check token allowance
3. If insufficient, request approval
4. Call `deposit(amount)` on contract
5. Wait for transaction confirmation
6. Refresh user data

### Withdraw Flow
1. User enters withdraw amount
2. Call `withdraw(amount)` on contract
3. Contract automatically claims pending rewards
4. Wait for transaction confirmation
5. Refresh user data

### Claim Flow
1. User clicks "Claim Rewards"
2. Call `claimRewards()` on contract
3. Wait for transaction confirmation
4. Refresh pending rewards

## Features in Detail

### Real-time Updates
- Pending rewards refresh every 5 seconds
- User info and balances refresh every 10 seconds
- Automatic refetch after successful transactions

### Error Handling
- Transaction errors are displayed to users
- Network errors are handled gracefully
- Loading states for all async operations

### User Experience
- Clean, modern UI with TailwindCSS
- Responsive design for all screen sizes
- Dark mode support
- Loading indicators for all actions
- Disabled states for invalid inputs

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Reusable UI components in `/components`
- **Hooks**: Custom React hooks in `/lib/staking.ts`
- **Utils**: Helper functions in `/lib/utils.ts`
- **Pages**: Next.js pages in `/app`

## Troubleshooting

### Wallet Connection Issues
- Ensure you're on Sepolia testnet
- Check that your wallet is unlocked
- Try disconnecting and reconnecting

### Transaction Failures
- Check you have enough ETH for gas
- Verify you have sufficient YARO balance
- Ensure contract is not paused

### Data Not Loading
- Check RPC URL is correct and accessible
- Verify contract addresses are correct
- Check browser console for errors

## Security Considerations

- Never commit `.env.local` to version control
- Always verify contract addresses before use
- Use testnet for development and testing
- Review all transactions before confirming

## Support

For issues or questions:
- Check the [architecture documentation](./docs/architecture.md)
- Review contract documentation
- Open an issue on GitHub

## License

MIT

