import { useCallback, useMemo, useState } from "react";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { BaseContractConfig } from "./types";
import { Address } from "viem";
import OnChainRiddle from "@repo/contracts/abi";
import { OnChainRiddle$Type } from "./OnChainRiddle";
import { useCustomContractWrite } from "./useCustomWrite";

const RIDDLE_ABI = OnChainRiddle.abi as OnChainRiddle$Type["abi"];

export interface UseRiddleConfig extends BaseContractConfig {}

export function useRiddle({ address }: UseRiddleConfig) {
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

  const [attempts, setAttempts] = useState<
    Array<{
      user: Address;
      correct: boolean;
    }>
  >([]);

  const isActive = useMemo(() => {
    return riddle !== undefined && riddle.length > 0;
  }, [riddle]);

  useWatchContractEvent({
    address,
    abi: RIDDLE_ABI,
    eventName: "AnswerAttempt",
    pollingInterval: 2000,
    onLogs: (logs) => {
      const newAttempts = logs.map((log) => ({
        user: log.args.user as Address,
        correct: log.args.correct as boolean,
      }));
      setAttempts((prev) => [...newAttempts, ...prev].slice(0, 10)); // Keep last 10 attempts
    },
  });

  const {
    hash,
    write,
    isPending,
    error,
  } = useCustomContractWrite();

  const {
    isSuccess: isConfirmed,
    isLoading: isConfirming,
    ...transactionDetails
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 10000,
  });

  const submit = useCallback(
    async (answer: string) => {
      if (!answer.trim() || !address) return false;

      try {
        await write({
          address,
          abi: RIDDLE_ABI,
          functionName: "submitAnswer",
          args: [answer.toLowerCase().trim()],
          type: "eip712",
        } as any);
        return true;
      } catch (error) {
        console.error("Error submitting answer:", error);
        return false;
      }
    },
    [address, write]
  );

  return {
    // Read states
    riddle,
    isRiddlePending,
    riddleError,
    isActive,

    // Write states
    isConfirmed,
    isConfirming,
    isSubmitting: isPending,
    submitError: error,
    transactionDetails,

    // Attempt tracking
    attempts,

    // Actions
    submit,
    refetchRiddle,
  };
}
