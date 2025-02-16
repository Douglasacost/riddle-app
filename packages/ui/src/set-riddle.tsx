import {
  Button,
  Fieldset,
  Input,
  Stack,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useRiddleContractAsBot } from "@repo/hooks";
import { Address } from "viem";
import { toaster } from "./toaster";
import { useEffect } from "react";
import { Field } from "./field";

const setRiddleToastId = "set-riddle-toast";

export function SetRiddle({ address }: { address: Address }) {
  const {
    submit: submitRiddle,
    submitError,
    isConfirmed,
    isConfirming,
    transactionDetails,
  } = useRiddleContractAsBot({
    address,
  });

  useEffect(() => {
    if (isConfirmed) {
      toaster.update(setRiddleToastId, {
        title: "Riddle set",
        type: "success",
        duration: 3000,
      });
    }

    if (transactionDetails?.error) {
      const message =
        "shortMessage" in transactionDetails.error
          ? transactionDetails.error.shortMessage
          : "details" in transactionDetails.error
            ? transactionDetails.error.details
            : transactionDetails.error.message;

      toaster.update(setRiddleToastId, {
        title: "Error setting riddle",
        description: message as string,
        type: "error",
        duration: 3000,
      });
    }
  }, [isConfirmed, transactionDetails]);

  useEffect(() => {
    if (submitError) {
      const message =
        "shortMessage" in submitError
          ? submitError.shortMessage
          : "details" in submitError
            ? submitError.details
            : submitError.message;

      toaster.update(setRiddleToastId, {
        title: "Error setting riddle",
        description: message as string,
        type: "error",
        duration: 3000,
      });
    }
  }, [submitError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const riddle = (e.target as HTMLFormElement).riddle.value;
    const answer = (e.target as HTMLFormElement).answer.value;

    if (!riddle || !answer) {
      return;
    }

    toaster.create({
      id: setRiddleToastId,
      title: "Setting riddle...",
      type: "loading",
      duration: Infinity,
    });

    await submitRiddle(riddle.trim(), answer.trim().toLowerCase());
  };

  return (
    <VStack as="form" onSubmit={handleSubmit}>
      <Fieldset.Root size="lg" maxW="md" disabled={isConfirmed}>
        <Stack>
          <Fieldset.Legend>Set Riddle</Fieldset.Legend>
          <Fieldset.HelperText>
            Please provide the riddle and answer below.
          </Fieldset.HelperText>
        </Stack>

        <Fieldset.Content>
          <Field label="Riddle">
            <Textarea name="riddle" />
          </Field>

          <Field label="Answer">
            <Input name="answer" />
          </Field>
        </Fieldset.Content>

        <Button type="submit" alignSelf="flex-start" loading={isConfirming}>
          Submit
        </Button>
      </Fieldset.Root>
    </VStack>
  );
}
