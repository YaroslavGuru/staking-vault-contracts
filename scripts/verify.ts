import { run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Script to verify already-deployed contracts on Etherscan
 * Usage: npx hardhat run scripts/verify.ts --network sepolia
 */
async function main() {
  // Contract addresses from deployment
  const YAROSLAV_ADDRESS = process.env.YAROSLAV_ADDRESS || "0xF2C587fDab91A54e75d83e4CA58A640e94DE0003";
  const RYAROSLAV_ADDRESS = process.env.RYAROSLAV_ADDRESS || "0x84FEB9AEc3a3deB480a8F4366A2f91b036FAb612";
  const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "0x3fE6b79Dd59cf9b854671C3eff651a72337d48Bb";
  const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS || "0x2cECee2B25bd25476097B451C4b657D9864E033d";
  
  // Note: For verification, you need to provide the exact constructor arguments used during deployment
  // If you deployed with distribution, you need to provide those arrays
  // For old deployments without distribution, use empty arrays
  const YARO_RECIPIENTS = process.env.YARO_RECIPIENTS ? JSON.parse(process.env.YARO_RECIPIENTS) : [DEPLOYER_ADDRESS];
  const YARO_AMOUNTS = process.env.YARO_AMOUNTS ? JSON.parse(process.env.YARO_AMOUNTS) : ["0"];
  const RYARO_RECIPIENTS = process.env.RYARO_RECIPIENTS ? JSON.parse(process.env.RYARO_RECIPIENTS) : [DEPLOYER_ADDRESS];
  const RYARO_AMOUNTS = process.env.RYARO_AMOUNTS ? JSON.parse(process.env.RYARO_AMOUNTS) : ["0"];

  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("ERROR: ETHERSCAN_API_KEY not set in .env");
    process.exit(1);
  }

  try {
    console.log("Verifying Yaroslav...");
    await run("verify:verify", {
      address: YAROSLAV_ADDRESS,
      contract: "contracts/Yaroslav.sol:Yaroslav",
      constructorArguments: [DEPLOYER_ADDRESS, YARO_RECIPIENTS, YARO_AMOUNTS],
    });
    console.log("✅ Yaroslav verified!");

    console.log("\nVerifying rYaroslav...");
    await run("verify:verify", {
      address: RYAROSLAV_ADDRESS,
      contract: "contracts/rYaroslav.sol:rYaroslav",
      constructorArguments: [DEPLOYER_ADDRESS, RYARO_RECIPIENTS, RYARO_AMOUNTS],
    });
    console.log("✅ rYaroslav verified!");

    console.log("\nVerifying YaroslavStakingVault...");
    await run("verify:verify", {
      address: VAULT_ADDRESS,
      contract: "contracts/YaroslavStakingVault.sol:YaroslavStakingVault",
      constructorArguments: [YAROSLAV_ADDRESS, RYAROSLAV_ADDRESS, DEPLOYER_ADDRESS],
    });
    console.log("✅ YaroslavStakingVault verified!");

    console.log("\n🎉 All contracts verified successfully!");
  } catch (error: any) {
    if (error.message?.includes("Already Verified")) {
      console.log("⚠️  Contract already verified on Etherscan");
    } else {
      console.error("❌ Verification failed:", error.message || error);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

