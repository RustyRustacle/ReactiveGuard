// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SimpleLending.sol";

/**
 * @title ReactiveGuardian
 * @notice Health factor monitor that emits EVM events when positions enter
 *         danger zones. Somnia Reactivity SDK subscribes to these events
 *         off-chain for real-time notification delivery.
 *
 * Events emitted:
 *   - HealthFactorAlert (warning zone: HF ≤ 1.25)
 *   - LiquidationImminent (critical zone: HF ≤ 1.05)
 *
 * The Somnia Reactivity subscriber watches for these specific event topics
 * and relays them to the frontend via WebSocket in < 1 second.
 */
contract ReactiveGuardian {
    // ──────────────────────── State ────────────────────────
    SimpleLending public lending;
    address public owner;

    uint256 public warningThreshold = 125e16; // 1.25 in 18 decimals
    uint256 public criticalThreshold = 105e16; // 1.05 in 18 decimals

    // Track last alert to avoid spamming
    mapping(address => uint256) public lastAlertBlock;
    mapping(address => uint8) public lastAlertLevel;

    // ──────────────────────── Events (Somnia Reactivity watches these) ────────────────────────

    /**
     * @notice Emitted when a position enters the WARNING zone (1.05 < HF ≤ 1.25)
     * @dev Somnia Reactivity SDK subscribes to this event topic for real-time alerts
     */
    event HealthFactorAlert(
        address indexed user,
        uint256 healthFactor,
        uint256 collateralValue,
        uint256 borrowedAmount,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a position enters the CRITICAL zone (HF ≤ 1.05)
     * @dev Somnia Reactivity SDK subscribes to this event topic for real-time alerts
     */
    event LiquidationImminent(
        address indexed user,
        uint256 healthFactor,
        uint256 collateralValue,
        uint256 borrowedAmount,
        uint256 requiredTopUp,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a position returns to SAFE zone
     */
    event PositionSafe(
        address indexed user,
        uint256 healthFactor,
        uint256 timestamp
    );

    // ──────────────────────── Modifiers ────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "ReactiveGuardian: not owner");
        _;
    }

    // ──────────────────────── Constructor ────────────────────────
    constructor(address _lending) {
        lending = SimpleLending(payable(_lending));
        owner = msg.sender;
    }

    // ──────────────────────── Core Functions ────────────────────────

    /**
     * @notice Check health factor for a user and emit reactive events
     * @dev Anyone can call this. The Somnia Reactivity SDK subscribes to
     *      the emitted events for real-time delivery to the frontend.
     * @param _user Address of the user position to check
     */
    function checkHealthFactor(address _user) external {
        (
            ,
            uint256 borrowedAmount,
            uint256 collateralValue,
            uint256 healthFactor,
            bool isActive
        ) = lending.getPosition(_user);

        require(isActive, "ReactiveGuardian: no active position");
        require(borrowedAmount > 0, "ReactiveGuardian: no debt");

        if (healthFactor <= criticalThreshold) {
            // CRITICAL — Liquidation is imminent
            uint256 requiredTopUp = _calculateRequiredTopUp(
                collateralValue,
                borrowedAmount
            );

            emit LiquidationImminent(
                _user,
                healthFactor,
                collateralValue,
                borrowedAmount,
                requiredTopUp,
                block.timestamp
            );

            lastAlertBlock[_user] = block.number;
            lastAlertLevel[_user] = 2;
        } else if (healthFactor <= warningThreshold) {
            // WARNING — Position is in danger zone
            emit HealthFactorAlert(
                _user,
                healthFactor,
                collateralValue,
                borrowedAmount,
                block.timestamp
            );

            lastAlertBlock[_user] = block.number;
            lastAlertLevel[_user] = 1;
        } else {
            // SAFE — Emit recovery event if was previously in danger
            if (lastAlertLevel[_user] > 0) {
                emit PositionSafe(_user, healthFactor, block.timestamp);
                lastAlertLevel[_user] = 0;
            }
        }
    }

    /**
     * @notice Batch check health factors for multiple users
     * @dev Useful for monitoring all positions after a price update
     */
    function batchCheckHealthFactors(address[] calldata _users) external {
        for (uint256 i = 0; i < _users.length; i++) {
            try this.checkHealthFactor(_users[i]) {} catch {}
        }
    }

    // ──────────────────────── View Functions ────────────────────────

    /**
     * @notice Calculate the ETH amount needed to return to safety
     */
    function getRequiredTopUp(address _user) external view returns (uint256) {
        (
            ,
            uint256 borrowedAmount,
            uint256 collateralValue,
            ,
            bool isActive
        ) = lending.getPosition(_user);

        if (!isActive || borrowedAmount == 0) return 0;
        return _calculateRequiredTopUp(collateralValue, borrowedAmount);
    }

    /**
     * @notice Get the alert level for a user
     * @return level 0 = SAFE, 1 = WARNING, 2 = CRITICAL
     */
    function getAlertLevel(address _user) external view returns (uint8 level) {
        (
            ,
            uint256 borrowedAmount,
            ,
            uint256 healthFactor,
            bool isActive
        ) = lending.getPosition(_user);

        if (!isActive || borrowedAmount == 0) return 0;

        if (healthFactor <= criticalThreshold) return 2;
        if (healthFactor <= warningThreshold) return 1;
        return 0;
    }

    // ──────────────────────── Admin ────────────────────────

    /**
     * @notice Update alert thresholds
     */
    function setThresholds(
        uint256 _warning,
        uint256 _critical
    ) external onlyOwner {
        require(
            _warning > _critical,
            "ReactiveGuardian: warning must be > critical"
        );
        require(_critical > 1e18, "ReactiveGuardian: critical must be > 1.0");
        warningThreshold = _warning;
        criticalThreshold = _critical;
    }

    // ──────────────────────── Internal ────────────────────────

    function _calculateRequiredTopUp(
        uint256 _collateralValue,
        uint256 _borrowedAmount
    ) internal view returns (uint256) {
        // Target: health factor = 1.5 (safe buffer above warning)
        uint256 targetHF = 150e16; // 1.50
        uint256 liqThreshold = lending.LIQUIDATION_THRESHOLD();
        uint256 basisPoints = lending.BASIS_POINTS();
        uint256 precision = lending.PRECISION();

        // Required collateral value = (targetHF × borrowedAmount) / (liqThreshold / basisPoints)
        uint256 requiredCollateralValue = (targetHF *
            _borrowedAmount *
            basisPoints) / (liqThreshold * precision);

        if (requiredCollateralValue <= _collateralValue) return 0;

        uint256 additionalValueNeeded = requiredCollateralValue -
            _collateralValue;
        uint256 price = lending.priceOracle().getPrice();

        // Convert USD value to ETH amount
        return (additionalValueNeeded * precision) / price;
    }
}
