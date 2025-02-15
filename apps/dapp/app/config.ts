import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: "35c63ff231c4cf53cb4a6e25f9e080b2",
    }),
    metaMask(),
    safe(),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
