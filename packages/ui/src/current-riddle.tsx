import { Box, Text, Skeleton } from "@chakra-ui/react";
import { useRiddleContract } from "@repo/hooks";
import { Address } from "viem";

export function CurrentRiddle({ address }: { address: Address }) {
  const { isLoading, error, riddle } = useRiddleContract({
    address,
  });

  if (error) {
    return (
      <Box p={4} mb={8} bg="red.50" borderRadius="md">
        <Text color="red.500">Error loading riddle: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Skeleton loading={isLoading} minH="20px">
      <Text fontSize="4xl" textAlign="center" mb={8} fontWeight="bold">
        {(riddle as string) || "No active riddle"}
      </Text>
    </Skeleton>
  );
}
