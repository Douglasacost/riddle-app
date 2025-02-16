import { NextResponse } from "next/server";
import { createWalletClient, http, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eip712WalletActions, zksyncSepoliaTestnet } from "viem/zksync";
import { OnChainRiddleAbi } from "@repo/hooks";
import OnChainRiddle from "@repo/contracts/abi";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddleAbi;

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const RIDDLE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_RIDDLE_CONTRACT_ADDRESS;

const riddles = [
  {
    riddle: "What has to be broken before you can use it?",
    answer: "An egg",
  },
  {
    riddle: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
    answer: "A candle",
  },
  {
    riddle: "What has hands but can't clap?",
    answer: "A clock",
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps",
  },
  {
    riddle: "What has a face and two hands but no arms or legs?",
    answer: "A clock",
  },
];

const setRiddle = async () => {
  try {
    const randomIndex = Math.floor(Math.random() * riddles.length);
    const randomRiddle = riddles[randomIndex]!;

    console.log("Setting riddle:", randomRiddle);

    const { client } = getWallet();
    const hashedAnswer = keccak256(toBytes(randomRiddle.answer));
    await client.writeContract({
      address: RIDDLE_CONTRACT_ADDRESS as `0x${string}`,
      abi: RIDDLE_ABI,
      functionName: "setRiddle",
      args: [randomRiddle.riddle, hashedAnswer],
    });
    console.log("Riddle set:", randomRiddle);
    return true;
  } catch (error) {
    console.error("Error submitting answer:", error);
    return false;
  }
};

const getWallet = () => {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
  }

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);

  const client = createWalletClient({
    account,
    chain: zksyncSepoliaTestnet,
    transport: http(),
  }).extend(eip712WalletActions());

  return { client, account };
};

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body = await request.json();

    if (!body.webhookId || body.webhookId !== "wh_hak0sy08vdy1wbl") {
      return NextResponse.json(
        { error: "Missing event field in request body" },
        { status: 400 }
      );
    }

    setRiddle();

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
