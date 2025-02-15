"use client";

import { Text, VStack } from "@chakra-ui/react";
import { CurrentRiddle } from "@repo/ui/current-riddle";
import { AnswerRiddle, LoadingAnswerRiddle } from "@repo/ui/answer-riddle";
import { SetRiddle } from "@repo/ui/set-riddle";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useIsRiddleBot } from "@repo/hooks";
import { useEffect, useState } from "react";

const riddleContractAddress = process.env
  .NEXT_PUBLIC_RIDDLE_CONTRACT_ADDRESS as Address;

export default function Main() {
  const { isConnected, address } = useAccount();
  const [isBot, setIsBot] = useState(false);

  const { isLoading, error, checkBot } = useIsRiddleBot({
    address: riddleContractAddress,
  });

  useEffect(() => {
    if (!isLoading && isConnected && address) {
      const isBot = checkBot(address);
      setIsBot(isBot);
    }
  }, [isConnected, address, checkBot, isLoading]);

  if (isLoading) {
    return <LoadingAnswerRiddle />;
  }

  if (isBot) {
    return (
      <VStack flex={1} align="center" justify="center" p={4}>
        <SetRiddle address={riddleContractAddress} />
      </VStack>
    );
  }

  return (
    <VStack flex={1} align="center" justify="center" p={4}>
      <CurrentRiddle address={riddleContractAddress} />

      {isConnected && <AnswerRiddle address={riddleContractAddress} />}
      {!isConnected && <Text>Connect to answer the riddle</Text>}
    </VStack>
  );
}
