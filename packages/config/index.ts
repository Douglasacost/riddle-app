import { metaMask, walletConnect, injected } from "wagmi/connectors";
import { http, createConfig } from "wagmi";
import { eip712WalletActions, zksyncSepoliaTestnet } from "viem/zksync";
import { createPublicClient } from "viem";

export const publicClient = createPublicClient({
  chain: zksyncSepoliaTestnet,
  transport: http(),
}).extend(eip712WalletActions());

export const config = createConfig({
  chains: [zksyncSepoliaTestnet],
  ssr: true,
  connectors: [
    injected(),
    walletConnect({
      projectId: "35c63ff231c4cf53cb4a6e25f9e080b2",
    }),
    metaMask(),
  ],
  transports: {
    [zksyncSepoliaTestnet.id]: http(),
  },
});
