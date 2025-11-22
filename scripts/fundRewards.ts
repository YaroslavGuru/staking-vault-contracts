import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Helper script to mint rYARO tokens and fund the staking vault with rewards
 * Usage: npx hardhat run scripts/fundRewards.ts --network sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  // These addresses should be set after deployment
  const RYAROSLAV_ADDRESS = process.env.RYAROSLAV_ADDRESS || "";
  const VAULT_ADDRESS = process.env.VAULT_ADDRESS || "";
  const REWARD_AMOUNT = process.env.REWARD_AMOUNT || ethers.parseEther("1000000"); // Default 1M tokens
  const REWARD_RATE = process.env.REWARD_RATE || ethers.parseEther("1"); // Default 1 token per second

  if (!RYAROSLAV_ADDRESS || !VAULT_ADDRESS) {
    throw new Error("Please set RYAROSLAV_ADDRESS and VAULT_ADDRESS in .env");
  }

  console.log("Funding rewards with account:", deployer.address);

  // Get contracts
  const rYaroslav = await ethers.getContractAt("rYaroslav", RYAROSLAV_ADDRESS);
  const vault = await ethers.getContractAt("YaroslavStakingVault", VAULT_ADDRESS);

  // Mint rYARO tokens to deployer
  console.log(`Minting ${ethers.formatEther(REWARD_AMOUNT)} rYARO tokens...`);
  const mintTx = await rYaroslav.mint(deployer.address, REWARD_AMOUNT);
  await mintTx.wait();
  console.log("Mint transaction confirmed");

  // Approve vault to spend rYARO
  console.log("Approving vault to spend rYARO...");
  const approveTx = await rYaroslav.approve(VAULT_ADDRESS, REWARD_AMOUNT);
  await approveTx.wait();
  console.log("Approval confirmed");

  // Fund the vault
  console.log(`Funding vault with ${ethers.formatEther(REWARD_AMOUNT)} rYARO...`);
  const fundTx = await vault.fundRewards(REWARD_AMOUNT);
  await fundTx.wait();
  console.log("Fund transaction confirmed");

  // Set reward rate
  console.log(`Setting reward rate to ${ethers.formatEther(REWARD_RATE)} tokens per second...`);
  const setRateTx = await vault.setRewardRate(REWARD_RATE);
  await setRateTx.wait();
  console.log("Reward rate set");

  console.log("\n=== Funding Summary ===");
  console.log("Reward amount funded:", ethers.formatEther(REWARD_AMOUNT), "rYARO");
  console.log("Reward rate:", ethers.formatEther(REWARD_RATE), "rYARO per second");
  console.log("Vault reward balance:", ethers.formatEther(await vault.getRewardTokenBalance()), "rYARO");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

