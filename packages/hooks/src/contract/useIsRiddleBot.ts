import { useCallback, useMemo } from "react";
import { useReadContract } from "wagmi";
import { BaseContractConfig } from "./types";
import { Abi, Address, zeroAddress } from "viem";
import OnChainRiddle from "@repo/contracts/abi";

const RIDDLE_ABI = OnChainRiddle.abi as Abi;

export interface UseIsRiddleBotConfig extends BaseContractConfig {}

export function useIsRiddleBot({ address }: UseIsRiddleBotConfig) {
  const {
    data: bot,
    error: botError,
    isPending: isBotPending,
    refetch,
  } = useReadContract({
    address,
    abi: RIDDLE_ABI,
    functionName: "bot"
  });

  // Memoize bot status
  const isBot = useMemo(() => {
    return bot !== undefined && bot !== zeroAddress;
  }, [bot]);

  const checkBot = useCallback(
    (addressToCheck: Address) => {
      if (!addressToCheck || !bot) return false;
      return bot.toLowerCase() === addressToCheck.toLowerCase();
    },
    [bot]
  );

  return {
    checkBot,
    isBot,
    bot,
    isLoading: isBotPending,
    error: botError,
    refetch,
  };
}
