import { ethers, run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Configuration for initial token distribution
  // You can customize these addresses and amounts via environment variables
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const liquidityPoolAddress = process.env.LIQUIDITY_POOL_ADDRESS || deployer.address;
  
  // Total supply: 1,000,000,000 YARO (1 billion)
  const TOTAL_SUPPLY_YARO = ethers.parseEther("1000000000");
  
  // Distribution percentages (can be customized)
  const DEPLOYER_PERCENT = 40; // 40% to deployer
  const TREASURY_PERCENT = 30; // 30% to treasury
  const LIQUIDITY_PERCENT = 30; // 30% to liquidity pool

  // Calculate distribution amounts
  const deployerAmount = (TOTAL_SUPPLY_YARO * BigInt(DEPLOYER_PERCENT)) / 100n;
  const treasuryAmount = (TOTAL_SUPPLY_YARO * BigInt(TREASURY_PERCENT)) / 100n;
  const liquidityAmount = (TOTAL_SUPPLY_YARO * BigInt(LIQUIDITY_PERCENT)) / 100n;

  // Prepare distribution arrays for YARO
  const yaroRecipients = [deployer.address, treasuryAddress, liquidityPoolAddress];
  const yaroAmounts = [deployerAmount, treasuryAmount, liquidityAmount];

  console.log("\n=== YARO Token Distribution ===");
  console.log(`Deployer (${deployer.address}): ${ethers.formatEther(deployerAmount)} YARO`);
  console.log(`Treasury (${treasuryAddress}): ${ethers.formatEther(treasuryAmount)} YARO`);
  console.log(`Liquidity Pool (${liquidityPoolAddress}): ${ethers.formatEther(liquidityAmount)} YARO`);
  console.log(`Total: ${ethers.formatEther(TOTAL_SUPPLY_YARO)} YARO`);

  // Deploy Yaroslav (YARO) token with initial distribution
  console.log("\nDeploying Yaroslav (YARO) token with initial distribution...");
  const Yaroslav = await ethers.getContractFactory("Yaroslav");
  const yaroslav = await Yaroslav.deploy(deployer.address, yaroRecipients, yaroAmounts);
  await yaroslav.waitForDeployment();
  const yaroslavAddress = await yaroslav.getAddress();
  console.log("Yaroslav deployed to:", yaroslavAddress);

  // For rYARO, we'll mint a smaller initial supply (100M tokens)
  // Most rYARO will be minted as rewards over time
  const TOTAL_SUPPLY_RYARO = ethers.parseEther("100000000"); // 100M rYARO
  
  // rYARO distribution: 50% to deployer (for vault funding), 50% to treasury
  const rYaroDeployerAmount = (TOTAL_SUPPLY_RYARO * 50n) / 100n;
  const rYaroTreasuryAmount = (TOTAL_SUPPLY_RYARO * 50n) / 100n;

  const rYaroRecipients = [deployer.address, treasuryAddress];
  const rYaroAmounts = [rYaroDeployerAmount, rYaroTreasuryAmount];

  console.log("\n=== rYARO Token Distribution ===");
  console.log(`Deployer (${deployer.address}): ${ethers.formatEther(rYaroDeployerAmount)} rYARO`);
  console.log(`Treasury (${treasuryAddress}): ${ethers.formatEther(rYaroTreasuryAmount)} rYARO`);
  console.log(`Total: ${ethers.formatEther(TOTAL_SUPPLY_RYARO)} rYARO`);

  // Deploy rYaroslav (rYARO) token with initial distribution
  console.log("\nDeploying rYaroslav (rYARO) token with initial distribution...");
  const rYaroslav = await ethers.getContractFactory("rYaroslav");
  const rYaroslavToken = await rYaroslav.deploy(deployer.address, rYaroRecipients, rYaroAmounts);
  await rYaroslavToken.waitForDeployment();
  const rYaroslavAddress = await rYaroslavToken.getAddress();
  console.log("rYaroslav deployed to:", rYaroslavAddress);

  // Deploy YaroslavStakingVault
  console.log("\nDeploying YaroslavStakingVault...");
  const YaroslavStakingVault = await ethers.getContractFactory("YaroslavStakingVault");
  const vault = await YaroslavStakingVault.deploy(yaroslavAddress, rYaroslavAddress, deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("YaroslavStakingVault deployed to:", vaultAddress);

  // Print summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("Yaroslav (YARO):", yaroslavAddress);
  console.log("rYaroslav (rYARO):", rYaroslavAddress);
  console.log("YaroslavStakingVault:", vaultAddress);

  // Format for frontend .env
  const contractAddresses = {
    Yaroslav: yaroslavAddress,
    rYaroslav: rYaroslavAddress,
    YaroslavStakingVault: vaultAddress,
  };
  console.log("\nFrontend .env value:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESSES='${JSON.stringify(contractAddresses)}'`);

  // Verify contracts if ETHERSCAN_API_KEY is set
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nWaiting for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      console.log("Verifying Yaroslav...");
      await run("verify:verify", {
        address: yaroslavAddress,
        contract: "contracts/Yaroslav.sol:Yaroslav",
        constructorArguments: [deployer.address, yaroRecipients, yaroAmounts],
      });

      console.log("Verifying rYaroslav...");
      await run("verify:verify", {
        address: rYaroslavAddress,
        contract: "contracts/rYaroslav.sol:rYaroslav",
        constructorArguments: [deployer.address, rYaroRecipients, rYaroAmounts],
      });

      console.log("Verifying YaroslavStakingVault...");
      await run("verify:verify", {
        address: vaultAddress,
        contract: "contracts/YaroslavStakingVault.sol:YaroslavStakingVault",
        constructorArguments: [yaroslavAddress, rYaroslavAddress, deployer.address],
      });

      console.log("All contracts verified successfully!");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  } else {
    console.log("\nSkipping verification (ETHERSCAN_API_KEY not set)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

