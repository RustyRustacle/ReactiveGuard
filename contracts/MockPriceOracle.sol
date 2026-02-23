// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockPriceOracle
 * @notice Simulated ETH/USD price feed for demo purposes.
 *         Owner can update the price to simulate market movements.
 *         In production, replace with Chainlink or Pyth integration.
 */
contract MockPriceOracle {
    uint256 public price; // Price in 18 decimals (e.g., 2000e18 = $2,000)
    address public owner;

    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "MockPriceOracle: caller is not the owner");
        _;
    }

    constructor(uint256 _initialPrice) {
        owner = msg.sender;
        price = _initialPrice;
        emit PriceUpdated(0, _initialPrice, block.timestamp);
    }

    /**
     * @notice Update the ETH/USD price (owner only)
     * @param _newPrice The new price in 18 decimal format
     */
    function updatePrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "MockPriceOracle: price must be > 0");
        uint256 oldPrice = price;
        price = _newPrice;
        emit PriceUpdated(oldPrice, _newPrice, block.timestamp);
    }

    /**
     * @notice Get the current ETH/USD price
     * @return The current price in 18 decimal format
     */
    function getPrice() external view returns (uint256) {
        return price;
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "MockPriceOracle: new owner is zero address");
        owner = _newOwner;
    }
}
