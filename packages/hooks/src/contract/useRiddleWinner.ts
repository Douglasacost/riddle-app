import { useMemo } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { BaseContractConfig } from "./types";
import { zeroAddress } from "viem";
import OnChainRiddle from "@repo/contracts/abi";

const RIDDLE_ABI = OnChainRiddle.abi;

export interface UseRiddleWinnerConfig extends BaseContractConfig {}

export function useRiddleWinner({ address }: UseRiddleWinnerConfig) {
  const {
    data: currentWinner,
    refetch: lookupWinner,
    isLoading,
    error,
  } = useReadContract({
    address,
    abi: RIDDLE_ABI,
    functionName: "winner"
  });

  const hasWinner = useMemo(() => {
    return currentWinner !== undefined && currentWinner !== zeroAddress;
  }, [currentWinner]);

  useWatchContractEvent({
    address,
    abi: RIDDLE_ABI,
    eventName: "Winner",
    pollingInterval: 2000,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const user = log.args.user;
        if (user && user !== zeroAddress) {
          lookupWinner();
        }
      });
    },
  });

  return {
    winner: currentWinner,
    hasWinner,
    isLoading,
    error,
    lookupWinner,
  };
}
