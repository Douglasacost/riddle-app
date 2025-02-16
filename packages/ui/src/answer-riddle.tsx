import {
  Box,
  HStack,
  Textarea,
  Button,
  Fieldset,
  Badge,
  Text,
  Skeleton,
} from "@chakra-ui/react";
import { useRiddle, useRiddleWinner } from "@repo/hooks";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Address } from "viem";
import { toaster } from "./toaster";
import { useAccount } from "wagmi";

const MAX_ANSWER_LENGTH = 100;
const answerToastId = "answer-riddle-toast";

export const LoadingAnswerRiddle = () => {
  return (
    <>
      <Skeleton height="54px" width="400px" mb={8} />
      <Box w={{ base: "100%", md: "90%", lg: "80%" }}>
        <HStack
          gap={4}
          align="flex-start"
          width="100%"
          borderRadius="lg"
          boxShadow="0px 0px 19px 0px rgba(255,255,255,0.30)"
        >
          <Box borderRadius="lg" w="100%" flex={1} />

          <Button
            type="submit"
            h="60px"
            borderRadius="lg"
            boxShadow="inset 0px 0px 19px 0px rgba(0,0,0,0.30);"
            colorScheme="blue"
            loading={true}
          >
            Submit
          </Button>
        </HStack>
        <HStack mt={4} gap={4} align="center" justify="center">
          <Skeleton height="22px" width="400px" />
        </HStack>
      </Box>
    </>
  );
};

export function AnswerRiddle({ address }: { address: Address }) {
  const [answer, setAnswer] = useState("");
  const { address: accountAddress } = useAccount();
  const isError = answer.length > MAX_ANSWER_LENGTH;

  const {
    submit: submitAnswer,
    submitError,
    attempts,
    isConfirming,
    isConfirmed,
    transactionDetails,
  } = useRiddle({
    address,
  });

  const { winner, lookupWinner } = useRiddleWinner({
    address,
  });

  useEffect(() => {
    if (isConfirmed) {
      toaster.update(answerToastId, {
        title: "Answer submitted",
        type: "success",
        duration: 3000,
      });
      lookupWinner();
    }

    if (transactionDetails?.error) {
      const message =
        "shortMessage" in transactionDetails.error
          ? transactionDetails.error.shortMessage
          : "details" in transactionDetails.error
            ? transactionDetails.error.details
            : transactionDetails.error.message;

      toaster.update(answerToastId, {
        title: "Error submitting answer",
        description: message as string,
        type: "error",
        duration: 3000,
      });
    }
  }, [isConfirmed, transactionDetails, lookupWinner]);

  useEffect(() => {
    if (submitError) {
      const message =
        "shortMessage" in submitError
          ? submitError.shortMessage
          : "details" in submitError
            ? submitError.details
            : submitError.message;

      toaster.update(answerToastId, {
        title: "Error submitting answer",
        description: message as string,
        type: "error",
        duration: 3000,
      });
    }
  }, [submitError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isError && answer.trim()) {
      toaster.create({
        id: answerToastId,
        title: "Submitting answer...",
        type: "loading",
        duration: Infinity,
      });

      await submitAnswer(answer.toLowerCase().trim());
    }
  };

  const formatAddress = (address: Address) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <Box
      as="form"
      w={{ base: "100%", md: "90%", lg: "80%" }}
      onSubmit={handleSubmit}
    >
      {winner === accountAddress && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={90}
          tweenDuration={6000}
          gravity={0.05}
          recycle={false}
        />
      )}
      <HStack
        hidden={!!winner}
        width="100%"
        gap={4}
        align="flex-start"
        borderRadius="lg"
        boxShadow="0px 0px 19px 0px rgba(255,255,255,0.30)"
        transition="all 0.3s ease"
        overflow="hidden"
        _focusWithin={{
          boxShadow: "0px 0px 19px 0px rgba(255,255,255,1)",
        }}
      >
        <Fieldset.Root invalid={isError} disabled={isConfirming}>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            resize="none"
            fontSize="16px"
            lineHeight="20px"
            border="none"
            _focus={{
              border: "none",
            }}
            outline="none"
            overflow="hidden"
            rows={2}
            height="60px"
          />
          <Fieldset.ErrorText>
            Answer must be less than 100 characters
          </Fieldset.ErrorText>
        </Fieldset.Root>

        <Button
          type="submit"
          h="60px"
          borderRadius="lg"
          boxShadow="inset 0px 0px 19px 0px rgba(0,0,0,0.30);"
          colorScheme="blue"
          loading={isConfirming}
          disabled={isError || !answer.trim()}
        >
          Submit
        </Button>
      </HStack>
      {winner && (
        <Text
          fontSize={{ base: "16px", md: "18px", lg: "20px" }}
          fontWeight="bold"
          textAlign="center"
        >
          {winner === accountAddress
            ? "You won this riddle!"
            : `This riddle is over. The winner is ${formatAddress(winner)}.`}
        </Text>
      )}
      <HStack
        hidden={attempts.length === 0}
        mt={4}
        gap={4}
        align="center"
        justify="center"
      >
        <Text>Previous attempts: </Text>
        {attempts.map((attempt, index) => (
          <Badge key={index}>{formatAddress(attempt.user!)}</Badge>
        ))}
      </HStack>
    </Box>
  );
}
