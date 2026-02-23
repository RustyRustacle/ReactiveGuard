import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "STT");

    // 1. Deploy MockPriceOracle with initial ETH price of $2,000
    const initialPrice = ethers.parseEther("2000"); // $2,000 in 18 decimals
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy(initialPrice);
    await priceOracle.waitForDeployment();
    const priceOracleAddr = await priceOracle.getAddress();
    console.log("✅ MockPriceOracle deployed to:", priceOracleAddr);

    // 2. Deploy SimpleLending with price oracle
    const SimpleLending = await ethers.getContractFactory("SimpleLending");
    const lending = await SimpleLending.deploy(priceOracleAddr);
    await lending.waitForDeployment();
    const lendingAddr = await lending.getAddress();
    console.log("✅ SimpleLending deployed to:", lendingAddr);

    // 3. Deploy ReactiveGuardian with lending
    const ReactiveGuardian = await ethers.getContractFactory("ReactiveGuardian");
    const guardian = await ReactiveGuardian.deploy(lendingAddr);
    await guardian.waitForDeployment();
    const guardianAddr = await guardian.getAddress();
    console.log("✅ ReactiveGuardian deployed to:", guardianAddr);

    // 4. Deploy GuardianAutomation with lending
    const GuardianAutomation = await ethers.getContractFactory("GuardianAutomation");
    const automation = await GuardianAutomation.deploy(lendingAddr);
    await automation.waitForDeployment();
    const automationAddr = await automation.getAddress();
    console.log("✅ GuardianAutomation deployed to:", automationAddr);

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("           ReactiveGuard — Deployment Complete          ");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`MockPriceOracle:     ${priceOracleAddr}`);
    console.log(`SimpleLending:       ${lendingAddr}`);
    console.log(`ReactiveGuardian:    ${guardianAddr}`);
    console.log(`GuardianAutomation:  ${automationAddr}`);
    console.log("═══════════════════════════════════════════════════════");
    console.log("\nAdd these to your .env file:");
    console.log(`PRICE_ORACLE_ADDRESS=${priceOracleAddr}`);
    console.log(`LENDING_ADDRESS=${lendingAddr}`);
    console.log(`GUARDIAN_ADDRESS=${guardianAddr}`);
    console.log(`AUTOMATION_ADDRESS=${automationAddr}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
