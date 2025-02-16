import { useCallback, useMemo, useState } from "react";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWatchPendingTransactions,
} from "wagmi";
import { BaseContractConfig } from "./types";
import { Address, decodeEventLog } from "viem";
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

  const [asserted, setAsserted] = useState<boolean>();

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
      setAttempts((prev) => [...newAttempts, ...prev].slice(0, 3)); // Keep last 10 attempts
    },
  });

  useWatchContractEvent({
    address,
    abi: RIDDLE_ABI,
    eventName: "RiddleSet",
    pollingInterval: 5000,
    onLogs: (logs) => {
      setAttempts([]);
      setAsserted(undefined);
      refetchRiddle();
    },
  });

  const { hash, write, isPending, error } = useCustomContractWrite();

  const {
    isSuccess: isConfirmed,
    isLoading: isConfirming,
    data: receipt,
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
        setAsserted(undefined);
        const receipt = await write({
          address,
          abi: RIDDLE_ABI,
          functionName: "submitAnswer",
          args: [answer.toLowerCase().trim()],
        });

        receipt.logs
          .filter((log) => {
            return log.address.toLowerCase() === address.toLowerCase();
          })
          .forEach((log) => {
            const topics = log.topics;
            const decoded = decodeEventLog({
              abi: RIDDLE_ABI,
              data: log.data,
              topics,
            });

            if (decoded.eventName === "AnswerAttempt") {
              setAsserted(decoded.args.correct);
              setAttempts([]);
            }
          });

        return receipt;
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
    asserted,

    // Actions
    submit,
    refetchRiddle,
  };
}
