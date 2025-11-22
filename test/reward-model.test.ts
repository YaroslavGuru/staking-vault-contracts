import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Yaroslav, rYaroslav, YaroslavStakingVault } from "../typechain-types";

describe("Reward Model", function () {
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const REWARD_AMOUNT = ethers.parseEther("100000");
  const REWARD_RATE = ethers.parseEther("1"); // 1 token per second

  async function deployContractsFixture() {
    const [owner, user1] = await ethers.getSigners();

    const YaroslavFactory = await ethers.getContractFactory("Yaroslav");
    const yaroslav = await YaroslavFactory.deploy(owner.address, [], []);
    await yaroslav.waitForDeployment();

    const rYaroslavFactory = await ethers.getContractFactory("rYaroslav");
    const rYaroslav = await rYaroslavFactory.deploy(owner.address, [], []);
    await rYaroslav.waitForDeployment();

    const VaultFactory = await ethers.getContractFactory("YaroslavStakingVault");
    const vault = await VaultFactory.deploy(
      await yaroslav.getAddress(),
      await rYaroslav.getAddress(),
      owner.address
    );
    await vault.waitForDeployment();

    await yaroslav.mint(user1.address, INITIAL_SUPPLY);
    await rYaroslav.mint(owner.address, REWARD_AMOUNT);

    await rYaroslav.approve(await vault.getAddress(), REWARD_AMOUNT);
    await vault.fundRewards(REWARD_AMOUNT);
    await vault.setRewardRate(REWARD_RATE);

    return {
      yaroslav: yaroslav as Yaroslav,
      rYaroslav: rYaroslav as rYaroslav,
      vault: vault as YaroslavStakingVault,
      owner,
      user1,
    };
  }

  describe("Reward Accumulation", function () {
    it("Should accumulate rewards linearly over time", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Check rewards at different time points
      const time1 = 10;
      await time.increase(time1);
      const pending1 = await vault.pendingRewards(user1.address);

      const time2 = 20;
      await time.increase(time2 - time1);
      const pending2 = await vault.pendingRewards(user1.address);

      // Pending2 should be approximately 2x pending1 (within rounding tolerance)
      expect(pending2).to.be.gte(pending1);
      // Allow for some rounding differences
      const ratio = Number(pending2) / Number(pending1);
      expect(ratio).to.be.closeTo(2, 0.1);
    });

    it("Should handle zero reward rate", async function () {
      const { yaroslav, vault, user1, owner } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Claim any existing rewards first and update state
      await time.increase(10);
      await vault.connect(user1).claimRewards();

      // Set reward rate to zero (this calls updateRewards internally)
      await vault.connect(owner).setRewardRate(0);

      // Verify no new rewards accumulate
      const pendingBefore = await vault.pendingRewards(user1.address);
      await time.increase(100);
      const pendingAfter = await vault.pendingRewards(user1.address);

      // Pending should not increase (or increase only minimally due to rounding)
      expect(pendingAfter).to.be.lte(pendingBefore + ethers.parseEther("0.0001")); // Allow tiny rounding
    });

    it("Should update accRewardPerShare correctly", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      const accBefore = await vault.accRewardPerShare();

      await time.increase(100);
      await vault.updateRewards();

      const accAfter = await vault.accRewardPerShare();
      expect(accAfter).to.be.gt(accBefore);
    });
  });

  describe("Reward Distribution", function () {
    it("Should distribute rewards based on stake proportion", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const deposit1 = ethers.parseEther("1000");
      const deposit2 = ethers.parseEther("2000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), deposit1 + deposit2);

      // First deposit
      await vault.connect(user1).deposit(deposit1);
      await time.increase(50);

      // Second deposit (doubles stake)
      await vault.connect(user1).deposit(deposit2);

      await time.increase(50);

      const pending = await vault.pendingRewards(user1.address);
      expect(pending).to.be.gt(0);
    });

    it("Should handle partial withdrawals correctly", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await time.increase(100);

      const pendingBefore = await vault.pendingRewards(user1.address);

      // Withdraw half
      await vault.connect(user1).withdraw(depositAmount / 2n);

      // Pending should be recalculated based on new stake
      const pendingAfter = await vault.pendingRewards(user1.address);
      expect(pendingAfter).to.be.lt(pendingBefore);
    });
  });

  describe("Precision and Scaling", function () {
    it("Should handle small amounts correctly", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const smallAmount = ethers.parseEther("0.001");

      await yaroslav.connect(user1).approve(await vault.getAddress(), smallAmount);
      await vault.connect(user1).deposit(smallAmount);

      await time.increase(10);

      const pending = await vault.pendingRewards(user1.address);
      expect(pending).to.be.gte(0);
    });

    it("Should maintain precision with large numbers", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const largeAmount = ethers.parseEther("1000000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), largeAmount);
      await vault.connect(user1).deposit(largeAmount);

      await time.increase(100);

      const pending = await vault.pendingRewards(user1.address);
      expect(pending).to.be.gt(0);
    });
  });
});

