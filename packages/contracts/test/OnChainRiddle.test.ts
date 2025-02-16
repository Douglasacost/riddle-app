import { expect } from "chai";
import * as hre from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";

describe("OnChainRiddle", function () {
  async function deployRiddleFixture() {
    const [bot, otherAccount] = await hre.ethers.getSigners();

    const OnChainRiddle = await hre.ethers.getContractFactory("OnChainRiddle");
    const riddle = await OnChainRiddle.deploy();
    await riddle.waitForDeployment();

    const testRiddle = "What has keys, but no locks?";
    const testAnswer = "piano";
    const answerHash = keccak256(toUtf8Bytes(testAnswer));

    return {
      riddle,
      bot,
      otherAccount,
      testRiddle,
      testAnswer,
      answerHash,
    };
  }

  describe("Deployment", function () {
    it("Should set the right bot", async function () {
      const { riddle, bot } = await deployRiddleFixture();
      expect(await riddle.bot()).to.equal(bot.address);
    });

    it("Should start with no active riddle", async function () {
      const { riddle } = await deployRiddleFixture();
      expect(await riddle.isActive()).to.equal(false);
    });
  });

  describe("Setting Riddle", function () {
    it("Should allow bot to set riddle", async function () {
      const { riddle, testRiddle, answerHash } = await deployRiddleFixture();

      const tx = await riddle.setRiddle(testRiddle, answerHash);
      await tx.wait();

      expect(await riddle.riddle()).to.equal(testRiddle);
      expect(await riddle.isActive()).to.equal(true);
    });

    it("Should not allow non-bot to set riddle", async function () {
      const { riddle, otherAccount, testRiddle, answerHash } =
        await deployRiddleFixture();

      await expect(
        riddle.connect(otherAccount).setRiddle(testRiddle, answerHash)
      ).to.be.rejectedWith("Only bot can call this function");
    });

    it("Should not allow setting new riddle while active", async function () {
      const { riddle, testRiddle, answerHash } = await deployRiddleFixture();

      const tx = await riddle.setRiddle(testRiddle, answerHash);
      await tx.wait();

      await expect(riddle.setRiddle(testRiddle, answerHash)).to.be.rejectedWith(
        "Riddle already active"
      );
    });
  });

  describe("Answering Riddle", function () {
    it("Should not allow answering when no riddle is active", async function () {
      const { riddle, testAnswer } = await deployRiddleFixture();

      await expect(riddle.submitAnswer(testAnswer)).to.be.rejectedWith(
        "No active riddle"
      );
    });

    it("Should emit event on wrong answer", async function () {
      const { riddle, testRiddle, answerHash } =
        await deployRiddleFixture();

      const tx = await riddle.setRiddle(testRiddle, answerHash);
      await tx.wait();

      await expect(riddle.submitAnswer("wrong answer"))
        .to.emit(riddle, "AnswerAttempt")
        .withArgs(await riddle.bot(), false);
    });

    it("Should handle correct answer properly", async function () {
      const { riddle, testRiddle, testAnswer, answerHash } =
        await deployRiddleFixture();

      await riddle.setRiddle(testRiddle, answerHash);

      await expect(riddle.submitAnswer(testAnswer))
        .to.emit(riddle, "AnswerAttempt")
        .withArgs(await riddle.bot(), true)
        .to.emit(riddle, "Winner")
        .withArgs(await riddle.bot());

      expect(await riddle.isActive()).to.equal(false);
      expect(await riddle.winner()).to.equal(await riddle.bot());
    });

    it("Should not allow answering after riddle is solved", async function () {
      const { riddle, testRiddle, testAnswer, answerHash } =
        await deployRiddleFixture();

      const setTx = await riddle.setRiddle(testRiddle, answerHash);
      await setTx.wait();

      const solveTx = await riddle.submitAnswer(testAnswer);
      await solveTx.wait();

      await expect(riddle.submitAnswer(testAnswer)).to.be.rejectedWith(
        "Riddle already solved"
      );
    });
  });
});
