// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Yaroslav
 * @dev ERC20 token for staking. Supports initial distribution and mintable by owner.
 */
contract Yaroslav is ERC20, Ownable {
    /**
     * @dev Constructor that optionally performs initial token distribution.
     * @param initialOwner Address that will own the contract
     * @param recipients Array of addresses to receive initial tokens
     * @param amounts Array of token amounts to distribute (must match recipients length)
     */
    constructor(
        address initialOwner,
        address[] memory recipients,
        uint256[] memory amounts
    ) ERC20("Yaroslav", "YARO") Ownable(initialOwner) {
        require(recipients.length == amounts.length, "Yaroslav: arrays length mismatch");

        // Distribute initial tokens
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                _mint(recipients[i], amounts[i]);
            }
        }
    }

    /**
     * @dev Mints tokens to the specified address. Only callable by owner.
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

