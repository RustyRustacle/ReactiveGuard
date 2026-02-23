// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MockPriceOracle.sol";

/**
 * @title SimpleLending
 * @notice Core lending protocol for ReactiveGuard.
 *         Users deposit ETH as collateral, borrow RUSD (mock stablecoin),
 *         and maintain a health factor above 1.0 to avoid liquidation.
 *
 *  Health Factor = (Collateral Value × Liquidation Threshold) / Total Borrowed
 *  Where Liquidation Threshold = 80% (0.8)
 *
 *  HF > 1.25  → SAFE
 *  1.05 < HF ≤ 1.25  → WARNING
 *  HF ≤ 1.05  → CRITICAL
 *  HF < 1.00  → LIQUIDATABLE
 */
contract SimpleLending {
    // ──────────────────────── Constants ────────────────────────
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% in basis points
    uint256 public constant LIQUIDATION_BONUS = 500; // 5% bonus for liquidators
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant WARNING_THRESHOLD = 125e16; // 1.25 in 18 decimals
    uint256 public constant CRITICAL_THRESHOLD = 105e16; // 1.05 in 18 decimals
    uint256 public constant PRECISION = 1e18;

    // ──────────────────────── State ────────────────────────
    MockPriceOracle public priceOracle;
    address public owner;

    struct Position {
        uint256 collateralAmount; // ETH deposited (in wei)
        uint256 borrowedAmount; // RUSD borrowed (in 18 decimals)
        bool isActive;
    }

    mapping(address => Position) public positions;
    address[] public activeUsers;
    mapping(address => bool) private isActiveUser;

    // ──────────────────────── Events ────────────────────────
    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 totalCollateral
    );
    event Borrow(
        address indexed user,
        uint256 amount,
        uint256 totalBorrowed,
        uint256 healthFactor
    );
    event Repay(
        address indexed user,
        uint256 amount,
        uint256 remainingDebt,
        uint256 healthFactor
    );
    event Withdraw(
        address indexed user,
        uint256 amount,
        uint256 remainingCollateral
    );
    event Liquidated(
        address indexed user,
        address indexed liquidator,
        uint256 debtRepaid,
        uint256 collateralSeized
    );
    event HealthFactorUpdated(
        address indexed user,
        uint256 healthFactor,
        uint256 collateralValue,
        uint256 borrowedAmount
    );

    // ──────────────────────── Modifiers ────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "SimpleLending: not owner");
        _;
    }

    // ──────────────────────── Constructor ────────────────────────
    constructor(address _priceOracle) {
        priceOracle = MockPriceOracle(_priceOracle);
        owner = msg.sender;
    }

    // ──────────────────────── Core Functions ────────────────────────

    /**
     * @notice Deposit ETH as collateral
     */
    function deposit() external payable {
        require(msg.value > 0, "SimpleLending: deposit must be > 0");

        Position storage pos = positions[msg.sender];
        pos.collateralAmount += msg.value;
        pos.isActive = true;

        if (!isActiveUser[msg.sender]) {
            activeUsers.push(msg.sender);
            isActiveUser[msg.sender] = true;
        }

        emit Deposit(msg.sender, msg.value, pos.collateralAmount);

        if (pos.borrowedAmount > 0) {
            uint256 hf = calculateHealthFactor(msg.sender);
            emit HealthFactorUpdated(
                msg.sender,
                hf,
                getCollateralValue(msg.sender),
                pos.borrowedAmount
            );
        }
    }

    /**
     * @notice Borrow RUSD against deposited collateral
     * @param _amount Amount of RUSD to borrow (18 decimals)
     */
    function borrow(uint256 _amount) external {
        require(_amount > 0, "SimpleLending: borrow must be > 0");

        Position storage pos = positions[msg.sender];
        require(pos.isActive, "SimpleLending: no active position");
        require(pos.collateralAmount > 0, "SimpleLending: no collateral");

        pos.borrowedAmount += _amount;

        uint256 hf = calculateHealthFactor(msg.sender);
        require(
            hf >= PRECISION,
            "SimpleLending: health factor too low after borrow"
        );

        emit Borrow(msg.sender, _amount, pos.borrowedAmount, hf);
        emit HealthFactorUpdated(
            msg.sender,
            hf,
            getCollateralValue(msg.sender),
            pos.borrowedAmount
        );
    }

    /**
     * @notice Repay borrowed RUSD to improve health factor
     * @param _amount Amount of RUSD to repay (18 decimals)
     */
    function repay(uint256 _amount) external {
        Position storage pos = positions[msg.sender];
        require(pos.borrowedAmount > 0, "SimpleLending: no debt to repay");
        require(_amount > 0, "SimpleLending: repay must be > 0");

        uint256 repayAmount = _amount > pos.borrowedAmount
            ? pos.borrowedAmount
            : _amount;
        pos.borrowedAmount -= repayAmount;

        uint256 hf = pos.borrowedAmount > 0
            ? calculateHealthFactor(msg.sender)
            : type(uint256).max;

        emit Repay(msg.sender, repayAmount, pos.borrowedAmount, hf);
        emit HealthFactorUpdated(
            msg.sender,
            hf,
            getCollateralValue(msg.sender),
            pos.borrowedAmount
        );
    }

    /**
     * @notice Withdraw collateral (only if health factor remains safe)
     * @param _amount Amount of ETH to withdraw (in wei)
     */
    function withdraw(uint256 _amount) external {
        Position storage pos = positions[msg.sender];
        require(
            pos.collateralAmount >= _amount,
            "SimpleLending: insufficient collateral"
        );

        pos.collateralAmount -= _amount;

        if (pos.borrowedAmount > 0) {
            uint256 hf = calculateHealthFactor(msg.sender);
            require(
                hf >= PRECISION,
                "SimpleLending: health factor too low after withdrawal"
            );
            emit HealthFactorUpdated(
                msg.sender,
                hf,
                getCollateralValue(msg.sender),
                pos.borrowedAmount
            );
        }

        if (pos.collateralAmount == 0 && pos.borrowedAmount == 0) {
            pos.isActive = false;
        }

        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "SimpleLending: ETH transfer failed");

        emit Withdraw(msg.sender, _amount, pos.collateralAmount);
    }

    /**
     * @notice Liquidate an unhealthy position
     * @param _user Address of the user to liquidate
     */
    function liquidate(address _user) external {
        Position storage pos = positions[_user];
        require(pos.isActive, "SimpleLending: no active position");
        require(pos.borrowedAmount > 0, "SimpleLending: no debt");

        uint256 hf = calculateHealthFactor(_user);
        require(hf < PRECISION, "SimpleLending: position is healthy");

        uint256 debtToRepay = pos.borrowedAmount;
        uint256 collateralToSeize = (debtToRepay * PRECISION) /
            priceOracle.getPrice();
        uint256 bonusCollateral = (collateralToSeize * LIQUIDATION_BONUS) /
            BASIS_POINTS;
        uint256 totalSeize = collateralToSeize + bonusCollateral;

        if (totalSeize > pos.collateralAmount) {
            totalSeize = pos.collateralAmount;
        }

        pos.borrowedAmount = 0;
        pos.collateralAmount -= totalSeize;

        if (pos.collateralAmount == 0) {
            pos.isActive = false;
        }

        (bool success, ) = msg.sender.call{value: totalSeize}("");
        require(success, "SimpleLending: ETH transfer failed");

        emit Liquidated(_user, msg.sender, debtToRepay, totalSeize);
    }

    // ──────────────────────── View Functions ────────────────────────

    /**
     * @notice Calculate health factor for a user
     * @return Health factor in 18 decimal format (1e18 = 1.0)
     */
    function calculateHealthFactor(
        address _user
    ) public view returns (uint256) {
        Position storage pos = positions[_user];
        if (pos.borrowedAmount == 0) return type(uint256).max;

        uint256 collateralValue = getCollateralValue(_user);
        uint256 adjustedCollateral = (collateralValue * LIQUIDATION_THRESHOLD) /
            BASIS_POINTS;

        return (adjustedCollateral * PRECISION) / pos.borrowedAmount;
    }

    /**
     * @notice Get collateral value in USD (18 decimals)
     */
    function getCollateralValue(address _user) public view returns (uint256) {
        Position storage pos = positions[_user];
        return (pos.collateralAmount * priceOracle.getPrice()) / PRECISION;
    }

    /**
     * @notice Get full position data for a user
     */
    function getPosition(
        address _user
    )
        external
        view
        returns (
            uint256 collateralAmount,
            uint256 borrowedAmount,
            uint256 collateralValue,
            uint256 healthFactor,
            bool isActive
        )
    {
        Position storage pos = positions[_user];
        collateralAmount = pos.collateralAmount;
        borrowedAmount = pos.borrowedAmount;
        collateralValue = getCollateralValue(_user);
        healthFactor = pos.borrowedAmount > 0
            ? calculateHealthFactor(_user)
            : type(uint256).max;
        isActive = pos.isActive;
    }

    /**
     * @notice Get all active users (for guardian monitoring)
     */
    function getActiveUsers() external view returns (address[] memory) {
        return activeUsers;
    }

    /**
     * @notice Get number of active users
     */
    function getActiveUserCount() external view returns (uint256) {
        return activeUsers.length;
    }

    /**
     * @notice Check the health status of a position
     * @return status 0 = SAFE, 1 = WARNING, 2 = CRITICAL, 3 = LIQUIDATABLE
     */
    function getHealthStatus(
        address _user
    ) external view returns (uint8 status) {
        Position storage pos = positions[_user];
        if (!pos.isActive || pos.borrowedAmount == 0) return 0;

        uint256 hf = calculateHealthFactor(_user);

        if (hf < PRECISION) return 3; // LIQUIDATABLE
        if (hf <= CRITICAL_THRESHOLD) return 2; // CRITICAL
        if (hf <= WARNING_THRESHOLD) return 1; // WARNING
        return 0; // SAFE
    }

    // ──────────────────────── Admin ────────────────────────

    /**
     * @notice Update the price oracle address
     */
    function setPriceOracle(address _newOracle) external onlyOwner {
        priceOracle = MockPriceOracle(_newOracle);
    }

    receive() external payable {
        // Accept ETH deposits directly
        Position storage pos = positions[msg.sender];
        pos.collateralAmount += msg.value;
        pos.isActive = true;

        if (!isActiveUser[msg.sender]) {
            activeUsers.push(msg.sender);
            isActiveUser[msg.sender] = true;
        }

        emit Deposit(msg.sender, msg.value, pos.collateralAmount);
    }
}
