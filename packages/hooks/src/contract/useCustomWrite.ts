import { useCallback, useState } from "react";
import { zksyncSepoliaTestnet } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { eip712WalletActions } from "viem/zksync";
import { publicClient } from "@repo/config";

export function useCustomContractWrite() {
  const account = useAccount();
  const walletClient = useWalletClient({
    account: account.address,
  });

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

        const client = walletClient.data?.extend(eip712WalletActions());
        const account = client?.account;
        const nonce = await publicClient.getTransactionCount({
          address: account?.address as `0x${string}`,
        });

        const tx = await client?.writeContract({
          nonce,
          address,
          abi,
          functionName,
          args: args,
          type: "eip712",
          chainId,
        } as any);

        if (!tx) {
          throw new Error("Failed to write to contract");
        }

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: tx,
        });

        setHash(receipt.transactionHash);

        return receipt;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to write to contract")
        );
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [walletClient]
  );

  return {
    write,
    isPending,
    error,
    hash,
  };
}
