import { createWalletClient, http, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { eip712WalletActions, zksyncSepoliaTestnet } from "viem/zksync";
import { OnChainRiddleAbi } from "@repo/hooks";
import OnChainRiddle from "@repo/contracts/abi";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddleAbi;

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const WEBHOOK_ID = process.env.WEBHOOK_ID;
const RIDDLE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_RIDDLE_CONTRACT_ADDRESS;

const riddles = [
  {
    riddle: "What has to be broken before you can use it?",
    answer: "Eggs",
  },
  {
    riddle: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
    answer: "candle",
  },
  {
    riddle: "What has hands but can't clap?",
    answer: "clock",
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps",
  },
  {
    riddle: "What has a face and two hands but no arms or legs?",
    answer: "clock",
  },
  {
    riddle: "What is full of holes but still holds water?",
    answer: "sponge",
  },
  {
    riddle: "I add flavor to your dishes and keep your hash safe. What am I?",
    answer: "Salt",
  },
];

const setRiddle = async () => {
  try {
    const randomIndex = Math.floor(Math.random() * riddles.length);
    const randomRiddle = riddles[randomIndex]!;

    console.log("Setting riddle:", randomRiddle);

    const { client } = getWallet();
    console.log("Client:", client.account.address);

    console.log("Hashing answer:", randomRiddle.answer.toLowerCase());
    const hashedAnswer = keccak256(toBytes(randomRiddle.answer.toLowerCase()));

    console.log("Writing contract:", RIDDLE_CONTRACT_ADDRESS);
    const tx = await client.writeContract({
      address: RIDDLE_CONTRACT_ADDRESS as `0x${string}`,
      abi: RIDDLE_ABI,
      functionName: "setRiddle",
      args: [randomRiddle.riddle, hashedAnswer],
      type: "eip712",
    });

    console.log("Transaction:", tx);
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

  const account = privateKeyToAccount(`0x${PRIVATE_KEY}` as `0x${string}`);

  const client = createWalletClient({
    account,
    chain: zksyncSepoliaTestnet,
    transport: http(),
  }).extend(eip712WalletActions());

  return { client, account };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Body:", body);

    if (body.length === 0) {
      return new Response("Missing event field in request body", {
        status: 400,
      });
    }

    await setRiddle();

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
