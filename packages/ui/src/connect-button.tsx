"use client";

import * as React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export interface ConnectButtonProps {
  className?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function ConnectButton({
  className = "",
  onConnect,
  onDisconnect,
}: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect({
    mutation: {
      onSuccess() {
        onConnect?.();
      },
    },
  });
  const { disconnect } = useDisconnect({
    mutation: {
      onSuccess() {
        onDisconnect?.();
      },
    },
  });

  if (isConnected) {
    return (
      <button onClick={() => disconnect()} className={className}>
        {address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : "Connected"}
      </button>
    );
  }

  return (
    <>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className={className}
        >
          Connect {connector.name}
        </button>
      ))}
    </>
  );
}
