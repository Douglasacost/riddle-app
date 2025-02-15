import { useCallback } from "react";
import { useReadContract } from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "@repo/contracts/types";
import { Address } from "viem";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];
export interface UseIsRiddleBotConfig extends BaseContractConfig {}

export function useIsRiddleBot({ address }: UseIsRiddleBotConfig) {
  // read bot
  const {
    data: bot,
    error: botError,
    isPending: isBotPending,
  } = useReadContract({
    address,
    abi: RIDDLE_ABI,
    functionName: "bot",
  });

  const checkBot = useCallback(
    (address: Address) => {
      if (bot === address) {
        return true;
      }
      return false;
    },
    [bot]
  );

  return {
    checkBot,
    isLoading: isBotPending,
    error: botError,
  };
}
