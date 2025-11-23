# Vercel Deployment Guide

## 🚀 Quick Deployment

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/new
2. **Import your GitHub repository**
3. **Configure Project Settings** (CRITICAL):
   - Go to **Settings** → **General**
   - Find **Root Directory** section
   - Click **Edit** and set to: `dapp` ⚠️ **MUST SET THIS**
   - Click **Save**
4. **Build Settings** (should auto-detect, but verify):
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (runs in dapp directory)
   - **Output Directory**: `.next` (relative to dapp)
   - **Install Command**: `npm install` (runs in dapp directory)

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_RPC_URL=https://rpc2.sepolia.org
   NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF
   NEXT_PUBLIC_YARO_TOKEN_ADDRESS=0x8a7153ee7B982744E94CA8CE7682D0451D3924bd
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id (optional)
   ```

5. **Deploy!**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to dapp directory
cd dapp

# Deploy
vercel

# Follow prompts:
# - Set root directory to current directory (dapp)
# - Add environment variables
```

### Option 3: Using vercel.json (Already Configured)

The `vercel.json` file in the root is configured with build commands. However, you **MUST** still set the Root Directory in Vercel project settings:

1. **Import project in Vercel**
2. **Set Root Directory to `dapp`** in Project Settings → General
3. **Add environment variables**
4. **Deploy**

**Note**: `rootDirectory` cannot be in `vercel.json` - it must be set in Vercel Dashboard.

## ⚙️ Vercel Project Settings

### Required Settings:

- **Root Directory**: `dapp`
- **Framework**: Next.js
- **Build Command**: `npm run build` (runs in dapp directory)
- **Output Directory**: `.next`
- **Install Command**: `npm install` (runs in dapp directory)

### Environment Variables:

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_RPC_URL` | `https://rpc2.sepolia.org` | Yes |
| `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS` | `0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF` | Yes |
| `NEXT_PUBLIC_YARO_TOKEN_ADDRESS` | `0x8a7153ee7B982744E94CA8CE7682D0451D3924bd` | Yes |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your WalletConnect project ID | No |

## 🔧 Troubleshooting

### Issue: "No Output Directory found"

**Solution**: Set **Root Directory** to `dapp` in Vercel project settings.

### Issue: Build fails with "Cannot find module"

**Solution**: 
- Ensure Root Directory is set to `dapp`
- Check that `dapp/package.json` exists
- Verify install command runs in `dapp` directory

### Issue: Environment variables not working

**Solution**:
- Ensure variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check variable names match exactly

### Issue: Wrong build command running

**Solution**: 
- Set Root Directory to `dapp`
- Or use the `vercel.json` configuration

## 📝 Manual Configuration Steps

If auto-detection doesn't work:

1. **In Vercel Dashboard**:
   - Go to Project Settings
   - General → Root Directory → Set to `dapp`
   - Build & Development Settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

2. **Add Environment Variables** (see above)

3. **Redeploy**

## ✅ Verification

After deployment:

1. ✅ Check build logs for successful build
2. ✅ Visit your Vercel URL
3. ✅ Test wallet connection
4. ✅ Verify contract addresses are correct
5. ✅ Test on Sepolia testnet

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/[your-project]/settings
- Environment Variables: https://vercel.com/[your-project]/settings/environment-variables

---

**Note**: The `vercel.json` in the root directory is configured to build from the `dapp` folder automatically.

