# Complete User Guide - How to Use the Staking Vault dApp

## 🚀 Getting Started

### Step 1: Prerequisites

Before you can use the dApp, you need:

1. **A Web3 Wallet** (MetaMask, Rainbow, Coinbase Wallet, etc.)
2. **Sepolia ETH** for gas fees (get free testnet ETH from faucets)
3. **YARO Tokens** to stake (see Step 2 below)

### Step 2: Get YARO Tokens

You need YARO tokens to stake. Here's how to get them:

#### Option A: Request from Deployer (Easiest)

1. Contact the contract deployer/owner
2. Provide your wallet address
3. They can mint YARO tokens to your address

#### Option B: Use a Test Token Faucet

If the deployer has set up a faucet, you can request tokens there.

#### Option C: Get from Another User

If you know someone with YARO tokens, they can send you some.

**Contract Addresses (Sepolia):**
- YARO Token: `0x8a7153ee7B982744E94CA8CE7682D0451D3924bd`
- Staking Vault: `0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF`

---

## 📱 How to Use the dApp

### Step 1: Connect Your Wallet

1. **Open the dApp** in your browser
2. **Click "Connect Wallet"** button
3. **Select your wallet** (MetaMask, Rainbow, etc.)
4. **Approve the connection** in your wallet
5. **Switch to Sepolia network** if prompted (Chain ID: 11155111)

**Troubleshooting:**
- If your wallet doesn't appear, make sure it's installed
- If connection fails, try refreshing the page
- Ensure you're on Sepolia testnet

### Step 2: Check Your Balance

Once connected, you'll see:
- **YARO Balance**: How many YARO tokens you have
- **Staked Amount**: How many YARO you've staked (0 if none)
- **Pending Rewards**: How many rYARO rewards you can claim

### Step 3: Deposit/Stake YARO Tokens

**Why is the Deposit button disabled?**

The button is disabled if:
- ❌ You have 0 YARO tokens in your wallet
- ❌ You haven't entered an amount
- ❌ The amount is 0 or invalid

**How to Deposit:**

1. **Get YARO tokens first** (see Step 2 above)
2. **Enter the amount** you want to stake in the "Deposit YARO" input
   - You can click "MAX" to stake all your YARO
3. **Click "Approve"** (first time only)
   - This allows the vault to spend your YARO tokens
   - Confirm the transaction in your wallet
   - Wait for approval confirmation
4. **Click "Deposit"**
   - Confirm the transaction in your wallet
   - Wait for confirmation
   - Your staked amount will update automatically

**What happens:**
- Your YARO tokens are locked in the staking vault
- You start earning rYARO rewards immediately
- Rewards accumulate based on your staked amount

### Step 4: Earn Rewards

**How Rewards Work:**
- Rewards are calculated per second based on the reward rate
- Your share of rewards = (Your Staked Amount / Total Staked) × Reward Rate
- Rewards accumulate in real-time
- You can see your pending rewards update every 5 seconds

**Example:**
- If you stake 1,000 YARO
- And the reward rate is 1 rYARO per second
- And total staked is 10,000 YARO
- You earn: (1,000 / 10,000) × 1 = 0.1 rYARO per second

### Step 5: Claim Rewards

**How to Claim:**

1. **Check your pending rewards** in the Rewards Card
2. **Click "Claim Rewards"** button
3. **Confirm the transaction** in your wallet
4. **Wait for confirmation**
5. Your rYARO tokens will be sent to your wallet

**Important:**
- Claiming rewards does NOT affect your staked YARO
- You can claim rewards anytime without withdrawing
- Rewards are automatically claimed when you withdraw

### Step 6: Withdraw Staked Tokens

**How to Withdraw:**

1. **Enter the amount** you want to withdraw
   - You can click "MAX" to withdraw all staked tokens
2. **Click "Withdraw"** button
3. **Confirm the transaction** in your wallet
4. **Wait for confirmation**
   - Your rewards are automatically claimed
   - Your YARO tokens are returned to your wallet

**What happens:**
- Your staked YARO is returned to your wallet
- Any pending rewards are automatically claimed
- You stop earning rewards on the withdrawn amount

---

## 🎯 Complete Workflow Example

### First Time User:

1. ✅ **Get Sepolia ETH** from a faucet
2. ✅ **Get YARO tokens** (request from deployer)
3. ✅ **Connect wallet** to the dApp
4. ✅ **Approve YARO** (first deposit only)
5. ✅ **Deposit 100 YARO** to start staking
6. ⏳ **Wait and watch** rewards accumulate
7. ✅ **Claim rewards** when you want rYARO
8. ✅ **Withdraw** when you want your YARO back

### Regular User:

1. ✅ **Connect wallet**
2. ✅ **Deposit more YARO** (if you have more)
3. ✅ **Claim rewards** regularly
4. ✅ **Withdraw** when needed

---

## 💡 Tips & Best Practices

### Gas Fees
- Keep some Sepolia ETH for gas fees
- Each transaction (approve, deposit, withdraw, claim) costs gas
- Gas fees are paid in ETH, not YARO

### Staking Strategy
- **Long-term staking**: More rewards over time
- **Regular claiming**: Claim rewards periodically
- **Compound**: Withdraw, claim, and re-deposit to compound

### Security
- ✅ Always verify you're on Sepolia testnet
- ✅ Double-check transaction amounts
- ✅ Never share your private key
- ✅ Verify contract addresses

---

## ❓ Troubleshooting

### "Deposit button is disabled"

**Solution:**
- Check you have YARO tokens in your wallet
- Enter an amount greater than 0
- Make sure you're connected to the correct network (Sepolia)

### "I don't have YARO tokens"

**Solution:**
- Contact the contract deployer to mint tokens
- Check if there's a token faucet available
- Get tokens from another user

### "Transaction failed"

**Common reasons:**
- ❌ Insufficient ETH for gas
- ❌ Insufficient YARO balance
- ❌ Contract is paused (rare)
- ❌ Network congestion

**Solution:**
- Check you have enough Sepolia ETH
- Verify your YARO balance
- Try again after a few seconds
- Check browser console for error details

### "Rewards not showing"

**Solution:**
- Wait a few seconds (rewards update every 5 seconds)
- Make sure you have staked tokens
- Check the reward rate is set (contact deployer if 0)
- Refresh the page

### "Can't connect wallet"

**Solution:**
- Make sure wallet extension is installed
- Unlock your wallet
- Try disconnecting and reconnecting
- Check browser console for errors

---

## 📊 Understanding the Dashboard

### Staking Card
- **Staked Amount**: Your currently staked YARO
- **YARO Balance**: YARO tokens in your wallet
- **Deposit Input**: Enter amount to stake
- **Withdraw Input**: Enter amount to unstake

### Rewards Card
- **Pending Rewards**: rYARO you can claim right now
- **Total Staked**: All YARO staked in the vault (all users)
- **Reward Rate**: rYARO distributed per second
- **Claim Button**: Claim your pending rewards

---

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Etherscan (Sepolia)**: https://sepolia.etherscan.io/
- **Contract on Etherscan**: 
  - Vault: https://sepolia.etherscan.io/address/0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF
  - YARO Token: https://sepolia.etherscan.io/address/0x8a7153ee7B982744E94CA8CE7682D0451D3924bd

---

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Check browser console for errors
3. Verify contract addresses
4. Contact the project maintainer

---

## 🎉 You're Ready!

Now you know how to:
- ✅ Connect your wallet
- ✅ Get YARO tokens
- ✅ Deposit and stake
- ✅ Earn rewards
- ✅ Claim rewards
- ✅ Withdraw tokens

Happy staking! 🚀

