import { metaMask, walletConnect, injected } from "wagmi/connectors";
import { http, createConfig } from "wagmi";
import { zksyncSepoliaTestnet } from "viem/zksync";

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
