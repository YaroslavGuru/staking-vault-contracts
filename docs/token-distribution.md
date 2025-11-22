# Token Distribution Guide

## Overview

Both Yaroslav (YARO) and rYaroslav (rYARO) tokens now support initial distribution on deployment. This allows you to allocate tokens to multiple addresses (deployer, treasury, liquidity pool, etc.) during contract deployment.

## Distribution Configuration

### Default Distribution (in deploy.ts)

**YARO Token (1,000,000,000 total supply):**
- 40% to Deployer (400M YARO)
- 30% to Treasury (300M YARO)
- 30% to Liquidity Pool (300M YARO)

**rYARO Token (100,000,000 initial supply):**
- 50% to Deployer (50M rYARO) - for vault funding
- 50% to Treasury (50M rYARO)

### Customizing Distribution

You can customize the distribution by setting environment variables before deployment:

```bash
# Set custom addresses
export TREASURY_ADDRESS=0x...
export LIQUIDITY_POOL_ADDRESS=0x...

# Or modify deploy.ts directly to change percentages
```

### Constructor Parameters

Both tokens accept:
- `initialOwner`: Address that will own the contract
- `recipients`: Array of addresses to receive tokens
- `amounts`: Array of token amounts (must match recipients length)

**Example:**
```solidity
address[] memory recipients = [deployer, treasury, liquidityPool];
uint256[] memory amounts = [
    ethers.parseEther("400000000"),  // 400M to deployer
    ethers.parseEther("300000000"),  // 300M to treasury
    ethers.parseEther("300000000")   // 300M to liquidity
];
```

## Deployment Options

### Option 1: With Distribution (Default)

The deployment script automatically distributes tokens:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Option 2: No Distribution (Empty Arrays)

If you want to deploy without initial distribution, modify `deploy.ts` to pass empty arrays:
```typescript
const yaroslav = await Yaroslav.deploy(deployer.address, [], []);
const rYaroslav = await rYaroslav.deploy(deployer.address, [], []);
```

Tokens can still be minted later using the `mint()` function.

## Distribution Best Practices

1. **Treasury Address**: Use a multi-sig wallet for treasury funds
2. **Liquidity Pool**: Allocate tokens for DEX liquidity provision
3. **Vesting**: Consider implementing vesting contracts for team allocations
4. **Transparency**: Document distribution percentages publicly

## Verification

When verifying contracts on Etherscan, you must provide the exact constructor arguments:

```bash
npx hardhat verify --network sepolia \
  --contract contracts/Yaroslav.sol:Yaroslav \
  <CONTRACT_ADDRESS> \
  <OWNER_ADDRESS> \
  "[<RECIPIENT1>,<RECIPIENT2>,<RECIPIENT3>]" \
  "[<AMOUNT1>,<AMOUNT2>,<AMOUNT3>]"
```

Or use the `scripts/verify.ts` script with environment variables set.

## Security Considerations

- Distribution happens in the constructor, so it's immutable after deployment
- Ensure recipient addresses are correct before deployment
- Double-check amounts to avoid mistakes
- Consider using a deployment script that validates addresses and amounts

## Example Distribution Scenarios

### Scenario 1: Standard DeFi Project
- 20% Team (vested)
- 30% Treasury
- 30% Liquidity Pool
- 20% Public Sale

### Scenario 2: Community-Focused
- 10% Team
- 40% Community Treasury
- 40% Liquidity Pool
- 10% Partnerships

### Scenario 3: Minimal Distribution
- 100% to Deployer (for manual distribution later)

## Post-Deployment

After deployment with distribution:
1. Verify token balances on Etherscan
2. Transfer treasury tokens to multi-sig if needed
3. Fund liquidity pools
4. Document distribution in project documentation

