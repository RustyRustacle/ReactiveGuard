import { expect } from "chai";
import { ethers } from "hardhat";
import { MockPriceOracle, SimpleLending, ReactiveGuardian } from "../typechain-types";

describe("ReactiveGuard", function () {
    let priceOracle: MockPriceOracle;
    let lending: SimpleLending;
    let guardian: ReactiveGuardian;
    let owner: any;
    let user1: any;
    let user2: any;

    const INITIAL_PRICE = ethers.parseEther("2000"); // $2,000
    const DEPOSIT_AMOUNT = ethers.parseEther("1");   // 1 ETH
    const BORROW_AMOUNT = ethers.parseEther("1200"); // 1200 RUSD

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy MockPriceOracle
        const OracleFactory = await ethers.getContractFactory("MockPriceOracle");
        priceOracle = (await OracleFactory.deploy(INITIAL_PRICE)) as unknown as MockPriceOracle;

        // Deploy SimpleLending
        const LendingFactory = await ethers.getContractFactory("SimpleLending");
        lending = (await LendingFactory.deploy(await priceOracle.getAddress())) as unknown as SimpleLending;

        // Deploy ReactiveGuardian
        const GuardianFactory = await ethers.getContractFactory("ReactiveGuardian");
        guardian = (await GuardianFactory.deploy(await lending.getAddress())) as unknown as ReactiveGuardian;
    });

    describe("MockPriceOracle", function () {
        it("should initialize with correct price", async function () {
            expect(await priceOracle.getPrice()).to.equal(INITIAL_PRICE);
        });

        it("should allow owner to update price", async function () {
            const newPrice = ethers.parseEther("1500");
            await expect(priceOracle.updatePrice(newPrice))
                .to.emit(priceOracle, "PriceUpdated")
                .withArgs(INITIAL_PRICE, newPrice, await getTimestamp());
        });

        it("should reject non-owner price updates", async function () {
            await expect(
                priceOracle.connect(user1).updatePrice(ethers.parseEther("1500"))
            ).to.be.revertedWith("MockPriceOracle: caller is not the owner");
        });
    });

    describe("SimpleLending", function () {
        it("should accept deposits", async function () {
            await expect(lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT }))
                .to.emit(lending, "Deposit")
                .withArgs(user1.address, DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);

            const pos = await lending.getPosition(user1.address);
            expect(pos.collateralAmount).to.equal(DEPOSIT_AMOUNT);
            expect(pos.isActive).to.be.true;
        });

        it("should allow borrowing within health limits", async function () {
            await lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await lending.connect(user1).borrow(BORROW_AMOUNT);

            const pos = await lending.getPosition(user1.address);
            expect(pos.borrowedAmount).to.equal(BORROW_AMOUNT);
        });

        it("should calculate correct health factor", async function () {
            await lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await lending.connect(user1).borrow(BORROW_AMOUNT);

            // HF = (1 ETH * $2000 * 0.80) / $1200 = $1600 / $1200 = 1.333...
            const hf = await lending.calculateHealthFactor(user1.address);
            const expected = ethers.parseEther("1.333333333333333333");
            expect(hf).to.be.closeTo(expected, ethers.parseEther("0.001"));
        });

        it("should reject borrows that make position unhealthy", async function () {
            await lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            // Try to borrow $1800 → HF = (2000 * 0.8) / 1800 = 0.888 < 1.0
            await expect(
                lending.connect(user1).borrow(ethers.parseEther("1800"))
            ).to.be.revertedWith("SimpleLending: health factor too low after borrow");
        });

        it("should allow repayment", async function () {
            await lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await lending.connect(user1).borrow(BORROW_AMOUNT);
            await lending.connect(user1).repay(ethers.parseEther("600"));

            const pos = await lending.getPosition(user1.address);
            expect(pos.borrowedAmount).to.equal(ethers.parseEther("600"));
        });

        it("should return correct health status", async function () {
            await lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await lending.connect(user1).borrow(BORROW_AMOUNT);

            // HF ~1.33 → SAFE (status 0) since > 1.25
            let status = await lending.getHealthStatus(user1.address);
            expect(status).to.equal(0);

            // Drop price to $1500 → HF = (1500 * 0.8) / 1200 = 1.0 → LIQUIDATABLE
            await priceOracle.updatePrice(ethers.parseEther("1500"));
            status = await lending.getHealthStatus(user1.address);
            expect(status).to.equal(3); // LIQUIDATABLE
        });
    });

    describe("ReactiveGuardian", function () {
        beforeEach(async function () {
            await lending.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
            await lending.connect(user1).borrow(BORROW_AMOUNT);
        });

        it("should emit HealthFactorAlert on warning zone", async function () {
            // Drop price so HF enters warning zone (1.05 < HF ≤ 1.25)
            // Need HF ~1.15 → price = (1.15 * 1200) / 0.8 = $1725
            await priceOracle.updatePrice(ethers.parseEther("1725"));

            await expect(guardian.checkHealthFactor(user1.address))
                .to.emit(guardian, "HealthFactorAlert");
        });

        it("should emit LiquidationImminent on critical zone", async function () {
            // Drop price so HF enters critical zone (HF ≤ 1.05)
            // Need HF ~1.02 → price = (1.02 * 1200) / 0.8 = $1530
            await priceOracle.updatePrice(ethers.parseEther("1530"));

            await expect(guardian.checkHealthFactor(user1.address))
                .to.emit(guardian, "LiquidationImminent");
        });

        it("should handle batch health checks", async function () {
            await lending.connect(user2).deposit({ value: DEPOSIT_AMOUNT });
            await lending.connect(user2).borrow(BORROW_AMOUNT);

            await priceOracle.updatePrice(ethers.parseEther("1530"));

            await expect(
                guardian.batchCheckHealthFactors([user1.address, user2.address])
            ).to.emit(guardian, "LiquidationImminent");
        });
    });

    async function getTimestamp(): Promise<number> {
        const block = await ethers.provider.getBlock("latest");
        return block!.timestamp;
    }
});
