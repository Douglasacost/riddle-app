import { useCallback, useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "@repo/contracts/types";
import { Address } from "viem";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];
export interface UseRiddleContractConfig extends BaseContractConfig {}

export function useRiddleContract({ address }: UseRiddleContractConfig) {
  const [attempts, setAttempts] = useState<
    {
      user?: `0x${string}` | undefined;
      correct?: boolean | undefined;
    }[]
  >([]);

  const {
    data: riddle,
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
    eventName: "AnswerAttempt",
    pollingInterval: 2000,
    onLogs: (logs) => {
      const newAttempts = logs.map((log) => log.args);
      console.log("newAttempts", newAttempts);
      setAttempts((prev) => [...prev, ...newAttempts]);
    },
  });

  const {
    data: hash,
    error: submitError,
    isPending: isSubmitPending,
    isSuccess: isSubmitSuccess,
    writeContract: submitAnswer,
  } = useWriteContract({
    mutation: {
      onError(error) {
        console.error("Error submitting answer:", error);
      },
    },
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    ...transactionDetails
  } = useWaitForTransactionReceipt({
    hash,
  });

  const submit = useCallback(
    async (answer: string) => {
      try {
        await submitAnswer({
          address,
          abi: RIDDLE_ABI,
          functionName: "submitAnswer",
          args: [answer],
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
    // Read states
    riddle,
    isLoading: isRiddlePending,
    error: riddleError,

    // Write states
    isSubmitting: isSubmitPending,
    isSuccess: isConfirmed,
    submitError,
    transactionDetails,
    isSubmitPending,
    isSubmitSuccess,
    attempts,

    // Actions
    submit,
  };
}
