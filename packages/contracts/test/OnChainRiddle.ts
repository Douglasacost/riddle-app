import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { keccak256, toBytes, getAddress } from "viem";

describe("OnChainRiddle", function () {
  async function deployRiddleFixture() {
    const [bot, otherAccount] = await hre.viem.getWalletClients();

    const riddle = await hre.viem.deployContract("OnChainRiddle", []);

    const testRiddle = "What has keys, but no locks?";
    const testAnswer = "piano";
    const answerHash = keccak256(toBytes(testAnswer));

    const publicClient = await hre.viem.getPublicClient();

    return {
      riddle,
      bot,
      otherAccount,
      testRiddle,
      testAnswer,
      answerHash,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right bot", async function () {
      const { riddle, bot } = await loadFixture(deployRiddleFixture);
      expect(await riddle.read.bot()).to.equal(getAddress(bot.account.address));
    });

    it("Should start with no active riddle", async function () {
      const { riddle } = await loadFixture(deployRiddleFixture);
      expect(await riddle.read.isActive()).to.equal(false);
    });
  });

  describe("Setting Riddle", function () {
    it("Should allow bot to set riddle", async function () {
      const { riddle, testRiddle, answerHash, publicClient } =
        await loadFixture(deployRiddleFixture);

      const hash = await riddle.write.setRiddle([testRiddle, answerHash]);
      await publicClient.waitForTransactionReceipt({ hash });

      const events = await riddle.getEvents.RiddleSet();
      expect(events).to.have.lengthOf(1);
      expect(events[0].args.riddle).to.deep.equal(testRiddle);
      
      expect(await riddle.read.riddle()).to.equal(testRiddle);
      expect(await riddle.read.isActive()).to.equal(true);
    });

    it("Should not allow non-bot to set riddle", async function () {
      const { riddle, otherAccount, testRiddle, answerHash } =
        await loadFixture(deployRiddleFixture);

      const riddleAsOther = await hre.viem.getContractAt(
        "OnChainRiddle",
        riddle.address,
        { client: { wallet: otherAccount } }
      );

      await expect(
        riddleAsOther.write.setRiddle([testRiddle, answerHash])
      ).to.be.rejectedWith("Only bot can call this function");
    });

    it("Should not allow setting new riddle while active", async function () {
      const { riddle, testRiddle, answerHash } =
        await loadFixture(deployRiddleFixture);

      await riddle.write.setRiddle([testRiddle, answerHash]);

      await expect(
        riddle.write.setRiddle([testRiddle, answerHash])
      ).to.be.rejectedWith("Riddle already active");
    });
  });

  describe("Answering Riddle", function () {
    it("Should not allow answering when no riddle is active", async function () {
      const { riddle, testAnswer } = await loadFixture(deployRiddleFixture);

      await expect(riddle.write.submitAnswer([testAnswer])).to.be.rejectedWith(
        "No active riddle"
      );
    });

    it("Should emit event on wrong answer", async function () {
      const { riddle, testRiddle, answerHash, publicClient } =
        await loadFixture(deployRiddleFixture);

      await riddle.write.setRiddle([testRiddle, answerHash]);

      const hash = await riddle.write.submitAnswer(["wrong answer"]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const attemptEvents = await riddle.getEvents.AnswerAttempt();
      expect(attemptEvents).to.have.lengthOf(1);
      expect(attemptEvents[0].args).to.deep.equal({
        user: await riddle.read.bot(),
        correct: false,
      });

      const winnerEvents = await riddle.getEvents.Winner();
      expect(winnerEvents).to.have.lengthOf(0);
    });

    it("Should handle correct answer properly", async function () {
      const { riddle, testRiddle, testAnswer, answerHash, publicClient } =
        await loadFixture(deployRiddleFixture);

      await riddle.write.setRiddle([testRiddle, answerHash]);

      const hash = await riddle.write.submitAnswer([testAnswer]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const attemptEvents = await riddle.getEvents.AnswerAttempt();
      expect(attemptEvents).to.have.lengthOf(1);
      expect(attemptEvents[0].args).to.deep.equal({
        user: await riddle.read.bot(),
        correct: true,
      });

      const winnerEvents = await riddle.getEvents.Winner();
      expect(winnerEvents).to.have.lengthOf(1);
      expect(winnerEvents[0].args).to.deep.equal({
        user: await riddle.read.bot(),
      });

      expect(await riddle.read.isActive()).to.equal(false);
      expect(await riddle.read.winner()).to.equal(await riddle.read.bot());
    });

    it("Should not allow answering after riddle is solved", async function () {
      const { riddle, testRiddle, testAnswer, answerHash, publicClient } = await loadFixture(deployRiddleFixture);
      
      const setHash = await riddle.write.setRiddle([testRiddle, answerHash]);
      await publicClient.waitForTransactionReceipt({ hash: setHash });
      const solveHash = await riddle.write.submitAnswer([testAnswer]);
      await publicClient.waitForTransactionReceipt({ hash: solveHash });

      await expect(riddle.write.submitAnswer([testAnswer])).to.be.rejectedWith(
        "Riddle already solved"
      );
    });
  });
});
