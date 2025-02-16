import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { BaseContractConfig } from "./types";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "@repo/contracts/types";
import { Address, keccak256, toBytes } from "viem";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];
export interface UseRiddleContractAsBotConfig extends BaseContractConfig {}

export function useRiddleContractAsBot({ address }: UseRiddleContractAsBotConfig) {
  const {
    data: hasAnswered,
    error: hasAnsweredError,
    isPending: isHasAnsweredPending,
    refetch: refetchHasAnswered,
  } = useReadContract({
    address,
    abi: RIDDLE_ABI,
    functionName: "winner",
  });

  const {
    data: hash,
    error: submitError,
    isPending: isSubmitPending,
    isSuccess: isSubmitSuccess,
    writeContract: submitAnswer,
  } = useWriteContract({
    mutation: {
      onSuccess() {
        refetchHasAnswered();
      },
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

  const refresh = useCallback(() => {
    refetchHasAnswered();
  }, [refetchHasAnswered]);

  return {
    // Read states
    hasAnswered,
    isLoadingHasAnswered: isHasAnsweredPending,
    errorHasAnswered: hasAnsweredError,

    // Write states
    isSubmitting: isSubmitPending || isConfirming,
    isSuccess: isConfirmed,
    submitError,
    transactionDetails,
    isSubmitSuccess,

    // Actions
    submit,
    refresh
  };
}
