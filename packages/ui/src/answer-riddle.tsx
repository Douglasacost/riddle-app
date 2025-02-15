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
import { useRiddleContract } from "@repo/hooks";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { toaster } from "./toaster";

const MAX_ANSWER_LENGTH = 100;
const answerToastId = "answer-riddle-toast";

export const LoadingAnswerRiddle = () => {
  return (
    <Box>
      <HStack gap={4} align="flex-start">
        <Fieldset.Root>
          <Skeleton height="40px" width="400px" />
        </Fieldset.Root>

        <Button type="submit" colorScheme="blue" loading={true}></Button>
      </HStack>
      <HStack mt={4} gap={4} align="center" justify="center">
        <Skeleton height="40px" width="400px" />
      </HStack>
    </Box>
  );
};

export function AnswerRiddle({ address }: { address: Address }) {
  const [answer, setAnswer] = useState("");
  const isError = answer.length > MAX_ANSWER_LENGTH;

  const {
    submit: submitAnswer,
    isSubmitting,
    isSuccess,
    submitError,
    isSubmitSuccess,
    transactionDetails,
    isSubmitPending,
    attempts,
  } = useRiddleContract({
    address,
  });

  useEffect(() => {
    if (isSuccess) {
      toaster.update(answerToastId, {
        title: "Answer submitted",
        type: "success",
        duration: 3000,
      });
    }

    if (transactionDetails?.status === "error") {
      const reason = transactionDetails.error?.message;
      toaster.update(answerToastId, {
        title: "Answer submission reverted",
        description: reason,
        type: "error",
        duration: 3000,
      });
    }

    if (transactionDetails?.error) {
      const error = transactionDetails?.error;
      const message =
        "shortMessage" in error
          ? error.shortMessage
          : "details" in error
            ? error.details
            : error.message;

      toaster.update(answerToastId, {
        title: "Something went wrong",
        description: message as string,
        type: "error",
        duration: 3000,
      });
    }
  }, [isSuccess, transactionDetails]);

  useEffect(() => {
    if (isSubmitting) {
      toaster.create({
        id: answerToastId,
        title: "Submitting answer...",
        type: "loading",
        duration: Infinity,
      });
    }
    if (isSubmitSuccess) {
      toaster.update(answerToastId, {
        title: "Confirming...",
        type: "loading",
        duration: Infinity,
      });
    }

    if (submitError) {
      console.log("submitError", submitError);
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
      setAnswer("");
    }
  }, [isSubmitSuccess, submitError, isSubmitPending, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isError && answer.trim()) {
      await submitAnswer(answer.toLowerCase().trim());
    }
  };

  const formatAddress = (address: Address) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <HStack gap={4} align="flex-start">
        <Fieldset.Root invalid={isError} disabled={isSubmitting}>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            maxW="400px"
            resize="vertical"
          />
          <Fieldset.ErrorText>
            Answer must be less than 100 characters
          </Fieldset.ErrorText>
        </Fieldset.Root>

        <Button
          type="submit"
          colorScheme="blue"
          loading={isSubmitting}
          disabled={isError || !answer.trim()}
        >
          Submit
        </Button>
      </HStack>
      <HStack mt={4} gap={4} align="center" justify="center">
        <Text>Previous attempts: </Text>
        {attempts.map((attempt, index) => (
          <Badge key={index}>{formatAddress(attempt.user!)}</Badge>
        ))}
      </HStack>
    </Box>
  );
}
