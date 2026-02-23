// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SimpleLending.sol";

/**
 * @title GuardianAutomation
 * @notice Optional auto-rescue contract. Users can pre-approve this contract
 *         to automatically add collateral when their position is in danger.
 *
 *         This can be triggered reactively via Somnia's on-chain reactivity
 *         (SomniaEventHandler pattern) or manually by the subscriber backend.
 */
contract GuardianAutomation {
    SimpleLending public lending;
    address public owner;

    // User pre-authorized rescue: user => max ETH they allow to be used
    mapping(address => uint256) public rescueBudget;
    // ETH balance deposited by users for auto-rescue
    mapping(address => uint256) public rescueBalance;

    event RescueEnabled(address indexed user, uint256 budget);
    event RescueDisabled(address indexed user);
    event RescueDeposit(address indexed user, uint256 amount);
    event RescueWithdraw(address indexed user, uint256 amount);
    event AutoRescueExecuted(
        address indexed user,
        uint256 topUpAmount,
        uint256 newHealthFactor
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "GuardianAutomation: not owner");
        _;
    }

    constructor(address _lending) {
        lending = SimpleLending(payable(_lending));
        owner = msg.sender;
    }

    // ──────────────────────── User Functions ────────────────────────

    /**
     * @notice Deposit ETH for auto-rescue and set max rescue budget
     */
    function enableRescue() external payable {
        require(msg.value > 0, "GuardianAutomation: must deposit ETH");

        rescueBalance[msg.sender] += msg.value;
        rescueBudget[msg.sender] = rescueBalance[msg.sender];

        emit RescueEnabled(msg.sender, rescueBudget[msg.sender]);
        emit RescueDeposit(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw unused rescue balance
     */
    function withdrawRescueBalance(uint256 _amount) external {
        require(
            rescueBalance[msg.sender] >= _amount,
            "GuardianAutomation: insufficient balance"
        );

        rescueBalance[msg.sender] -= _amount;
        rescueBudget[msg.sender] = rescueBalance[msg.sender];

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "GuardianAutomation: ETH transfer failed");

        emit RescueWithdraw(msg.sender, _amount);
    }

    /**
     * @notice Disable auto-rescue and withdraw all funds
     */
    function disableRescue() external {
        uint256 balance = rescueBalance[msg.sender];
        rescueBalance[msg.sender] = 0;
        rescueBudget[msg.sender] = 0;

        if (balance > 0) {
            (bool success, ) = msg.sender.call{value: balance}("");
            require(success, "GuardianAutomation: ETH transfer failed");
        }

        emit RescueDisabled(msg.sender);
    }

    // ──────────────────────── Automation ────────────────────────

    /**
     * @notice Execute auto-rescue for a user by depositing collateral
     * @dev Can be called by the Somnia reactive subscriber or keeper
     * @param _user The user whose position needs rescue
     * @param _amount Amount of ETH to deposit as collateral
     */
    function executeRescue(address _user, uint256 _amount) external {
        require(
            rescueBudget[_user] > 0,
            "GuardianAutomation: rescue not enabled"
        );
        require(
            rescueBalance[_user] >= _amount,
            "GuardianAutomation: insufficient rescue balance"
        );
        require(_amount > 0, "GuardianAutomation: amount must be > 0");

        // Cap at budget
        uint256 rescueAmount = _amount > rescueBudget[_user]
            ? rescueBudget[_user]
            : _amount;

        rescueBalance[_user] -= rescueAmount;
        rescueBudget[_user] -= rescueAmount;

        // Deposit collateral on behalf of user
        lending.deposit{value: rescueAmount}();

        // Get updated health factor
        (, , , uint256 newHF, ) = lending.getPosition(_user);

        emit AutoRescueExecuted(_user, rescueAmount, newHF);
    }

    // ──────────────────────── View Functions ────────────────────────

    /**
     * @notice Check if auto-rescue is enabled for a user
     */
    function isRescueEnabled(address _user) external view returns (bool) {
        return rescueBudget[_user] > 0;
    }

    /**
     * @notice Get rescue info for a user
     */
    function getRescueInfo(
        address _user
    ) external view returns (uint256 balance, uint256 budget, bool enabled) {
        balance = rescueBalance[_user];
        budget = rescueBudget[_user];
        enabled = budget > 0;
    }

    receive() external payable {}
}
