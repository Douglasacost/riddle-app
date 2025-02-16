import { useEffect, useState } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "./OnChainRiddle";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];

export interface UseRiddleConfig extends BaseContractConfig {}

export function useRiddle({ address }: UseRiddleConfig) {
  const [riddle, setRiddle] = useState<string>();

  const {
    data,
    error: riddleError,
    isPending: isRiddlePending,
    refetch: refetchRiddle,
  } = useReadContract({
    address,
    abi: RIDDLE_ABI,
    functionName: "riddle",
  });

  useWatchContractEvent({
    address,
    abi: RIDDLE_ABI,
    eventName: "RiddleSet",
    pollingInterval: 5000,
    onLogs: (logs) => {
      logs.map((log) => {
        setRiddle(log.args.riddle);
      });
    },
  });

  useEffect(() => {
    if (data) {
      setRiddle(data);
    }
  }, [data]);

  return {
    // Read states
    riddle,
    isRiddlePending,
    riddleError,

    // Actions
    refetchRiddle,
  };
}
