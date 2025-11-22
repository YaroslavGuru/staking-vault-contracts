// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title YaroslavStakingVault
 * @dev Staking vault that accepts YARO tokens and distributes rYARO rewards based on a reward rate.
 * Uses an accumulator pattern (accRewardPerShare) for efficient reward calculation.
 */
contract YaroslavStakingVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    /// @dev Precision factor for reward calculations (1e18)
    uint256 public constant PRECISION = 1e18;

    /// @dev The staking token (YARO)
    IERC20 public immutable stakeToken;

    /// @dev The reward token (rYARO)
    IERC20 public immutable rewardToken;

    /// @dev Reward rate per second (in reward token units)
    uint256 public rewardRate;

    /// @dev Last update timestamp for reward calculations
    uint256 public lastUpdateTime;

    /// @dev Accumulated rewards per share (scaled by PRECISION)
    uint256 public accRewardPerShare;

    /// @dev Total staked amount
    uint256 public totalStaked;

    /// @dev User staking information
    struct UserInfo {
        uint256 amount; // Staked amount
        uint256 rewardDebt; // Reward debt (accRewardPerShare * amount / PRECISION)
    }

    /// @dev Mapping from user address to their staking info
    mapping(address => UserInfo) public userInfo;

    /// @dev Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event ClaimRewards(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event RewardsFunded(uint256 amount);
    event UnusedRewardsWithdrawn(address indexed to, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    /**
     * @dev Constructor
     * @param _stakeToken Address of the staking token (YARO)
     * @param _rewardToken Address of the reward token (rYARO)
     * @param _initialOwner Address of the contract owner
     */
    constructor(
        address _stakeToken,
        address _rewardToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_stakeToken != address(0), "YaroslavStakingVault: invalid stake token");
        require(_rewardToken != address(0), "YaroslavStakingVault: invalid reward token");
        stakeToken = IERC20(_stakeToken);
        rewardToken = IERC20(_rewardToken);
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Updates the reward accumulator and last update time
     * Should be called before any state-changing operations
     */
    function updateRewards() public {
        if (block.timestamp <= lastUpdateTime) {
            return;
        }

        if (totalStaked == 0) {
            lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        uint256 reward = rewardRate * timeElapsed;
        accRewardPerShare += (reward * PRECISION) / totalStaked;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Calculates pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount
     */
    function pendingRewards(address user) public view returns (uint256) {
        UserInfo memory userData = userInfo[user];
        uint256 currentAccRewardPerShare = accRewardPerShare;

        if (block.timestamp > lastUpdateTime && totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdateTime;
            uint256 reward = rewardRate * timeElapsed;
            currentAccRewardPerShare += (reward * PRECISION) / totalStaked;
        }

        if (userData.amount == 0) {
            return 0;
        }

        uint256 userReward = (userData.amount * currentAccRewardPerShare) / PRECISION;
        if (userReward > userData.rewardDebt) {
            return userReward - userData.rewardDebt;
        }
        return 0;
    }

    /**
     * @dev Deposits staking tokens into the vault
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "YaroslavStakingVault: amount must be greater than 0");

        updateRewards();

        UserInfo storage user = userInfo[msg.sender];

        // Update user's pending rewards before changing their stake
        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                rewardToken.safeTransfer(msg.sender, pending);
                emit ClaimRewards(msg.sender, pending);
            }
        }

        // Transfer staking tokens from user
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update user info
        user.amount += amount;
        user.rewardDebt = (user.amount * accRewardPerShare) / PRECISION;
        totalStaked += amount;

        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Withdraws staking tokens from the vault
     * @param amount Amount of tokens to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "YaroslavStakingVault: amount must be greater than 0");

        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "YaroslavStakingVault: insufficient balance");

        updateRewards();

        // Calculate and transfer pending rewards
        uint256 pending = (user.amount * accRewardPerShare) / PRECISION - user.rewardDebt;
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit ClaimRewards(msg.sender, pending);
        }

        // Update user info
        user.amount -= amount;
        user.rewardDebt = (user.amount * accRewardPerShare) / PRECISION;
        totalStaked -= amount;

        // Transfer staking tokens back to user
        stakeToken.safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Claims pending rewards without withdrawing staked tokens
     */
    function claimRewards() external nonReentrant whenNotPaused {
        updateRewards();

        UserInfo storage user = userInfo[msg.sender];
        uint256 pending = (user.amount * accRewardPerShare) / PRECISION - user.rewardDebt;

        require(pending > 0, "YaroslavStakingVault: no rewards to claim");

        // Update reward debt
        user.rewardDebt = (user.amount * accRewardPerShare) / PRECISION;

        // Transfer rewards
        rewardToken.safeTransfer(msg.sender, pending);

        emit ClaimRewards(msg.sender, pending);
    }

    /**
     * @dev Emergency withdraw: withdraws staked tokens without claiming rewards
     * Useful if rewards are temporarily unavailable or for gas optimization
     */
    function emergencyWithdraw() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amount = user.amount;

        require(amount > 0, "YaroslavStakingVault: nothing to withdraw");

        // Reset user info (rewards are forfeited in emergency withdraw)
        user.amount = 0;
        user.rewardDebt = 0;
        totalStaked -= amount;

        // Transfer staking tokens back to user
        stakeToken.safeTransfer(msg.sender, amount);

        emit EmergencyWithdraw(msg.sender, amount);
    }

    /**
     * @dev Sets the reward rate (tokens per second). Only callable by owner.
     * @param newRate New reward rate per second
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        updateRewards();
        uint256 oldRate = rewardRate;
        rewardRate = newRate;
        emit RewardRateUpdated(oldRate, newRate);
    }

    /**
     * @dev Funds the contract with reward tokens. Only callable by owner.
     * @param amount Amount of reward tokens to fund
     */
    function fundRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "YaroslavStakingVault: amount must be greater than 0");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(amount);
    }

    /**
     * @dev Withdraws unused reward tokens. Only callable by owner.
     * @param amount Amount of reward tokens to withdraw
     */
    function withdrawUnusedRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "YaroslavStakingVault: amount must be greater than 0");
        rewardToken.safeTransfer(msg.sender, amount);
        emit UnusedRewardsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Pauses the contract. Only callable by owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract. Only callable by owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Returns the total reward token balance in the contract
     * @return Balance of reward tokens
     */
    function getRewardTokenBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }
}

