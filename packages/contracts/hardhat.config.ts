import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@matterlabs/hardhat-zksync";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "ZKsyncEraSepolia",
  networks: {
    ZKsyncEraSepolia: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      verifyURL:
        "https://explorer.sepolia.era.zksync.dev/contract_verification",
      accounts: process.env.WALLET_PRIVATE_KEY
        ? [process.env.WALLET_PRIVATE_KEY]
        : [],
    },
    hardhat: {
      zksync: true,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY as string,
  },
  zksolc: {
    version: "latest",
    settings: {
      // find all available options in the official documentation
      // https://docs.zksync.io/build/tooling/hardhat/hardhat-zksync-solc#configuration
    },
  },
  solidity: {
    version: "0.8.24",
  },
};

export default config;
