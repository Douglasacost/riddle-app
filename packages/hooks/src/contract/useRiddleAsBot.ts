import { useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "@repo/contracts/types";
import { Address, keccak256, toBytes } from "viem";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];
export interface UseRiddleAsBotConfig extends BaseContractConfig {}

export function useRiddleAsBot({
  address,
}: UseRiddleAsBotConfig) {
  const {
    data: hash,
    error: submitError,
    writeContract: submitAnswer,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    ...transactionDetails
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 10000,
    pollingInterval: 1000,
  });

  const submit = useCallback(
    async (riddle: string, answer: string) => {
      try {
        const hashedAnswer = keccak256(toBytes(answer));
        await submitAnswer({
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
    [address, submitAnswer]
  );

  return {
    // Write states
    isConfirming,
    isConfirmed,
    submitError,
    transactionDetails,

    // Actions
    submit,
  };
}
