import { ethers } from "hardhat";

/**
 * Helper script to simulate a price drop on MockPriceOracle.
 * Usage: npx hardhat run scripts/update-price.ts --network somniaTestnet
 *
 * After running this, the ReactiveGuardian's checkHealthFactor() should
 * detect that positions have entered danger zones, and Somnia Reactivity
 * will propagate the events to the frontend in < 1 second.
 */
async function main() {
    const oracleAddress = process.env.PRICE_ORACLE_ADDRESS;
    if (!oracleAddress) {
        console.error("❌ Set PRICE_ORACLE_ADDRESS in .env");
        process.exit(1);
    }

    const oracle = await ethers.getContractAt("MockPriceOracle", oracleAddress);
    const currentPrice = await oracle.getPrice();
    console.log("Current ETH price:", ethers.formatEther(currentPrice), "USD");

    // Simulate a 20% price drop
    const newPrice = (currentPrice * 80n) / 100n;
    console.log("New ETH price (20% drop):", ethers.formatEther(newPrice), "USD");

    const tx = await oracle.updatePrice(newPrice);
    await tx.wait();
    console.log("✅ Price updated! Tx hash:", tx.hash);

    // Now check health factors via ReactiveGuardian
    const guardianAddress = process.env.GUARDIAN_ADDRESS;
    if (guardianAddress) {
        const lendingAddress = process.env.LENDING_ADDRESS;
        if (lendingAddress) {
            const lending = await ethers.getContractAt("SimpleLending", lendingAddress);
            const users = await lending.getActiveUsers();

            if (users.length > 0) {
                const guardian = await ethers.getContractAt("ReactiveGuardian", guardianAddress);
                console.log(`\nChecking health factors for ${users.length} active user(s)...`);

                const tx2 = await guardian.batchCheckHealthFactors(users);
                await tx2.wait();
                console.log("✅ Health factors checked! Reactive events should fire now.");
                console.log("   Tx hash:", tx2.hash);
            } else {
                console.log("\nNo active users to check.");
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
