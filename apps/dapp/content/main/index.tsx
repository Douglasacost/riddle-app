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

  const { isLoading, checkBot } = useIsRiddleBot({
    address: riddleContractAddress,
  });

  useEffect(() => {
    if (!isLoading && isConnected && address) {
      const isBot = checkBot(address);
      setIsBot(isBot);
    }
  }, [isConnected, address, checkBot, isLoading]);

  if (isBot) {
    return (
      <VStack height="80%" align="center" justify="center" p={4}>
        <SetRiddle address={riddleContractAddress} />
      </VStack>
    );
  }

  return (
    <VStack height="80%" align="center" justify="center" p={4}>
      <CurrentRiddle address={riddleContractAddress} />

      <AnswerRiddle address={riddleContractAddress} />
    </VStack>
  );
}
