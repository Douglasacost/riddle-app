"use client";

import * as React from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";
import { Box, Button, ButtonProps } from "@chakra-ui/react";

import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from "./menu";
import { getEnsName } from "viem/actions";

export const LoadingConnectButton = () => {
  return (
    <Button loading={true}>
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
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
  });

  const buttonText = React.useMemo(() => {
    if (ensName) {
      return ensName;
    }
    return address?.slice(0, 6) + "..." + address?.slice(-4);
  }, [ensName, address]);

  const [loading, setLoading] = React.useState(false);
  const { connect, connectors } = useConnect({
    mutation: {
      onSuccess() {
        onConnect?.();
        setLoading(false);
      },
    },
  });
  const { disconnect } = useDisconnect({
    mutation: {
      onSuccess() {
        onDisconnect?.();
        setLoading(false);
      },
    },
  });

  const handleClick = (fn: () => void) => {
    setLoading(true);
    fn();
  };

  if (isConnected) {
    return (
      <MenuRoot positioning={{ placement: "bottom-end" }}>
        <MenuTrigger asChild>
          <Button loading={loading} {...props}>
            {buttonText ? buttonText : "Connect"}
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="Disconnect" onClick={() => handleClick(disconnect)}>
            Disconnect
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    );
  }

  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button loading={loading} {...props}>
          Connect
        </Button>
      </MenuTrigger>
      <MenuContent>
        {connectors.map((connector) => (
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
