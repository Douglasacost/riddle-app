import { http, createConfig } from "wagmi";
import { zksyncSepoliaTestnet } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [zksyncSepoliaTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: "35c63ff231c4cf53cb4a6e25f9e080b2",
    }),
    metaMask(),
    safe(),
  ],
  transports: {
    [zksyncSepoliaTestnet.id]: http(),
  },
});
