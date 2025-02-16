import { useCallback } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { Address, keccak256, toBytes } from "viem";
import { OnChainRiddle$Type } from "./OnChainRiddle";
import { useCustomContractWrite } from "./useCustomWrite";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];

export interface UseRiddleAsBotConfig extends BaseContractConfig {}

export function useRiddleAsBot({ address }: UseRiddleAsBotConfig) {
  const { hash, write, error } = useCustomContractWrite();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    ...transactionDetails
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 10000,
  });

  const submit = useCallback(
    async (riddle: string, answer: string) => {
      try {
        const hashedAnswer = keccak256(toBytes(answer));
        write({
          address,
          abi: RIDDLE_ABI,
          functionName: "setRiddle",
          args: [riddle, hashedAnswer],
        });
        return true;
      } catch (error) {
        console.error("Error submitting answer:", error);
        return false;
      }
    },
    [address, write]
  );

  return {
    // Write states
    isConfirming,
    isConfirmed,
    submitError: error,
    transactionDetails,

    // Actions
    submit,
  };
}
