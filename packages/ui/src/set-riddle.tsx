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
    isSubmitting,
    isSuccess,
    submitError,
    isSubmitSuccess,
    transactionDetails,
  } = useRiddleContractAsBot({
    address,
  });

  useEffect(() => {
    if (isSuccess) {
      toaster.update(setRiddleToastId, {
        title: "Riddle set",
        type: "success",
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

      toaster.update(setRiddleToastId, {
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
        id: setRiddleToastId,
        title: "Submitting riddle...",
        type: "loading",
        duration: Infinity,
      });
    }
    if (isSubmitSuccess) {
      toaster.update(setRiddleToastId, {
        title: "Confirming...",
        type: "loading",
        duration: Infinity,
      });
    }

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
  }, [isSubmitSuccess, submitError, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const riddle = (e.target as HTMLFormElement).riddle.value;
    const answer = (e.target as HTMLFormElement).answer.value;

    if (!riddle || !answer) {
      return;
    }
    await submitRiddle(riddle.trim(), answer.trim().toLowerCase());
  };

  return (
    <VStack as="form" onSubmit={handleSubmit}>
      <Fieldset.Root size="lg" maxW="md">
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

        <Button type="submit" alignSelf="flex-start" loading={isSubmitting}>
          Submit
        </Button>
      </Fieldset.Root>
    </VStack>
  );
}
