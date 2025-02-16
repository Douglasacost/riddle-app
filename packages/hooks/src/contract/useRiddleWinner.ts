import { useEffect, useState } from "react";
import {
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "@repo/contracts/types";
import { Address, zeroAddress } from "viem";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];
export interface UseRiddleWinnerConfig extends BaseContractConfig {}

export function useRiddleWinner({ address }: UseRiddleWinnerConfig) {
  const [winner, setWinner] = useState<Address | null>(null);

  const { data: hasAnswered, refetch: lookupWinner } = useReadContract({
    address,
    abi: RIDDLE_ABI,
    functionName: "winner",
  });

  useWatchContractEvent({
    address,
    abi: RIDDLE_ABI,
    eventName: "Winner",
    pollingInterval: 2000,
    onLogs: (logs) => {
      logs.forEach((log) => {
        const user = log.args.user;
        if (user && user !== zeroAddress) {
          setWinner(user);
        }
      });
    },
  });

  useEffect(() => {
    if (hasAnswered && hasAnswered !== zeroAddress) {
      setWinner(hasAnswered);
    }
  }, [hasAnswered]);

  return {
    winner,
    lookupWinner,
  };
}
