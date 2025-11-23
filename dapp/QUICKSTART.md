# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd dapp
npm install
```

### 2. Set Up Environment

Create `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://rpc2.sepolia.org
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF
NEXT_PUBLIC_YARO_TOKEN_ADDRESS=0x8a7153ee7B982744E94CA8CE7682D0451D3924bd
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open Browser

Navigate to: http://localhost:3000

### 5. Connect Wallet

- Click "Connect Wallet"
- Select your wallet (MetaMask, Rainbow, etc.)
- Switch to Sepolia testnet if prompted

### 6. Start Staking!

- Go to Dashboard
- Deposit YARO tokens
- Watch your rewards accumulate
- Claim rewards anytime

## 📋 Prerequisites

- Node.js 20+
- A Web3 wallet (MetaMask recommended)
- Sepolia ETH for gas fees
- YARO tokens for staking

## 🎯 Key Features

✅ Wallet connection with RainbowKit  
✅ Real-time balance updates  
✅ Deposit/Withdraw functionality  
✅ Reward claiming  
✅ Beautiful, responsive UI  
✅ Dark mode support  

## 📚 Next Steps

- Read the [full README](./README.md) for detailed documentation
- Check [architecture docs](./docs/architecture.md) for technical details
- Deploy to Vercel for production use

## 🐛 Troubleshooting

**Wallet won't connect?**
- Ensure you're on Sepolia testnet
- Check wallet is unlocked
- Try refreshing the page

**Transactions failing?**
- Check you have Sepolia ETH
- Verify contract addresses are correct
- Check browser console for errors

**Data not loading?**
- Verify RPC URL is accessible
- Check network connection
- Try switching RPC endpoints

## 🚢 Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Your DApp will be live in minutes! 🎉

