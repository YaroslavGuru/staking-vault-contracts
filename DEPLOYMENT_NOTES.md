# Deployment Notes

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

Required values:
- `SEPOLIA_RPC_URL`: Your Sepolia RPC endpoint (Infura or Alchemy)
- `DEPLOYER_PRIVATE_KEY`: Private key of deployer wallet (without 0x prefix)
- `ETHERSCAN_API_KEY`: (Optional) For contract verification
- `NEXT_PUBLIC_RPC_URL`: Same as SEPOLIA_RPC_URL for frontend
- `NEXT_PUBLIC_CONTRACT_ADDRESSES`: Will be filled after deployment

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm run test
```

Expected: All 34 tests passing ✅

### 5. Check Coverage

```bash
npm run coverage
```

Expected: ≥90% coverage ✅ (Current: 96.88%)

### 6. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

This will:
1. Deploy YARO token
2. Deploy rYARO token
3. Deploy YaroslavStakingVault
4. Print all contract addresses
5. Optionally verify on Etherscan (if API key provided)

### 7. Fund the Vault

After deployment, fund the vault with rewards:

```bash
# Set addresses in .env or modify fundRewards.ts
RYAROSLAV_ADDRESS=0x... VAULT_ADDRESS=0x... npx hardhat run scripts/fundRewards.ts --network sepolia
```

Or manually:
1. Mint rYARO tokens to your address
2. Approve vault to spend rYARO
3. Call `fundRewards(amount)` on vault
4. Call `setRewardRate(rate)` to set reward distribution rate

### 8. Setup Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESSES='{"Yaroslav":"0x...","rYaroslav":"0x...","YaroslavStakingVault":"0x..."}'
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Testing the Deployment

### Mint Test Tokens

To test staking, you'll need YARO tokens:

```typescript
// Using Hardhat console or a script
const yaroslav = await ethers.getContractAt("Yaroslav", YARO_ADDRESS);
await yaroslav.mint(USER_ADDRESS, ethers.parseEther("10000"));
```

### Test Flow

1. Connect wallet in frontend
2. Approve YARO tokens for staking
3. Deposit tokens
4. Wait for rewards to accumulate
5. Claim rewards
6. Withdraw tokens

## Gas Costs (Approximate)

Based on Hardhat gas reporter:
- `deposit`: ~80,000 - 120,000 gas
- `withdraw`: ~80,000 - 120,000 gas
- `claimRewards`: ~60,000 - 80,000 gas
- `setRewardRate`: ~45,000 gas
- `fundRewards`: ~50,000 gas

## Security Checklist

Before mainnet deployment:
- [ ] Professional security audit
- [ ] Multi-sig wallet for owner
- [ ] Timelock for admin functions
- [ ] Bug bounty program
- [ ] Formal verification (optional)
- [ ] Test on testnet extensively
- [ ] Review all access controls
- [ ] Document emergency procedures

## Troubleshooting

### "Insufficient funds" during deployment
- Ensure deployer wallet has Sepolia ETH
- Check gas prices

### Frontend can't connect
- Verify contract addresses in `.env.local`
- Check RPC URL is accessible
- Ensure wallet is connected to Sepolia network

### Tests failing locally
- Run `npm run compile` first
- Clear cache: `npx hardhat clean`
- Reinstall dependencies

## Next Steps

1. Deploy to Sepolia testnet
2. Test all functionality end-to-end
3. Get community feedback
4. Consider improvements from security.md
5. Plan mainnet deployment (after audit)

