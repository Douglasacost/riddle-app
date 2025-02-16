import { useCallback, useState } from "react";
import { zksyncSepoliaTestnet } from "viem/chains";
import { useWalletClient } from "wagmi";
import { eip712WalletActions } from "viem/zksync";

export function useCustomContractWrite() {
  const walletClient = useWalletClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error>();
  const [hash, setHash] = useState<`0x${string}`>();

  const write = useCallback(
    async ({
      address,
      abi,
      functionName,
      args,
      chainId = zksyncSepoliaTestnet.id,
    }: {
      address: `0x${string}`;
      abi: any[];
      functionName: string;
      args?: any[];
      chainId?: number;
    }) => {
      try {
        setIsPending(true);
        setHash(undefined);
        setError(undefined);

        const client = await walletClient.data?.extend(eip712WalletActions());
        const tx = await client?.writeContract({
          address,
          abi,
          functionName,
          args: args,
          type: "eip712",
        } as any);

        if (!tx) {
          debugger
          throw new Error("Failed to write to contract");
        }

        setHash(tx);

        return tx;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to write to contract")
        );
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [walletClient.data]
  );

  return {
    write,
    isPending,
    error,
    hash,
  };
}
