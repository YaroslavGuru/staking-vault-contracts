# Yaroslav Staking Vault

A production-quality staking vault for the Yaroslav (YARO) token with rewards in Yaroslav Reward Token (rYARO). Built with Hardhat, TypeScript, and Next.js.

## Overview

This project implements a complete staking system where users can:
- Stake YARO tokens
- Earn rYARO rewards based on a configurable reward rate
- Withdraw staked tokens and claim rewards
- Access an admin panel for vault management (owner-only)

## Features

- ✅ ERC-20 staking token (YARO) and reward token (rYARO)
- ✅ Initial token distribution on deployment (deployer, treasury, liquidity pool)
- ✅ Efficient reward distribution using accumulator pattern
- ✅ ReentrancyGuard, Pausable, and Ownable security features
- ✅ Comprehensive test suite with >90% coverage
- ✅ Next.js front-end with Wagmi integration
- ✅ Deployment scripts for Sepolia testnet
- ✅ Gas-optimized contract design

## Tech Stack

- **Smart Contracts**: Solidity ^0.8.20, OpenZeppelin Contracts
- **Development**: Hardhat, TypeScript, Ethers v6
- **Testing**: Mocha, Chai, Hardhat Network Helpers
- **Frontend**: Next.js 14, React, Wagmi, Viem
- **Linting**: ESLint, Prettier

## Project Structure

```
staking-vault-contracts/
├── contracts/
│   ├── Yaroslav.sol              # Staking token (YARO)
│   ├── rYaroslav.sol             # Reward token (rYARO)
│   └── YaroslavStakingVault.sol  # Main staking contract
├── scripts/
│   ├── deploy.ts                 # Deployment script
│   └── fundRewards.ts            # Helper to fund vault
├── test/
│   ├── staking.test.ts           # Main test suite
│   └── reward-model.test.ts      # Reward calculation tests
├── frontend/
│   ├── pages/
│   │   ├── index.tsx             # Staking dashboard
│   │   └── admin.tsx              # Admin panel
│   └── components/
│       ├── WalletConnect.tsx
│       └── StakingCard.tsx
├── docs/
│   ├── architecture.md           # System architecture
│   └── security.md                # Security considerations
└── hardhat.config.ts
```

## Setup & Installation

### Prerequisites

- Node.js >= 20
- npm or yarn
- An Ethereum wallet with Sepolia ETH (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd staking-vault-contracts
```

2. Install dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Fill in your `.env` file:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here  # Optional
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CONTRACT_ADDRESSES='{"Yaroslav":"0x...","rYaroslav":"0x...","YaroslavStakingVault":"0x..."}'
```

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run coverage
```

### Generate Gas Report

```bash
REPORT_GAS=true npm run test
```

## Deployment

### Deploy to Sepolia

1. Ensure your `.env` file has `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` set
2. Make sure your deployer wallet has Sepolia ETH for gas
3. (Optional) Set `TREASURY_ADDRESS` and `LIQUIDITY_POOL_ADDRESS` for custom distribution

4. Deploy contracts:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

The script will:
- Deploy YARO token with initial distribution (1B tokens: 40% deployer, 30% treasury, 30% liquidity)
- Deploy rYARO token with initial distribution (100M tokens: 50% deployer, 50% treasury)
- Deploy YaroslavStakingVault
- Print all contract addresses and distribution details
- Optionally verify contracts on Etherscan (if `ETHERSCAN_API_KEY` is set)

**Note**: See [docs/token-distribution.md](./docs/token-distribution.md) for details on customizing the distribution.

4. Fund the vault with rewards:
```bash
# Set addresses in .env or modify fundRewards.ts
RYAROSLAV_ADDRESS=0x... VAULT_ADDRESS=0x... npx hardhat run scripts/fundRewards.ts --network sepolia
```

5. Update frontend `.env`:
   - Copy the contract addresses from deployment output
   - Update `NEXT_PUBLIC_CONTRACT_ADDRESSES` in `frontend/.env.local`

### Verify Contracts on Etherscan

If you set `ETHERSCAN_API_KEY` in `.env`, contracts will be automatically verified after deployment.

Manual verification:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
npx hardhat verify --network sepolia 0x... 0x... 0x... 0x...
```

## Frontend

### Run Frontend Locally

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CONTRACT_ADDRESSES='{"Yaroslav":"0x...","rYaroslav":"0x...","YaroslavStakingVault":"0x..."}'
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Frontend Features

- **Dashboard**: Connect wallet, view staked balance, pending rewards, deposit/withdraw/claim
- **Admin Panel**: Set reward rate, fund rewards (owner-only)

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Testing Guide

### Local Testing

1. **Mint Test Tokens**:
   - After deployment, use the owner account to mint YARO tokens to test users
   - Example: `npx hardhat run scripts/mintTokens.ts --network sepolia` (create this script if needed)

2. **Test Staking Flow**:
   - Connect wallet in frontend
   - Approve YARO tokens
   - Deposit tokens
   - Wait for rewards to accumulate
   - Claim rewards
   - Withdraw tokens

### Test Coverage

The test suite covers:
- ✅ Deposit/withdraw/claim functionality
- ✅ Reward calculations
- ✅ Admin functions
- ✅ Paused state behavior
- ✅ Multiple users
- ✅ Edge cases (zero amounts, full withdraw, etc.)
- ✅ Reward rate changes

Run coverage:
```bash
npm run coverage
```

Target: **≥90% coverage** ✅

## Gas Optimization

Key gas optimizations implemented:
- Minimal storage writes (update accumulator only when needed)
- Efficient reward calculation pattern
- Batch operations (auto-claim on deposit/withdraw)

Gas report available in `gas-report.txt` after running tests with `REPORT_GAS=true`.

## Security

See [docs/security.md](./docs/security.md) for detailed security considerations.

Key security features:
- ReentrancyGuard on all state-changing functions
- Pausable for emergency stops
- Ownable for access control
- SafeERC20 for token transfers
- Input validation

## Architecture

See [docs/architecture.md](./docs/architecture.md) for detailed architecture documentation.

## Troubleshooting

### "Insufficient funds" error
- Ensure your deployer wallet has Sepolia ETH
- Check gas prices on [ETH Gas Station](https://ethgasstation.info/)

### Frontend can't connect to contracts
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESSES` is correctly formatted JSON
- Ensure RPC URL is correct and accessible
- Check browser console for errors

### Tests failing
- Run `npm run compile` first
- Ensure all dependencies are installed
- Check Hardhat network configuration

### Contract verification fails
- Wait 30-60 seconds after deployment before verifying
- Ensure constructor arguments match exactly
- Check Etherscan API key is valid

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass and coverage ≥90%
6. Submit a pull request

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check documentation in `docs/` folder
- Review test files for usage examples

## Next Steps

Recommended improvements:
1. Add timelock for admin functions
2. Implement multi-sig for owner
3. Add reward rate limits
4. Create migration script for contract upgrades
5. Add frontend error handling improvements
6. Implement reward history tracking

---

**⚠️ Disclaimer**: This is a testnet deployment. For mainnet, conduct a professional security audit and use multi-sig wallets.

