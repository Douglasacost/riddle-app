"use client";

import React, { useEffect, useMemo } from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { Box, Button, ButtonProps } from "@chakra-ui/react";

import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from "./menu";
import { toaster } from "./toaster";

export const LoadingConnectButton = () => {
  return (
    <Button
      boxShadow="inset 0px 0px 19px 0px rgba(0,0,0,0.30);"
      borderRadius="lg"
      loading={true}
    >
      Loading...
    </Button>
  );
};

export interface ConnectButtonProps {
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function ConnectButton({
  onConnect,
  onDisconnect,
  ...props
}: ConnectButtonProps & ButtonProps) {
  const { address, isConnected, connector, isConnecting } = useAccount();
  const { data: ensName } = useEnsName({
    address,
  });

  const buttonText = useMemo(() => {
    if (ensName) {
      return ensName;
    }
    return address?.slice(0, 6) + "..." + address?.slice(-4);
  }, [ensName, address]);

  const {
    connect,
    connectors,
    error: connectError,
  } = useConnect({
    mutation: {
      onSuccess() {
        onConnect?.();
      },
    },
  });

  const {
    disconnect,
    isPending: isDisconnecting,
    error: disconnectError,
  } = useDisconnect({
    mutation: {
      onSuccess() {
        onDisconnect?.();
        connector?.disconnect();
      },
    },
  });

  useEffect(() => {
    const error = connectError || disconnectError;
    if (error) {
      toaster.create({
        title: "Error",
        description: error.message.split(".")[0],
        type: "error",
      });
    }
  }, [connectError, disconnectError]);

  const connectorsToUse = useMemo(() => {
    return connectors.filter((connector) =>
      ["MetaMask", "WalletConnect", "Talisman"].includes(connector.name)
    );
  }, [connectors]);

  const handleClick = (fn: () => void) => {
    fn();
  };

  if (isConnected) {
    return (
      <MenuRoot positioning={{ placement: "bottom-end" }}>
        <MenuTrigger asChild>
          <Button
            boxShadow="inset 0px 0px 19px 0px rgba(0,0,0,0.30);"
            borderRadius="lg"
            loading={isDisconnecting}
            {...props}
          >
            {buttonText}
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem
            value="Disconnect"
            onClick={() =>
              handleClick(() =>
                disconnect({
                  connector,
                })
              )
            }
          >
            Disconnect
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    );
  }

  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button
          boxShadow="inset 0px 0px 19px 0px rgba(0,0,0,0.30);"
          borderRadius="lg"
          loading={isConnecting}
          {...props}
        >
          Connect
        </Button>
      </MenuTrigger>
      <MenuContent>
        {connectorsToUse.map((connector) => (
          <MenuItem
            key={connector.uid}
            value={connector.name}
            onClick={() => handleClick(() => connect({ connector }))}
          >
            <Box flex="1">{connector.name}</Box>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
}
