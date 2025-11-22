import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Yaroslav, rYaroslav, YaroslavStakingVault } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("YaroslavStakingVault", function () {
  const PRECISION = ethers.parseEther("1");
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const REWARD_AMOUNT = ethers.parseEther("100000");
  const REWARD_RATE = ethers.parseEther("1"); // 1 token per second

  async function deployContractsFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens with empty distribution (tests mint manually)
    const YaroslavFactory = await ethers.getContractFactory("Yaroslav");
    const yaroslav = await YaroslavFactory.deploy(owner.address, [], []);
    await yaroslav.waitForDeployment();

    const rYaroslavFactory = await ethers.getContractFactory("rYaroslav");
    const rYaroslav = await rYaroslavFactory.deploy(owner.address, [], []);
    await rYaroslav.waitForDeployment();

    // Deploy vault
    const VaultFactory = await ethers.getContractFactory("YaroslavStakingVault");
    const vault = await VaultFactory.deploy(
      await yaroslav.getAddress(),
      await rYaroslav.getAddress(),
      owner.address
    );
    await vault.waitForDeployment();

    // Mint tokens
    await yaroslav.mint(user1.address, INITIAL_SUPPLY);
    await yaroslav.mint(user2.address, INITIAL_SUPPLY);
    await rYaroslav.mint(owner.address, REWARD_AMOUNT);

    // Fund vault with rewards
    await rYaroslav.approve(await vault.getAddress(), REWARD_AMOUNT);
    await vault.fundRewards(REWARD_AMOUNT);
    await vault.setRewardRate(REWARD_RATE);

    return {
      yaroslav: yaroslav as Yaroslav,
      rYaroslav: rYaroslav as rYaroslav,
      vault: vault as YaroslavStakingVault,
      owner,
      user1,
      user2,
    };
  }

  describe("Deployment", function () {
    it("Should set correct token addresses", async function () {
      const { yaroslav, rYaroslav, vault } = await loadFixture(deployContractsFixture);

      expect(await vault.stakeToken()).to.equal(await yaroslav.getAddress());
      expect(await vault.rewardToken()).to.equal(await rYaroslav.getAddress());
    });

    it("Should set owner correctly", async function () {
      const { vault, owner } = await loadFixture(deployContractsFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total staked", async function () {
      const { vault } = await loadFixture(deployContractsFixture);
      expect(await vault.totalStaked()).to.equal(0);
    });
  });

  describe("Deposit", function () {
    it("Should allow user to deposit tokens", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await expect(vault.connect(user1).deposit(depositAmount))
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, depositAmount);

      expect(await vault.totalStaked()).to.equal(depositAmount);
      const userInfo = await vault.userInfo(user1.address);
      expect(userInfo.amount).to.equal(depositAmount);
    });

    it("Should reject zero deposit", async function () {
      const { vault, user1 } = await loadFixture(deployContractsFixture);
      await expect(vault.connect(user1).deposit(0)).to.be.revertedWith(
        "YaroslavStakingVault: amount must be greater than 0"
      );
    });

    it("Should claim pending rewards on deposit", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      // First deposit
      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Wait for rewards to accumulate
      await time.increase(100);

      // Second deposit should claim pending rewards
      const pendingBefore = await vault.pendingRewards(user1.address);
      expect(pendingBefore).to.be.gt(0);

      // Approve additional amount for second deposit
      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount * 2n);
      await vault.connect(user1).deposit(depositAmount);

      const userInfo = await vault.userInfo(user1.address);
      expect(userInfo.amount).to.equal(depositAmount * 2n);
    });

    it("Should revert when paused", async function () {
      const { yaroslav, vault, user1, owner } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await vault.connect(owner).pause();
      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);

      await expect(vault.connect(user1).deposit(depositAmount)).to.be.revertedWithCustomError(
        vault,
        "EnforcedPause"
      );
    });
  });

  describe("Withdraw", function () {
    it("Should allow user to withdraw tokens", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");
      const withdrawAmount = ethers.parseEther("500");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await expect(vault.connect(user1).withdraw(withdrawAmount))
        .to.emit(vault, "Withdraw")
        .withArgs(user1.address, withdrawAmount);

      const userInfo = await vault.userInfo(user1.address);
      expect(userInfo.amount).to.equal(depositAmount - withdrawAmount);
      expect(await vault.totalStaked()).to.equal(depositAmount - withdrawAmount);
    });

    it("Should reject zero withdraw", async function () {
      const { vault, user1 } = await loadFixture(deployContractsFixture);
      await expect(vault.connect(user1).withdraw(0)).to.be.revertedWith(
        "YaroslavStakingVault: amount must be greater than 0"
      );
    });

    it("Should reject withdraw exceeding balance", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await expect(vault.connect(user1).withdraw(depositAmount + 1n)).to.be.revertedWith(
        "YaroslavStakingVault: insufficient balance"
      );
    });

    it("Should claim pending rewards on withdraw", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Wait for rewards
      await time.increase(100);

      const pendingBefore = await vault.pendingRewards(user1.address);
      expect(pendingBefore).to.be.gt(0);

      await vault.connect(user1).withdraw(ethers.parseEther("100"));

      // Rewards should have been claimed
      const pendingAfter = await vault.pendingRewards(user1.address);
      expect(pendingAfter).to.be.lt(pendingBefore);
    });
  });

  describe("Claim Rewards", function () {
    it("Should allow user to claim pending rewards", async function () {
      const { yaroslav, vault, user1, rYaroslav } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Wait for rewards to accumulate
      await time.increase(100);

      const pending = await vault.pendingRewards(user1.address);
      expect(pending).to.be.gt(0);

      const balanceBefore = await rYaroslav.balanceOf(user1.address);

      const tx = await vault.connect(user1).claimRewards();
      await expect(tx).to.emit(vault, "ClaimRewards");

      const balanceAfter = await rYaroslav.balanceOf(user1.address);
      const claimed = balanceAfter - balanceBefore;
      expect(claimed).to.be.gte(pending); // May be slightly more due to time passing
      expect(claimed).to.be.closeTo(pending, ethers.parseEther("1")); // Within 1 token tolerance
    });

    it("Should reject claim when no rewards", async function () {
      const { vault, user1 } = await loadFixture(deployContractsFixture);
      await expect(vault.connect(user1).claimRewards()).to.be.revertedWith(
        "YaroslavStakingVault: no rewards to claim"
      );
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow emergency withdraw without claiming rewards", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await time.increase(100);

      const pending = await vault.pendingRewards(user1.address);
      expect(pending).to.be.gt(0);

      await expect(vault.connect(user1).emergencyWithdraw())
        .to.emit(vault, "EmergencyWithdraw")
        .withArgs(user1.address, depositAmount);

      const userInfo = await vault.userInfo(user1.address);
      expect(userInfo.amount).to.equal(0);
      expect(userInfo.rewardDebt).to.equal(0);
      expect(await vault.totalStaked()).to.equal(0);
    });

    it("Should work even when paused", async function () {
      const { yaroslav, vault, user1, owner } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await vault.connect(owner).pause();

      await expect(vault.connect(user1).emergencyWithdraw())
        .to.emit(vault, "EmergencyWithdraw")
        .withArgs(user1.address, depositAmount);
    });
  });

  describe("Pending Rewards Calculation", function () {
    it("Should calculate pending rewards correctly", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Wait 10 seconds
      await time.increase(10);

      const pending = await vault.pendingRewards(user1.address);
      // Approximate: rewardRate * timeElapsed = 1 * 10 = 10 tokens
      // But scaled by user's share of total staked
      expect(pending).to.be.gt(0);
    });

    it("Should return zero for users with no stake", async function () {
      const { vault, user1 } = await loadFixture(deployContractsFixture);
      const pending = await vault.pendingRewards(user1.address);
      expect(pending).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set reward rate", async function () {
      const { vault, owner } = await loadFixture(deployContractsFixture);
      const newRate = ethers.parseEther("2");

      await expect(vault.connect(owner).setRewardRate(newRate))
        .to.emit(vault, "RewardRateUpdated")
        .withArgs(REWARD_RATE, newRate);

      expect(await vault.rewardRate()).to.equal(newRate);
    });

    it("Should reject non-owner from setting reward rate", async function () {
      const { vault, user1 } = await loadFixture(deployContractsFixture);
      const newRate = ethers.parseEther("2");

      await expect(vault.connect(user1).setRewardRate(newRate)).to.be.revertedWithCustomError(
        vault,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should allow owner to fund rewards", async function () {
      const { vault, rYaroslav, owner } = await loadFixture(deployContractsFixture);
      const fundAmount = ethers.parseEther("50000");

      await rYaroslav.mint(owner.address, fundAmount);
      await rYaroslav.approve(await vault.getAddress(), fundAmount);

      await expect(vault.connect(owner).fundRewards(fundAmount))
        .to.emit(vault, "RewardsFunded")
        .withArgs(fundAmount);
    });

    it("Should allow owner to withdraw unused rewards", async function () {
      const { vault, rYaroslav, owner } = await loadFixture(deployContractsFixture);
      const withdrawAmount = ethers.parseEther("10000");

      await expect(vault.connect(owner).withdrawUnusedRewards(withdrawAmount))
        .to.emit(vault, "UnusedRewardsWithdrawn")
        .withArgs(owner.address, withdrawAmount);
    });

    it("Should allow owner to pause and unpause", async function () {
      const { vault, owner } = await loadFixture(deployContractsFixture);

      await vault.connect(owner).pause();
      expect(await vault.paused()).to.be.true;

      await vault.connect(owner).unpause();
      expect(await vault.paused()).to.be.false;
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple users staking", async function () {
      const { yaroslav, vault, user1, user2 } = await loadFixture(deployContractsFixture);
      const amount1 = ethers.parseEther("1000");
      const amount2 = ethers.parseEther("2000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), amount1);
      await yaroslav.connect(user2).approve(await vault.getAddress(), amount2);

      await vault.connect(user1).deposit(amount1);
      await vault.connect(user2).deposit(amount2);

      expect(await vault.totalStaked()).to.equal(amount1 + amount2);

      const user1Info = await vault.userInfo(user1.address);
      const user2Info = await vault.userInfo(user2.address);

      expect(user1Info.amount).to.equal(amount1);
      expect(user2Info.amount).to.equal(amount2);
    });

    it("Should distribute rewards proportionally", async function () {
      const { yaroslav, vault, user1, user2 } = await loadFixture(deployContractsFixture);
      const amount1 = ethers.parseEther("1000");
      const amount2 = ethers.parseEther("2000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), amount1);
      await yaroslav.connect(user2).approve(await vault.getAddress(), amount2);

      await vault.connect(user1).deposit(amount1);
      await vault.connect(user2).deposit(amount2);

      await time.increase(100);

      const pending1 = await vault.pendingRewards(user1.address);
      const pending2 = await vault.pendingRewards(user2.address);

      // User2 should have approximately 2x the rewards of user1
      expect(pending2).to.be.gt(pending1);
      expect(pending2).to.be.closeTo(pending1 * 2n, pending1 / 10n); // Within 10% tolerance
    });
  });

  describe("Reward Rate Changes", function () {
    it("Should handle reward rate changes mid-staking", async function () {
      const { yaroslav, vault, user1, owner } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await time.increase(50);

      const pendingBefore = await vault.pendingRewards(user1.address);

      // Double the reward rate
      await vault.connect(owner).setRewardRate(REWARD_RATE * 2n);

      await time.increase(50);

      const pendingAfter = await vault.pendingRewards(user1.address);

      // Pending after should be more than double pending before
      // (because rate doubled and time continued)
      expect(pendingAfter).to.be.gt(pendingBefore * 2n);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero total staked when updating rewards", async function () {
      const { vault, owner } = await loadFixture(deployContractsFixture);

      // Update rewards with zero staked should not revert
      await expect(vault.updateRewards()).to.not.be.reverted;
    });

    it("Should handle full withdraw", async function () {
      const { yaroslav, vault, user1 } = await loadFixture(deployContractsFixture);
      const depositAmount = ethers.parseEther("1000");

      await yaroslav.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await vault.connect(user1).withdraw(depositAmount);

      const userInfo = await vault.userInfo(user1.address);
      expect(userInfo.amount).to.equal(0);
      expect(await vault.totalStaked()).to.equal(0);
    });
  });
});

