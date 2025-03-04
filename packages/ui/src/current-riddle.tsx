import { Box, Text, Skeleton } from "@chakra-ui/react";
import { useRiddle } from "@repo/hooks";
import { Address } from "viem";

export function CurrentRiddle({ address }: { address: Address }) {
  const { isRiddlePending, riddleError, riddle } = useRiddle({
    address,
  });

  if (riddleError) {
    return (
      <Box p={4} mb={8} bg="red.50" borderRadius="md">
        <Text color="red.500">Error loading riddle: {riddleError.message}</Text>
      </Box>
    );
  }

  return (
    <Skeleton
      loading={isRiddlePending}
      w="80%"
      justifyContent="center"
      display="flex"
      h="100px"
      mb={8}
    >
      <Text
        key={riddle}
        alignSelf="flex-end"
        fontSize="4xl"
        textAlign="center"
        fontWeight="bold"
      >
        {(riddle as string) || "No active riddle"}
      </Text>
    </Skeleton>
  );
}
