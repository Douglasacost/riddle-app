"use client";

import { Text, VStack } from "@chakra-ui/react";
import { LoadingConnectButton } from "@repo/ui/connect-button";
import dynamic from "next/dynamic";

const ConnectButton = dynamic(
  () => import("@repo/ui/connect-button").then((mod) => mod.ConnectButton),
  {
    ssr: false,
    loading: () => <LoadingConnectButton />,
  }
);

export default function Header() {
  return (
    <VStack justify="space-between" align="center" p={4}>
      <Text fontSize="2xl" fontWeight="bold">
        Riddle Dapp
      </Text>
      <ConnectButton />
    </VStack>
  );
}
